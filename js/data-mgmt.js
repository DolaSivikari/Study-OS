// ==================== DATA MANAGEMENT (V29.1) ====================
function collectSnapshotData(){
  const snapshot = {};
  snapshot.__presentKeys = [];
  Object.keys(K).forEach(name => {
    if (localStorage.getItem(K[name]) === null) return;
    snapshot[name] = get(K[name]);
    snapshot.__presentKeys.push(name);
  });
  snapshot.__schemaVersion = parseInt(localStorage.getItem(STORAGE_SCHEMA_KEY) || String(DATA_SCHEMA_VERSION), 10);
  try { snapshot.__metrics = window.METRICS?.snapshot ? METRICS.snapshot() : null; }
  catch (e) { snapshot.__metrics = null; }
  snapshot.__exportedAt = new Date().toISOString();
  return snapshot;
}

function validateSnapshotData(data){
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Backup must contain a JSON object');
  const known = Object.keys(K).filter(name => Object.prototype.hasOwnProperty.call(data, name));
  if (!known.length) throw new Error('No StudyOS data keys found');
  const version = parseInt(data.__schemaVersion || '0', 10) || 0;
  if (version > DATA_SCHEMA_VERSION) throw new Error('Backup was created by a newer StudyOS schema');
  const arrays = new Set(['goals','tasks','time','habits','habitLogs','journal','events','flashcards','cardReviewDetails','focusSessions','contacts','quotes','decisions','doctrineLogs','doctrineCustomModules','doctrineLinks','scenarioHistory','practiceQueue','learningCycles','profileFeedback','qualityReviews','captureInbox','entityLinks']);
  const objects = new Set(['settings','cardReviews','weeklyReviews','discipline','protocol','learnProgress','pmpProgress','pomodoroStats','strategicHorizon','frameworkLab','doctrineSourcesState','intel','commitmentPrefs','practiceQuality','commTracker','energyTracker','principlesTracker','cebokTracker','doctrineDomainOverrides','doctrineModelOverrides','adaptiveProfile']);
  known.forEach(name => {
    const value = data[name];
    if (value === null || value === undefined) return;
    if (arrays.has(name) && !Array.isArray(value)) throw new Error('Backup key "' + name + '" must be an array');
    if (objects.has(name) && (typeof value !== 'object' || Array.isArray(value))) throw new Error('Backup key "' + name + '" must be an object');
  });
  return { version, knownKeys: known };
}

async function writeSnapshotValues(data){
  // A restore is exact, not a merge. Clear both storage layers first so keys
  // omitted by an older backup cannot leave unrelated newer data behind.
  const existingKeys = [];
  for (let i = 0; i < localStorage.length; i++) existingKeys.push(localStorage.key(i));
  existingKeys.filter(key => key && (key.startsWith('hcc_') || key.startsWith('studyos_'))).forEach(key => localStorage.removeItem(key));
  await STORAGE.clearLargeStore();

  Object.keys(K).forEach(name => {
    if (!Object.prototype.hasOwnProperty.call(data, name)) return;
    if (data[name] === null || data[name] === undefined) return;
    localStorage.setItem(K[name], JSON.stringify(data[name]));
  });
  const sourceVersion = parseInt(data.__schemaVersion || '0', 10) || 0;
  localStorage.setItem(STORAGE_SCHEMA_KEY, String(sourceVersion));
  const migration = runSchemaMigrations();
  await STORAGE.syncLargeKeysFromLocal();
  return migration;
}

async function applySnapshotData(data, options){
  options = options || {};
  validateSnapshotData(data);
  const before = collectSnapshotData();
  const registered = new Set(Object.values(K).concat([STORAGE_SCHEMA_KEY]));
  const unregisteredBefore = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i) || '';
    if ((key.startsWith('hcc_') || key.startsWith('studyos_')) && !registered.has(key)) unregisteredBefore[key] = localStorage.getItem(key);
  }
  try {
    const migration = await writeSnapshotValues(data);
    if (window.METRICS?.invalidate) METRICS.invalidate();
    if (options.emit !== false) EVENTS.emit('system:restored', { importedAt: new Date().toISOString(), migration });
    return { ok:true, migration };
  } catch (error) {
    try {
      await writeSnapshotValues(before);
      Object.keys(unregisteredBefore).forEach(key => localStorage.setItem(key, unregisteredBefore[key]));
    } catch (rollbackError) { console.error('Snapshot rollback failed', rollbackError); }
    throw error;
  }
}

async function clearStudyOSData(options){
  options = options || {};
  const keys = [];
  for (let i = 0; i < localStorage.length; i++) keys.push(localStorage.key(i));
  keys.filter(key => key && (key.startsWith('hcc_') || key.startsWith('studyos_'))).forEach(key => localStorage.removeItem(key));
  await STORAGE.clearLargeStore();

  let migration = null;
  if (options.initialize !== false) {
    migration = runSchemaMigrations();
    await STORAGE.syncLargeKeysFromLocal();
  }
  if (window.METRICS?.invalidate) METRICS.invalidate();
  if (options.emit !== false) EVENTS.emit('system:reset', { at: Date.now(), migration });
  return { ok:true, migration };
}

function exportData(){
  const data = collectSnapshotData();
  const blob = new Blob([JSON.stringify(data,null,2)], {type:'application/json'});
  const href = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = href;
  a.download = 'studyos_backup_' + today().replace(/-/g,'') + '.json';
  a.click();
  setTimeout(() => URL.revokeObjectURL(href), 0);
  if (typeof markBackup === 'function') markBackup();
  toast('Snapshot exported');
}

function importData(e){
  const file = e.target.files[0];
  if(!file) return;
  const reader = new FileReader();
  reader.onload = async function(ev){
    try {
      const data = JSON.parse(ev.target.result);
      await applySnapshotData(data);
      toast('Snapshot imported and migrated');
      if (typeof refreshActiveDataSurface === 'function') refreshActiveDataSurface();
      if (typeof refreshDashboard === 'function') refreshDashboard();
      if (typeof renderSystemHealth === 'function') renderSystemHealth();
    } catch(err) {
      console.error(err);
      toast('Import failed — current data restored');
    }
  };
  reader.readAsText(file);
  e.target.value='';
}

async function resetData(){
  if(!confirm('Delete ALL StudyOS data from this browser?')) return;
  if(!confirm('This cannot be undone unless you exported a backup. Continue?')) return;
  try {
    await clearStudyOSData();
    toast('Reset complete');
    if(typeof refreshActiveDataSurface==='function') refreshActiveDataSurface();
    if(typeof refreshDashboard==='function') refreshDashboard();
    if(typeof renderSystemHealth==='function') renderSystemHealth();
  } catch (error) {
    console.error(error);
    toast('Reset failed — export a backup and retry');
  }
}

window.collectSnapshotData = collectSnapshotData;
window.applySnapshotData = applySnapshotData;
window.clearStudyOSData = clearStudyOSData;
