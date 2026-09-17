window.STUDYOS_PAGES = window.STUDYOS_PAGES || {};

window.STUDYOS_PAGES.system = String.raw`
<div class="page" id="system">
            <div class="page-header">
                <div>
                    <h2>⚙️ System</h2>
                    <p style="color:var(--text-muted);">User guide, settings, backups, system health, and diagnostics.</p>
                </div>
            </div>
        <div class="filter-bar" id="systemTabs">
            <button class="filter-btn active" onclick="goTab('system','guide')">📖 User Guide</button>
            <button class="filter-btn" onclick="goTab('system','profilelab')">◇ Profile Lab</button>
            <button class="filter-btn" onclick="goTab('system','settings')">⚙️ Settings</button>
            <button class="filter-btn" onclick="goTab('system','health')">🏥 System Health</button>
            <button class="filter-btn" onclick="goTab('system','diagnostics')">🧪 Diagnostics</button>
        </div>
        <div class="tab-panel" id="tab-guide">
<div class="page-header">
                <div>
                    <h2 style="font-size:1.6rem;font-weight:700;margin-bottom:4px;display:flex;align-items:center;gap:10px;">
                        <span>📖</span> StudyOS Guide
                    </h2>
                    <p style="color:var(--text-muted);font-size:0.85rem;">Manual, science, your profile, and workflows</p>
                </div>
            </div>
            <div id="guideTabs" style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:16px;"></div>
            <div id="guideContainer"></div>
        </div>
        <div class="tab-panel" id="tab-profilelab" style="display:none;">
            <div class="page-header">
                <div>
                    <h2><span>◇</span> Adaptive Profile Lab</h2>
                    <p>Assessment hypotheses, observed behavior, and user-controlled prompts.</p>
                </div>
            </div>
            <div id="profileLabRoot"></div>
        </div>
        <div class="tab-panel" id="tab-settings" style="display:none;">
<div class="page-header">
                <div>
                    <h2>
                        <span>⚙️</span> Settings
                    </h2>
                    <p>Customize your command center</p>
                </div>
            </div>
            
            <!-- Backup Reminder -->
            <div class="card" style="margin-bottom:16px;background:linear-gradient(135deg, var(--bg-secondary), rgba(249,115,22,0.1));border-color:var(--accent);" id="backupReminder">
                <div style="display:flex;align-items:center;gap:14px;">
                    <span style="font-size:2rem;">💾</span>
                    <div style="flex:1;">
                        <div style="font-weight:600;">Weekly Backup Reminder</div>
                        <div style="font-size:0.85rem;color:var(--text-muted);" id="lastBackupText">Last backup: Never</div>
                    </div>
                    <button class="btn btn-primary btn-sm" onclick="exportData();markBackup();">Backup Now</button>
                </div>
            </div>
            
            <!-- Profile -->
            <div class="card" style="margin-bottom:16px;">
                <div style="font-size:0.75rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:16px;">👤 Profile</div>
                <div class="form-group">
                    <label class="form-label" for="settingName">Name</label>
                    <input type="text" class="form-input" id="settingName" value="Hebun">
                </div>
                <div class="form-group">
                    <label class="form-label" for="settingVision">Vision Statement</label>
                    <textarea class="form-textarea" id="settingVision" placeholder="Who are you becoming?" style="min-height:80px;"></textarea>
                </div>
                <div class="form-group">
                    <label class="form-label" for="settingValues">Core Values (comma separated)</label>
                    <input type="text" class="form-input" id="settingValues" placeholder="Discipline, Excellence, Growth">
                </div>
                <button class="btn btn-primary" onclick="saveSettings()">💾 Save Profile</button>
            </div>
            
            <!-- Quick Stats for Resume -->
            <div class="card" style="margin-bottom:16px;">
                <div style="font-size:0.75rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:16px;">📊 Progress Summary (for interviews)</div>
                <div id="progressSummary"></div>
                <button class="btn btn-secondary" onclick="copyProgressSummary()" style="margin-top:12px;">📋 Copy Summary</button>
            </div>
            
            <!-- Learning Science Settings -->
            <div class="card" style="margin-bottom:16px;border-left:3px solid var(--purple);">
                <div style="font-size:0.75rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:16px;">🧠 Learning Science (Make It Stick)</div>
                
                <div class="form-group" style="margin-bottom:16px;">
                    <label class="form-label" for="settingSpacingStretch">Spacing Stretch: <span id="stretchLabel">10%</span></label>
                    <div style="font-size:0.75rem;color:var(--text-muted);margin-bottom:6px;">Extends SRS intervals beyond defaults. Harder retrieval = stronger memory.</div>
                    <input type="range" id="settingSpacingStretch" min="0" max="30" value="10" style="width:100%;" oninput="document.getElementById('stretchLabel').textContent=this.value+'%'">
                    <div style="display:flex;justify-content:space-between;font-size:0.7rem;color:var(--text-muted);"><span>0% (standard)</span><span>30% (challenging)</span></div>
                </div>
                
                <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px;">
                    <input type="checkbox" id="settingInterleave" checked style="width:18px;height:18px;accent-color:var(--accent);">
                    <div>
                        <div style="font-weight:500;font-size:0.9rem;">Interleave by Default</div>
                        <div style="font-size:0.75rem;color:var(--text-muted);">Mix cards from all categories during review.</div>
                    </div>
                </div>
                
                <div style="display:flex;align-items:center;gap:12px;">
                    <input type="checkbox" id="settingElaboration" style="width:18px;height:18px;accent-color:var(--accent);">
                    <div>
                        <div style="font-weight:500;font-size:0.9rem;">Require Elaboration</div>
                        <div style="font-size:0.75rem;color:var(--text-muted);">Force elaboration prompt after every study session.</div>
                    </div>
                </div>
            </div>
            
            <!-- Data Management -->
            <div class="card" style="margin-bottom:16px;">
                <div style="font-size:0.75rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:16px;">💾 Data Management</div>
                <div style="display:flex;gap:10px;flex-wrap:wrap;">
                    <button class="btn btn-secondary" onclick="exportData()" style="display:flex;align-items:center;gap:6px;">
                        <span>📤</span> Export JSON
                    </button>
                    <button class="btn btn-secondary" onclick="document.getElementById('importFile').click()" style="display:flex;align-items:center;gap:6px;">
                        <span>📥</span> Import Data
                    </button>
                    <input type="file" id="importFile" accept=".json" style="display:none" onchange="importData(event)">
                </div>
            </div>
            
            <!-- Danger Zone -->
            <div class="card" style="border-color:var(--danger);">
                <div style="font-size:0.75rem;color:var(--danger);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:16px;">⚠️ Danger Zone</div>
                <button class="btn btn-danger" onclick="resetData()" style="display:flex;align-items:center;gap:6px;">
                    <span>🗑️</span> Reset All Data
                </button>
                <div style="font-size:0.75rem;color:var(--text-muted);margin-top:8px;">This will permanently delete all your data. Export a backup first!</div>
            </div>
        </div>
        <div class="tab-panel" id="tab-health" style="display:none;">
<div class="page-header">
                <div>
                    <h1>System Health</h1>
                    <div class="subtitle">Storage, engines, learning balance, and capability coverage.</div>
                </div>
                <div class="page-actions">
                    <button class="btn btn-primary" onclick="renderSystemHealth()">Refresh Health</button>
                </div>
            </div>
            <div id="systemHealthRoot"></div>
        </div>
        <div class="tab-panel" id="tab-diagnostics" style="display:none;">
<div class="page-header">
                <div>
                    <h1>Diagnostics</h1>
                    <div class="subtitle">Runtime contracts, navigation, storage restoration, and end-to-end learning workflow verification.</div>
                </div>
                <div class="page-actions">
                    <button class="btn btn-primary" onclick="studyosLazyRender('diagnostics','runDiagnosticsSuite')">Run Core Suite</button><!-- V56 audit R10: lazy-safe (diagnostics.js loads on demand) -->
                </div>
            </div>
            <div id="diagnosticsRoot" class="card"></div>
        </div>
        </div>
    `;
