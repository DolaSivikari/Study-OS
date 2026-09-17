// ==================== STORAGE, SCHEMA, EVENTS & UTILITIES ====================
const K = {
    settings:'hcc_settings', goals:'hcc_goals', tasks:'hcc_tasks', time:'hcc_time',
    habits:'hcc_habits', habitLogs:'hcc_habitLogs', journal:'hcc_journal',
    discipline:'hcc_discipline', protocol:'hcc_protocol', learnProgress:'hcc_learn',
    knowledge:'hcc_knowledge', onboarding:'hcc_onboarding', events:'hcc_events',
    flashcards:'hcc_flashcards', cardReviews:'hcc_cardReviews', cardReviewDetails:'hcc_cardReviews_detail', weeklyReviews:'hcc_weeklyReviews',
    focusSessions:'hcc_focusSessions', contacts:'hcc_contacts', pmpProgress:'hcc_pmpProgress',
    quotes:'hcc_quotes', pomodoroStats:'hcc_pomodoroStats', decisions:'hcc_decisions',
    strategicHorizon:'hcc_strategicHorizon', frameworkLab:'studyos_framework_lab_v1',
    doctrineLogs:'studyos_doctrine_logs_v1', doctrineSourcesState:'studyos_doctrine_sources_state_v1',
    doctrineCustomModules:'studyos_doctrine_custom_modules_v1', doctrineLinks:'studyos_doctrine_links_v1',
    doctrineDomainOverrides:'studyos_doctrine_domain_overrides_v1', doctrineModelOverrides:'studyos_doctrine_model_overrides_v1',
    doctrineView:'studyos_doctrine_view_v1',
    sessionContext:'studyos_session_context_v1', intel:'studyos_intel_v1',
    commitmentPrefs:'studyos_commitment_preferences_v1',
    practiceQuality:'hcc_practiceQuality', lastBackup:'hcc_lastBackup',
    commTracker:'hcc_commTracker', energyTracker:'hcc_energyTracker',
    principlesTracker:'hcc_principlesTracker', scenarioHistory:'hcc_scenarioHistory',
    practiceQueue:'studyos_practice_queue_v1',
    learningCycles:'studyos_learning_cycles_v1',
    adaptiveProfile:'studyos_adaptive_profile_v1',
    profileFeedback:'studyos_profile_feedback_v1',
    qualityReviews:'studyos_quality_reviews_v1',
    cebokTracker:'hcc_cebokTracker',
    captureInbox:'studyos_capture_inbox_v1', entityLinks:'studyos_entity_links_v1',
    quranReadPreferences:'studyos_quran_read_preferences_v48',
    quranAudioPreferences:'studyos_quran_audio_preferences_v52',
    quranStudyData:'studyos_quran_study_v54',
    quranFollowAlong:'studyos_quran_follow_along_v1',
    dailyQuranLastReference:'studyos_daily_quran_last_reference_v49'
};

const STORAGE_SCHEMA_KEY = 'studyos_schema_version';
const DATA_SCHEMA_VERSION = 24;
const INDEXED_DB_NAME = 'studyos_v16';
const INDEXED_DB_VERSION = 1;
const INDEXED_DB_STORE = 'kv';
const LARGE_STORAGE_KEYS = new Set([K.journal, K.doctrineLogs]);

// One shape contract is shared by backup validation and runtime diagnostics.
// Keys omitted here are intentionally treated as scalar or unconstrained.
const STORAGE_SHAPES = Object.freeze({
    goals:'array', tasks:'array', time:'array', habits:'array', habitLogs:'array',
    journal:'array', knowledge:'array', events:'array', flashcards:'array', cardReviewDetails:'array',
    focusSessions:'array', contacts:'array', quotes:'array', decisions:'array',
    doctrineLogs:'array', doctrineCustomModules:'array', doctrineLinks:'array',
    scenarioHistory:'array', practiceQueue:'array', learningCycles:'array',
    profileFeedback:'array', qualityReviews:'array', captureInbox:'array', entityLinks:'array',
    settings:'object', cardReviews:'object', weeklyReviews:'object', discipline:'object',
    protocol:'object', learnProgress:'object', pmpProgress:'object', pomodoroStats:'object',
    strategicHorizon:'object', frameworkLab:'object', doctrineSourcesState:'object',
    sessionContext:'object', intel:'object', commitmentPrefs:'object', practiceQuality:'object',
    commTracker:'object', energyTracker:'object', principlesTracker:'object', cebokTracker:'object',
    doctrineDomainOverrides:'object', doctrineModelOverrides:'object', adaptiveProfile:'object',
    quranReadPreferences:'object', quranAudioPreferences:'object', quranStudyData:'object',
    quranFollowAlong:'object'
});
window.STUDYOS_STORAGE_SHAPES = STORAGE_SHAPES;

const EVENTS = (() => {
    const handlers = new Map();
    return {
        on(name, fn) {
            if (!handlers.has(name)) handlers.set(name, new Set());
            handlers.get(name).add(fn);
            return () => handlers.get(name)?.delete(fn);
        },
        emit(name, payload) {
            (handlers.get(name) || []).forEach(fn => {
                try { fn(payload); } catch (err) { console.error('Event handler failed', name, err); }
            });
            (handlers.get('*') || []).forEach(fn => {
                try { fn(name, payload); } catch (err) { console.error('Wildcard event handler failed', name, err); }
            });
        }
    };
})();
window.EVENTS = EVENTS;

const STORAGE = {
    db: null,
    pendingWrites: new Set(),
    track(promise) {
        const tracked = Promise.resolve(promise);
        this.pendingWrites.add(tracked);
        tracked.finally(() => this.pendingWrites.delete(tracked));
        return tracked;
    },
    async flush() {
        await Promise.all(Array.from(this.pendingWrites));
    },
    async open() {
        if (this.db) return this.db;
        this.db = await new Promise((resolve, reject) => {
            const req = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
            req.onupgradeneeded = () => {
                const db = req.result;
                if (!db.objectStoreNames.contains(INDEXED_DB_STORE)) {
                    db.createObjectStore(INDEXED_DB_STORE, { keyPath: 'key' });
                }
            };
            req.onsuccess = () => resolve(req.result);
            req.onerror = () => reject(req.error || new Error('IndexedDB open failed'));
        });
        return this.db;
    },
    async readLarge(key) {
        if (!LARGE_STORAGE_KEYS.has(key)) return null;
        try {
            const db = await this.open();
            return await new Promise((resolve, reject) => {
                const tx = db.transaction(INDEXED_DB_STORE, 'readonly');
                const req = tx.objectStore(INDEXED_DB_STORE).get(key);
                req.onsuccess = () => resolve(req.result ? req.result.value : null);
                req.onerror = () => reject(req.error || new Error('IndexedDB read failed'));
            });
        } catch (err) {
            console.warn('IndexedDB read failed for', key, err);
            return null;
        }
    },
    async writeLarge(key, value) {
        if (!LARGE_STORAGE_KEYS.has(key)) return;
        try {
            const db = await this.open();
            await new Promise((resolve, reject) => {
                const tx = db.transaction(INDEXED_DB_STORE, 'readwrite');
                tx.objectStore(INDEXED_DB_STORE).put({ key, value, updatedAt: Date.now() });
                tx.oncomplete = () => resolve();
                tx.onerror = () => reject(tx.error || new Error('IndexedDB write failed'));
            });
        } catch (err) {
            console.warn('IndexedDB write failed for', key, err);
        }
    },
    async deleteLarge(key) {
        if (!LARGE_STORAGE_KEYS.has(key)) return;
        try {
            const db = await this.open();
            await new Promise((resolve, reject) => {
                const tx = db.transaction(INDEXED_DB_STORE, 'readwrite');
                tx.objectStore(INDEXED_DB_STORE).delete(key);
                tx.oncomplete = () => resolve();
                tx.onerror = () => reject(tx.error || new Error('IndexedDB delete failed'));
            });
        } catch (err) {
            console.warn('IndexedDB delete failed for', key, err);
        }
    },
    async clearLargeStore() {
        try {
            await this.flush();
            const db = await this.open();
            await new Promise((resolve, reject) => {
                const tx = db.transaction(INDEXED_DB_STORE, 'readwrite');
                tx.objectStore(INDEXED_DB_STORE).clear();
                tx.oncomplete = () => resolve();
                tx.onerror = () => reject(tx.error || new Error('IndexedDB clear failed'));
            });
            return true;
        } catch (err) {
            console.warn('IndexedDB clear failed', err);
            return false;
        }
    },
    async hydrateLargeKeys() {
        for (const key of LARGE_STORAGE_KEYS) {
            const local = localStorage.getItem(key);
            if (local !== null) {
                // localStorage is the synchronous source of truth. IndexedDB
                // is a capacity mirror/fallback and must never overwrite a
                // newer local write with a stale asynchronous copy.
                try {
                    await this.writeLarge(key, JSON.parse(local));
                    continue;
                } catch (e) {}
            }
            const remote = await this.readLarge(key);
            if (remote !== null && remote !== undefined) {
                localStorage.setItem(key, JSON.stringify(remote));
            }
        }
    },
    async syncLargeKeysFromLocal() {
        for (const key of LARGE_STORAGE_KEYS) {
            const raw = localStorage.getItem(key);
            if (raw === null) await this.deleteLarge(key);
            else {
                try { await this.writeLarge(key, JSON.parse(raw)); }
                catch (e) { console.warn('Large-key sync skipped for', key, e); }
            }
        }
    },
    async init() {
        await this.hydrateLargeKeys();
    },
    estimateUsage() {
        let bytes = 0;
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i) || '';
            const val = localStorage.getItem(key) || '';
            bytes += key.length + val.length;
        }
        return {
            bytes,
            kilobytes: Math.round(bytes / 1024),
            megabytes: +(bytes / (1024 * 1024)).toFixed(2)
        };
    }
};
window.STORAGE = STORAGE;

function inferEntityNameForKey(key) {
    const map = {
        [K.journal]: 'journal',
        [K.tasks]: 'task',
        [K.goals]: 'goal',
        [K.contacts]: 'contact',
        [K.habits]: 'habit',
        [K.habitLogs]: 'habitlog',
        [K.protocol]: 'protocol',
        [K.discipline]: 'discipline',
        [K.time]: 'tracker',
        [K.knowledge]: 'knowledge',
        [K.flashcards]: 'flashcard',
        [K.decisions]: 'decision',
        [K.events]: 'calendar',
        [K.doctrineLogs]: 'drill',
        [K.doctrineSourcesState]: 'doctrine-source',
        [K.doctrineCustomModules]: 'doctrine-module',
        [K.doctrineLinks]: 'doctrine-link',
        [K.doctrineDomainOverrides]: 'doctrine-preference',
        [K.doctrineModelOverrides]: 'doctrine-preference',
        [K.doctrineView]: 'doctrine-view',
        [K.cardReviewDetails]: 'flashcard-review',
        [K.frameworkLab]: 'framework',
        [K.intel]: 'intelligence',
        [K.commitmentPrefs]: 'commitment-preferences',
        [K.commTracker]: 'communication',
        [K.energyTracker]: 'energy',
        [K.adaptiveProfile]: 'adaptive-profile',
        [K.profileFeedback]: 'profile-feedback',
        [K.qualityReviews]: 'quality-review',
        [K.captureInbox]: 'capture',
        [K.entityLinks]: 'entity-link',
        [K.quranReadPreferences]: 'quran-reader-preferences',
        [K.quranAudioPreferences]: 'quran-audio-preferences',
        [K.quranStudyData]: 'quran-study-data',
        [K.quranFollowAlong]: 'quran-follow-along-preferences'
    };
    return map[key] || 'data';
}

function inferActionForValue(value) {
    if (value === null || value === undefined) return 'deleted';
    if (Array.isArray(value)) return 'updated';
    if (typeof value === 'object') return 'saved';
    return 'updated';
}

function serializeAndStore(key, value) {
    try {
        if (value === undefined) {
            localStorage.removeItem(key);
            STORAGE.track(STORAGE.deleteLarge(key));
            return true;
        }
        localStorage.setItem(key, JSON.stringify(value));
        STORAGE.track(STORAGE.writeLarge(key, value));
        return true;
    } catch (error) {
        console.error('StudyOS storage write failed for', key, error);
        if (typeof toast === 'function') toast('Could not save this change. Check available browser storage.');
        return false;
    }
}

const get = k => {
    try { return JSON.parse(localStorage.getItem(k)); } catch { return null; }
};
const set = (k, v) => {
    if (!serializeAndStore(k, v)) return false;
    const entity = inferEntityNameForKey(k);
    const action = inferActionForValue(v);
    EVENTS.emit('storage:changed', { key: k, entity, action, value: v });
    EVENTS.emit(`${entity}:${action}`, { key: k, entity, action, value: v });
    return true;
};
const arr = k => get(k) || [];
const uid = () => Date.now().toString(36) + Math.random().toString(36).substr(2,9);

function taskDueDate(task) {
    return String((task && (task.due || task.dueDate)) || '');
}

function taskIsCompleted(task) {
    if (!task) return false;
    if (typeof task.completed === 'boolean') return task.completed;
    return task.status === 'done' || task.status === 'completed';
}

function normalizeTaskRecord(task) {
    const row = task && typeof task === 'object' ? task : {};
    const completed = taskIsCompleted(row);
    const priorities = { high:'high', med:'med', medium:'med', normal:'med', low:'low' };
    const candidateTime = String(row.time || row.scheduledTime || '');
    const time = /^([01]\d|2[0-3]):[0-5]\d$/.test(candidateTime) ? candidateTime : null;
    const candidateDuration = parseInt(row.duration, 10);
    const duration = Number.isFinite(candidateDuration) && candidateDuration > 0 ? String(Math.min(candidateDuration, 720)) : null;
    const categories = { general:'general', study:'study', work:'work', personal:'personal' };
    const normalized = {
        ...row,
        id: row.id || uid(),
        title: row.title || 'Untitled task',
        due: taskDueDate(row) || null,
        time,
        duration,
        category: categories[String(row.category || 'general').toLowerCase()] || 'general',
        priority: priorities[String(row.priority || 'med').toLowerCase()] || 'med',
        description: row.description !== undefined ? row.description : (row.notes || ''),
        completed,
        status: completed ? 'done' : 'pending'
    };
    delete normalized.dueDate;
    delete normalized.scheduledTime;
    return normalized;
}

function goalProgress(goal) {
    if (!goal) return 0;
    if (goal.completed) return 100;
    const milestones = Array.isArray(goal.milestones) ? goal.milestones : [];
    if (milestones.length) return Math.round(milestones.filter(m => m.done).length / milestones.length * 100);
    const stored = Number(goal.progress);
    return Number.isFinite(stored) ? Math.max(0, Math.min(100, Math.round(stored))) : 0;
}

function normalizeLearningDomain(value) {
    const v = String(value || '').trim().toLowerCase();
    if (['technical','strategic','leadership'].includes(v)) return v;
    if (['math','structures','construction','engineering','smr','technical practice','foundations'].includes(v)) return 'technical';
    if (['leadership','people','communication','behavior','team'].includes(v)) return 'leadership';
    if (['management','pmp','strategy','business','contracts','project'].includes(v)) return 'strategic';
    return '';
}

function timeEntryLearningDomain(entry) {
    if (!entry) return '';
    return normalizeLearningDomain(entry.learningDomain || entry.primaryDomain || entry.domain || entry.pathway);
}
// Calendar records are local-day records. ISO strings use UTC and can move a
// Toronto evening into tomorrow, so build YYYY-MM-DD from local components.
const fmtDate = d => {
    const date = d instanceof Date ? d : new Date(d);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};
const today = () => fmtDate(new Date());
const esc = t => { if(!t)return''; const d=document.createElement('div'); d.textContent=t; return d.innerHTML; };

function runSchemaMigrations() {
    const storedVersion = parseInt(localStorage.getItem(STORAGE_SCHEMA_KEY) || '0', 10) || 0;
    if (storedVersion >= DATA_SCHEMA_VERSION) return { from: storedVersion, to: storedVersion, migrated: false };

    if (storedVersion < 15) {
        const srcState = get(K.doctrineSourcesState);
        if (srcState && typeof srcState === 'object') {
            Object.keys(srcState).forEach(id => {
                const row = srcState[id] || {};
                if (row.progress && row.completedUnits === undefined) row.completedUnits = row.progress;
                if (row.total === undefined && row.totalUnits !== undefined) row.total = row.totalUnits;
            });
            localStorage.setItem(K.doctrineSourcesState, JSON.stringify(srcState));
        }
    }

    if (storedVersion < 16) {
        const journal = arr(K.journal).map(entry => ({
            ...entry,
            date: entry.date || today(),
            createdAt: entry.createdAt || entry.at || Date.now()
        }));
        localStorage.setItem(K.journal, JSON.stringify(journal));

        const logs = arr(K.doctrineLogs).map(log => ({
            ...log,
            date: log.date || (log.at ? fmtDate(new Date(log.at)) : today()),
            primaryDomain: log.primaryDomain || log.domain || 'strategic'
        }));
        localStorage.setItem(K.doctrineLogs, JSON.stringify(logs));
    }

    if (storedVersion < 17) {
        // V16 used `intention` for both free text and a Boolean checklist step.
        // Preserve recoverable text and move the checklist flag to its own key.
        const protocol = get(K.protocol) || {};
        Object.keys(protocol).forEach(dateStr => {
            const day = protocol[dateStr];
            if (!day || typeof day !== 'object') return;
            if (typeof day.intention === 'boolean') {
                day.intentionStep = day.intention;
                day.intention = '';
            } else if (typeof day.intention === 'string' && day.intention.trim() && day.intentionStep === undefined) {
                day.intentionStep = true;
            }
            day.completed = !!(day.morning && day.evening);
        });
        localStorage.setItem(K.protocol, JSON.stringify(protocol));
    }

    if (storedVersion < 18) {
        // Doctrine V26 created flashcards with a front/back schema while the
        // SRS engine reads question/answer. Normalize both user-created and
        // doctrine-created cards so opening Flashcards cannot crash.
        const rawCards = get(K.flashcards);
        const cards = Array.isArray(rawCards) ? rawCards.map(card => ({
            ...card,
            question: card.question || card.front || 'Untitled flashcard',
            answer: card.answer !== undefined ? card.answer : (card.back || ''),
            category: card.category || card.topic || 'general',
            tags: Array.isArray(card.tags) ? card.tags : [],
            createdAt: card.createdAt || card.created || new Date().toISOString(),
            reviews: Number(card.reviews || card.repetitions || 0),
            easeFactor: Number(card.easeFactor || card.ease || 2.5),
            interval: Number(card.interval || 0),
            nextReview: card.nextReview || today()
        })) : [];
        localStorage.setItem(K.flashcards, JSON.stringify(cards));
    }

    if (storedVersion < 19) {
        // V28 Find & Connect adds two additive collections and a structured
        // evidence envelope to Knowledge entries. Existing notes remain
        // byte-for-byte readable; only malformed optional fields are reset.
        const rawCaptures = get(K.captureInbox);
        if (!Array.isArray(rawCaptures)) localStorage.setItem(K.captureInbox, '[]');

        const rawLinks = get(K.entityLinks);
        if (!Array.isArray(rawLinks)) localStorage.setItem(K.entityLinks, '[]');

        const rawKnowledge = get(K.knowledge);
        const knowledge = Array.isArray(rawKnowledge) ? rawKnowledge.map(entry => ({
            ...entry,
            evidence: entry && entry.evidence && typeof entry.evidence === 'object' && !Array.isArray(entry.evidence)
                ? entry.evidence
                : {},
            relatedTitles: Array.isArray(entry && entry.relatedTitles) ? entry.relatedTitles : [],
            unresolvedLinks: Array.isArray(entry && entry.unresolvedLinks) ? entry.unresolvedLinks : []
        })) : [];
        localStorage.setItem(K.knowledge, JSON.stringify(knowledge));
    }

    if (storedVersion < 20) {
        // V29 Practice & Judgment adds a spaced weak-skill queue and enriches
        // scenario attempts. Legacy attempts remain usable in aggregate
        // accuracy; missing confidence/skill metadata is explicitly null so
        // it is never invented or counted as calibration evidence.
        const rawQueue = get(K.practiceQueue);
        if (!Array.isArray(rawQueue)) localStorage.setItem(K.practiceQueue, '[]');

        const rawHistory = get(K.scenarioHistory);
        const history = Array.isArray(rawHistory) ? rawHistory.map((row, index) => ({
            ...row,
            id: row && row.id ? row.id : ('legacy-attempt-' + index + '-' + String(row && row.date || today()).replace(/[^0-9]/g, '')),
            schemaVersion: row && row.schemaVersion ? row.schemaVersion : 1,
            date: row && row.date ? row.date : today(),
            at: row && row.at ? row.at : ((row && row.date ? row.date : today()) + 'T12:00:00'),
            confidence: row && Number(row.confidence) >= 1 && Number(row.confidence) <= 5 ? Number(row.confidence) : null,
            selectedIndex: row && Number.isInteger(row.selectedIndex) ? row.selectedIndex : null,
            answerIndex: row && Number.isInteger(row.answerIndex) ? row.answerIndex : null,
            errorType: row && row.errorType ? row.errorType : '',
            transferNote: row && row.transferNote ? row.transferNote : ''
        })) : [];
        localStorage.setItem(K.scenarioHistory, JSON.stringify(history));
    }

    if (storedVersion < 21) {
        // V29.1 Connection Integrity establishes one canonical task shape,
        // gives time entries an explicit learning-domain axis, registers
        // previously orphaned SRS/Doctrine keys, and repairs old tracker/log
        // shapes without discarding user content.
        const tasks = Array.isArray(get(K.tasks)) ? get(K.tasks).map(normalizeTaskRecord) : [];
        localStorage.setItem(K.tasks, JSON.stringify(tasks));

        const rawTime = get(K.time);
        const timeEntries = Array.isArray(rawTime) ? rawTime.map(entry => {
            const legacyCategory = String(entry && entry.category || '').toLowerCase();
            const category = ['technical','strategic','leadership'].includes(legacyCategory) ? 'study' : (entry.category || 'study');
            return {
                ...entry,
                category,
                learningDomain: timeEntryLearningDomain(entry) || (category === 'study' ? 'technical' : null)
            };
        }) : [];
        localStorage.setItem(K.time, JSON.stringify(timeEntries));

        const rawLogs = get(K.doctrineLogs);
        const doctrineLogs = Array.isArray(rawLogs) ? rawLogs.map(log => {
            const date = log && (log.date || (log.at ? fmtDate(new Date(log.at)) : ''));
            const at = Number(log && log.at) || (date ? new Date(date + 'T12:00:00').getTime() : 0);
            return {
                ...log,
                date,
                at,
                primaryDomain: normalizeLearningDomain(log && (log.primaryDomain || log.domain)) || 'strategic'
            };
        }) : [];
        localStorage.setItem(K.doctrineLogs, JSON.stringify(doctrineLogs));

        const goals = Array.isArray(get(K.goals)) ? get(K.goals).map(goal => {
            const milestones = Array.isArray(goal && goal.milestones) ? goal.milestones : [];
            const completed = typeof goal.completed === 'boolean' ? goal.completed : false;
            if (completed) milestones.forEach(m => { m.done = true; });
            return { ...goal, milestones, completed: completed || (milestones.length > 0 && milestones.every(m => m.done)) };
        }) : [];
        localStorage.setItem(K.goals, JSON.stringify(goals));

        const normalizeActivityTracker = key => {
            const raw = get(key);
            const tracker = raw && typeof raw === 'object' && !Array.isArray(raw) ? raw : {};
            Object.keys(tracker).forEach(date => {
                const row = tracker[date] && typeof tracker[date] === 'object' ? tracker[date] : {};
                row.activities = Array.isArray(row.activities) ? row.activities : [];
                tracker[date] = row;
            });
            localStorage.setItem(key, JSON.stringify(tracker));
        };
        normalizeActivityTracker(K.commTracker);
        normalizeActivityTracker(K.energyTracker);

        if (!Array.isArray(get(K.cardReviewDetails))) localStorage.setItem(K.cardReviewDetails, '[]');
        const domainOverrides = get(K.doctrineDomainOverrides);
        if (!domainOverrides || typeof domainOverrides !== 'object' || Array.isArray(domainOverrides)) localStorage.setItem(K.doctrineDomainOverrides, '{}');
        const modelOverrides = get(K.doctrineModelOverrides);
        if (!modelOverrides || typeof modelOverrides !== 'object' || Array.isArray(modelOverrides)) localStorage.setItem(K.doctrineModelOverrides, '{}');
        const doctrineView = get(K.doctrineView);
        if (!['modules','sources','builder'].includes(doctrineView)) localStorage.setItem(K.doctrineView, JSON.stringify('modules'));
    }

    if (storedVersion < 22) {
        // V29.2 Commitment Intelligence adds optional schedule metadata to
        // Tasks/Habits, normalizes Calendar recurrence records, and registers
        // warning preferences. Date-only records remain valid and are never
        // assigned an invented exact time.
        const validTime = value => /^([01]\d|2[0-3]):[0-5]\d$/.test(String(value || '')) ? String(value) : null;
        const validDuration = value => {
            const minutes = parseInt(value, 10);
            return Number.isFinite(minutes) && minutes > 0 ? String(Math.min(minutes, 720)) : null;
        };
        const categories = new Set(['general','study','work','personal','routine','wellbeing']);

        const tasks = Array.isArray(get(K.tasks)) ? get(K.tasks).map(normalizeTaskRecord) : [];
        localStorage.setItem(K.tasks, JSON.stringify(tasks));

        const events = Array.isArray(get(K.events)) ? get(K.events).map(event => ({
            ...event,
            time: validTime(event && event.time),
            duration: validDuration(event && event.duration),
            repeat: ['daily','weekly','monthly'].includes(String(event && event.repeat || '')) ? event.repeat : null
        })) : [];
        localStorage.setItem(K.events, JSON.stringify(events));

        const habits = Array.isArray(get(K.habits)) ? get(K.habits).map(habit => {
            const category = String(habit && habit.category || 'routine').toLowerCase();
            return {
                ...habit,
                time: validTime(habit && (habit.time || habit.preferredTime)),
                duration: validDuration(habit && habit.duration),
                category: categories.has(category) ? category : 'routine'
            };
        }) : [];
        localStorage.setItem(K.habits, JSON.stringify(habits));

        const rawPrefs = get(K.commitmentPrefs);
        const prefs = rawPrefs && typeof rawPrefs === 'object' && !Array.isArray(rawPrefs) ? rawPrefs : {};
        localStorage.setItem(K.commitmentPrefs, JSON.stringify({
            version: 1,
            warningsEnabled: prefs.warningsEnabled !== false,
            dayStart: validTime(prefs.dayStart) || '06:00',
            dayEnd: validTime(prefs.dayEnd) || '22:00',
            dailyBudgetMinutes: Math.max(240, Math.min(960, parseInt(prefs.dailyBudgetMinutes, 10) || 720)),
            maxStudyMinutes: Math.max(60, Math.min(480, parseInt(prefs.maxStudyMinutes, 10) || 240)),
            bufferMinutes: Math.max(0, Math.min(60, Number.isFinite(parseInt(prefs.bufferMinutes, 10)) ? parseInt(prefs.bufferMinutes, 10) : 10)),
            defaultTaskMinutes: Math.max(5, Math.min(240, parseInt(prefs.defaultTaskMinutes, 10) || 30)),
            defaultHabitMinutes: Math.max(2, Math.min(120, parseInt(prefs.defaultHabitMinutes, 10) || 10))
        }));
    }

    if (storedVersion < 23) {
        // V30 adds an additive, evidence-first learning-cycle record. Existing
        // study time, cards, practice attempts, and pages remain unchanged.
        // Optional ratings stay null rather than being invented by migration.
        const rawCycles = get(K.learningCycles);
        const cycles = Array.isArray(rawCycles) ? rawCycles.map((row, index) => ({
            ...row,
            id: row && row.id ? row.id : ('legacy-cycle-' + index + '-' + String(row && row.date || today()).replace(/[^0-9]/g, '')),
            schemaVersion: 1,
            date: row && row.date ? row.date : today(),
            at: row && row.at ? row.at : ((row && row.date ? row.date : today()) + 'T12:00:00'),
            learningDomain: normalizeLearningDomain(row && row.learningDomain) || 'technical',
            readiness: row && row.readiness && typeof row.readiness === 'object' && !Array.isArray(row.readiness) ? row.readiness : {},
            retrievalOutcome: row && Number(row.retrievalOutcome) >= 0 && Number(row.retrievalOutcome) <= 3 ? Number(row.retrievalOutcome) : null,
            nextReviewDate: row && row.nextReviewDate ? row.nextReviewDate : null
        })) : [];
        localStorage.setItem(K.learningCycles, JSON.stringify(cycles));
    }

    if (storedVersion < 24) {
        // V31 turns personality labels into user-controlled hypotheses. The
        // assessment data supplies prompts; observed behavior and explicit
        // feedback determine whether those prompts remain active.
        const rawProfile = get(K.adaptiveProfile);
        const profile = rawProfile && typeof rawProfile === 'object' && !Array.isArray(rawProfile)
            ? rawProfile
            : {};
        localStorage.setItem(K.adaptiveProfile, JSON.stringify({
            version: 1,
            enabled: profile.enabled !== false,
            guidanceDensity: ['compact','balanced','coaching'].includes(profile.guidanceDensity) ? profile.guidanceDensity : 'balanced',
            hypotheses: profile.hypotheses && typeof profile.hypotheses === 'object' && !Array.isArray(profile.hypotheses) ? profile.hypotheses : {},
            updatedAt: profile.updatedAt || new Date().toISOString()
        }));

        if (!Array.isArray(get(K.profileFeedback))) localStorage.setItem(K.profileFeedback, '[]');
        if (!Array.isArray(get(K.qualityReviews))) localStorage.setItem(K.qualityReviews, '[]');

        const rawCommunication = get(K.commTracker);
        const communication = rawCommunication && typeof rawCommunication === 'object' && !Array.isArray(rawCommunication) ? rawCommunication : {};
        Object.keys(communication).forEach(date => {
            const row = communication[date] && typeof communication[date] === 'object' ? communication[date] : {};
            row.activities = Array.isArray(row.activities) ? row.activities : [];
            row.qualityBehaviors = Array.isArray(row.qualityBehaviors) ? row.qualityBehaviors : [];
            row.outcome = Number(row.outcome) >= 1 && Number(row.outcome) <= 5 ? Number(row.outcome) : null;
            communication[date] = row;
        });
        localStorage.setItem(K.commTracker, JSON.stringify(communication));
    }

    localStorage.setItem(STORAGE_SCHEMA_KEY, String(DATA_SCHEMA_VERSION));
    return { from: storedVersion, to: DATA_SCHEMA_VERSION, migrated: true };
}
window.runSchemaMigrations = runSchemaMigrations;
window.__initialMigration = null;
window.__storageReadyPromise = STORAGE.init().then(async () => {
    // Hydrate first, then migrate. Migrating before hydration allowed an old
    // IndexedDB mirror to overwrite freshly migrated Journal/Doctrine data.
    const result = runSchemaMigrations();
    window.__initialMigration = result;
    await STORAGE.syncLargeKeysFromLocal();
    return result;
}).catch(async err => {
    console.error('Storage init failed', err);
    const result = runSchemaMigrations();
    window.__initialMigration = { ...result, storageError: String(err) };
    return window.__initialMigration;
});

function toast(m) { document.getElementById('toastMsg').textContent=m; document.getElementById('toast').classList.add('show'); setTimeout(()=>document.getElementById('toast').classList.remove('show'),2000); }
function openModal(id) { document.getElementById(id).classList.add('show'); }
function closeModal(id) { document.getElementById(id).classList.remove('show'); }

function toggleSidebar() {
    document.querySelector('.sidebar').classList.toggle('open');
    document.querySelector('.sidebar-overlay').classList.toggle('show');
}

// ==================== V7 UI INIT ====================
function initV7UI() {
    const dateEl = document.getElementById('sidebarDate');
    if (dateEl) {
        const now = new Date();
        dateEl.textContent = now.toLocaleDateString('en-CA', { weekday:'short', year:'numeric', month:'short', day:'numeric' });
    }

    const healthEl = document.getElementById('sidebarHealth');
    if (healthEl) {
        const todayStr = today();
        const tasks = arr(K.tasks).filter(t => !taskIsCompleted(t));
        const overdue = tasks.filter(t => taskDueDate(t) && taskDueDate(t) < todayStr).length;
        const events = arr(K.events).filter(e => e.date === todayStr);
        const plannedMinutes = events.reduce((s,e) => s + (parseInt(e.duration || 0, 10) || 0), 0);
        const plannedHours = plannedMinutes / 60;
        const cards = arr(K.flashcards);
        const dueNow = cards.filter(c => c.nextReview && c.nextReview <= todayStr).length;

        let integrityScore = null;
        let drift = false;
        let decay = 0;
        try {
            if (window.METRICS?.getLearningIntegrity) integrityScore = window.METRICS.getLearningIntegrity().index;
            else if (typeof LEARN !== 'undefined' && typeof LEARN.getLearningIntegrityIndex === 'function') integrityScore = LEARN.getLearningIntegrityIndex()?.index ?? null;
            if (typeof LEARN !== 'undefined' && typeof LEARN.getDriftStatus === 'function') drift = !!LEARN.getDriftStatus()?.isDrifting;
            if (typeof LEARN !== 'undefined' && typeof LEARN.getSkillDecayWarnings === 'function') decay = (LEARN.getSkillDecayWarnings(21) || []).length;
        } catch(e) {}

        let label = 'STABLE';
        let cls = 'badge-good';
        if (overdue > 0 || dueNow > 10 || plannedHours < 2 || drift || (integrityScore !== null && integrityScore < 55) || decay > 0) { label = 'WATCH'; cls = 'badge-warn'; }
        if (overdue >= 3 || dueNow > 30 || plannedHours < 1 || (integrityScore !== null && integrityScore < 40) || decay >= 2) { label = 'RISK'; cls = 'badge-danger'; }

        healthEl.className = 'badge ' + cls;
        healthEl.textContent = label;
        healthEl.title = 'Overdue: ' + overdue + ' · Planned: ' + plannedHours.toFixed(1) + 'h · SRS: ' + dueNow + (integrityScore !== null ? ' · Integrity: ' + integrityScore : '') + (drift ? ' · Drift' : '') + (decay ? ' · Decay: ' + decay : '');
    }
}

// ==================== BEHAVIOR MOMENTUM (V8) ====================
function calcBehaviorMomentumForDate(dateStr){
    const habits = arr(K.habits);
    const logs = arr(K.habitLogs);
    const doneHabits = habits.length ? habits.filter(h => logs.some(l => l.habitId===h.id && l.date===dateStr)).length : 0;
    const habitPct = habits.length ? (doneHabits / habits.length) : 0;

    const pomo = get(K.pomodoroStats) || {};
    const focusCount = pomo[dateStr] || 0;

    // Card-review history is stored as a date -> count object. Treating it as
    // an array caused the dashboard momentum renderer to throw as soon as the
    // first flashcard review existed.
    const reviewHistory = get(K.cardReviews) || {};
    const reviews = Number(reviewHistory[dateStr] || 0);
    const tasks = arr(K.tasks);
    const completedTasks = tasks.filter(t => t.completedAt === dateStr).length;

    const score = (habitPct * 45) + (Math.min(focusCount, 4) / 4 * 30) + (Math.min(reviews, 30) / 30 * 15) + (Math.min(completedTasks, 8) / 8 * 10);
    return Math.round(score);
}

function getBehaviorMomentumSeries(days=30){
    const series=[];
    for(let i=days-1;i>=0;i--){
        const d=new Date(); d.setDate(d.getDate()-i);
        const ds=fmtDate(d);
        series.push({date: ds, score: calcBehaviorMomentumForDate(ds)});
    }
    return series;
}
