// ==================== FOCUS MODE (V15 — Enhanced UI) ====================
var focusInterval = null;
var focusSeconds = 0;
var focusTotalSeconds = 0;
var focusStartISO = null;
var focusPaused = false;
var focusTask = '';
var focusOverlayOriginalHTML = '';
var focusSessionQuality = '';
var focusComfortZone = '';

// Consistent styling for focus overlay content (high contrast on dark bg)
var FOCUS_STYLE = {
    card: 'background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.15);border-radius:12px;padding:14px 18px;',
    label: 'color:rgba(255,255,255,0.5);font-size:0.75rem;text-transform:uppercase;letter-spacing:0.5px;',
    value: 'color:#fff;font-weight:700;font-size:1rem;',
    hint: 'color:rgba(255,255,255,0.4);font-size:0.8rem;',
    checkbox: 'background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.15);border-radius:10px;padding:12px 16px;cursor:pointer;display:flex;align-items:center;gap:12px;color:#fff;font-size:0.95rem;transition:background 0.15s;',
    btnPrimary: 'background:#3b82f6;color:#fff;border:none;border-radius:8px;padding:14px 32px;font-size:1rem;font-weight:700;cursor:pointer;transition:background 0.15s;',
    btnSecondary: 'background:rgba(255,255,255,0.1);color:#fff;border:1px solid rgba(255,255,255,0.2);border-radius:8px;padding:10px 20px;font-size:0.9rem;cursor:pointer;transition:background 0.15s;',
    btnDanger: 'background:rgba(239,68,68,0.15);color:#ef4444;border:1px solid rgba(239,68,68,0.3);border-radius:8px;padding:10px 20px;font-size:0.9rem;cursor:pointer;',
    btnSelected: 'background:rgba(59,130,246,0.2);border-color:#3b82f6;',
    ratingBtn: 'background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.15);border-radius:10px;padding:14px 18px;cursor:pointer;text-align:left;color:#fff;font-size:0.9rem;transition:all 0.15s;width:100%;',
    container: 'text-align:center;max-width:440px;margin:0 auto;padding:20px;'
};

// ==================== ENVIRONMENT CHECK ====================
function startFocusMode(task, minutes, bypassConflict) {
    minutes = minutes || 25;
    // V17: read today's intention from protocol data, not by scraping dashboard DOM
    // (the dashboard element now shows a placeholder sentence when no intention is set)
    var todayProtoFocus = (get(K.protocol) || {})[today()] || {};
    var savedIntention = typeof todayProtoFocus.intention === 'string' ? todayProtoFocus.intention.trim() : '';
    var proposedFocusTask = task || savedIntention || 'Deep Work';
    if (!bypassConflict && typeof commitmentGuardActivity === 'function' && commitmentGuardActivity({
        title: proposedFocusTask,
        activityType: 'study',
        minutes: minutes,
        promptTitle: 'Focus session overlaps the current plan',
        continueLabel: 'Start focus anyway',
        onContinue: function(){ startFocusMode(task, minutes, true); }
    })) return;
    focusTask = proposedFocusTask;
    focusSeconds = minutes * 60;
    focusTotalSeconds = focusSeconds;
    focusStartISO = new Date().toISOString();
    focusPaused = false;
    focusSessionQuality = '';
    focusComfortZone = '';

    var overlay = document.getElementById('focusOverlay');
    if (!focusOverlayOriginalHTML) focusOverlayOriginalHTML = overlay.innerHTML;

    overlay.classList.add('active');
    overlay.innerHTML =
        '<div style="' + FOCUS_STYLE.container + '">' +
            '<div style="font-size:2.5rem;margin-bottom:16px;">🧠</div>' +
            '<div style="font-size:1.4rem;font-weight:800;color:#fff;margin-bottom:6px;">Environment Check</div>' +
            '<div style="' + FOCUS_STYLE.hint + 'margin-bottom:24px;">Prepare your space before locking in.</div>' +

            '<div style="display:flex;flex-direction:column;gap:10px;margin-bottom:28px;">' +
                '<label style="' + FOCUS_STYLE.checkbox + '" onmouseover="this.style.background=\'rgba(255,255,255,0.12)\'" onmouseout="this.style.background=\'rgba(255,255,255,0.06)\'">' +
                    '<input type="checkbox" style="width:20px;height:20px;accent-color:#3b82f6;flex-shrink:0;"> <span>📱 Phone on silent / out of reach</span>' +
                '</label>' +
                '<label style="' + FOCUS_STYLE.checkbox + '" onmouseover="this.style.background=\'rgba(255,255,255,0.12)\'" onmouseout="this.style.background=\'rgba(255,255,255,0.06)\'">' +
                    '<input type="checkbox" style="width:20px;height:20px;accent-color:#3b82f6;flex-shrink:0;"> <span>💧 Water / coffee ready</span>' +
                '</label>' +
                '<label style="' + FOCUS_STYLE.checkbox + '" onmouseover="this.style.background=\'rgba(255,255,255,0.12)\'" onmouseout="this.style.background=\'rgba(255,255,255,0.06)\'">' +
                    '<input type="checkbox" style="width:20px;height:20px;accent-color:#3b82f6;flex-shrink:0;"> <span>🎯 Clear goal for this session</span>' +
                '</label>' +
                '<label style="' + FOCUS_STYLE.checkbox + '" onmouseover="this.style.background=\'rgba(255,255,255,0.12)\'" onmouseout="this.style.background=\'rgba(255,255,255,0.06)\'">' +
                    '<input type="checkbox" style="width:20px;height:20px;accent-color:#3b82f6;flex-shrink:0;"> <span>🚪 Distractions minimized</span>' +
                '</label>' +
            '</div>' +

            '<div style="display:flex;flex-direction:column;gap:8px;align-items:center;">' +
                '<button style="' + FOCUS_STYLE.btnPrimary + '" onclick="launchFocusTimer()" onmouseover="this.style.background=\'#2563eb\'" onmouseout="this.style.background=\'#3b82f6\'">🚀 Start Focus (' + minutes + ' min)</button>' +
                '<button style="' + FOCUS_STYLE.btnSecondary + '" onclick="launchFocusTimer()">Skip check →</button>' +
            '</div>' +
        '</div>';
}

// ==================== TIMER SCREEN ====================
function launchFocusTimer() {
    var overlay = document.getElementById('focusOverlay');
    overlay.innerHTML =
        '<div style="' + FOCUS_STYLE.container + '">' +
            // Task name
            '<div style="color:rgba(255,255,255,0.5);font-size:0.85rem;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;">NOW FOCUSING ON</div>' +
            '<div style="color:#fff;font-size:1.3rem;font-weight:700;margin-bottom:28px;max-width:400px;" id="focusTask">' + esc(focusTask) + '</div>' +

            // Timer
            '<div id="focusTime" style="font-size:5.5rem;font-weight:800;font-family:var(--font-mono);color:#3b82f6;line-height:1;margin-bottom:12px;">25:00</div>' +

            // Progress bar
            '<div style="width:100%;max-width:360px;margin:0 auto 8px;">' +
                '<div style="height:6px;background:rgba(255,255,255,0.1);border-radius:3px;overflow:hidden;">' +
                    '<div id="focusProgressFill" style="height:100%;width:0%;background:#3b82f6;border-radius:3px;transition:width 0.5s;"></div>' +
                '</div>' +
                '<div style="display:flex;justify-content:space-between;margin-top:6px;">' +
                    '<span id="focusMetaLeft" style="color:rgba(255,255,255,0.4);font-size:0.75rem;font-family:var(--font-mono);">FOCUS</span>' +
                    '<span id="focusMetaRight" style="color:rgba(255,255,255,0.4);font-size:0.75rem;font-family:var(--font-mono);">RUNNING</span>' +
                '</div>' +
            '</div>' +

            // Controls
            '<div style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center;margin-top:24px;">' +
                '<button id="focusPauseBtn" style="' + FOCUS_STYLE.btnSecondary + '" onclick="pauseFocusMode()">⏸️ Pause</button>' +
                '<button style="' + FOCUS_STYLE.btnPrimary + '" onclick="completeFocusMode()">✅ Complete & Log</button>' +
                '<button style="' + FOCUS_STYLE.btnDanger + '" onclick="exitFocusMode()">✖ Exit</button>' +
            '</div>' +

            // Quote
            '<div id="focusQuote" style="color:rgba(255,255,255,0.3);font-style:italic;font-size:0.85rem;margin-top:32px;max-width:500px;"></div>' +
        '</div>';

    updateFocusDisplay();

    // Set quote
    if (typeof getMotivationalQuotes === 'function') {
        var quotes = getMotivationalQuotes();
        var q = quotes[Math.floor(Math.random() * quotes.length)];
        var quoteEl = document.getElementById('focusQuote');
        if (quoteEl && q) quoteEl.textContent = '"' + q.text + '" — ' + q.author;
    }

    if (focusInterval) clearInterval(focusInterval);
    focusInterval = setInterval(function() {
        if (!focusPaused) {
            focusSeconds--;
            updateFocusDisplay();
            if (focusSeconds <= 0) completeFocusSession();
        }
    }, 1000);
}

// ==================== DISPLAY UPDATE ====================
function updateFocusDisplay() {
    var el = document.getElementById('focusTime');
    if (!el) return;
    var m = Math.floor(Math.max(0, focusSeconds) / 60);
    var s = Math.max(0, focusSeconds) % 60;
    el.textContent = String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');

    var fill = document.getElementById('focusProgressFill');
    if (fill && focusTotalSeconds > 0) {
        var done = Math.max(0, Math.min(1, (focusTotalSeconds - focusSeconds) / focusTotalSeconds));
        fill.style.width = Math.round(done * 100) + '%';
    }
    var metaR = document.getElementById('focusMetaRight');
    if (metaR) metaR.textContent = focusPaused ? 'PAUSED' : 'RUNNING';
}

function completeFocusMode() { completeFocusSession(true); }

function pauseFocusMode() {
    focusPaused = !focusPaused;
    var btn = document.getElementById('focusPauseBtn');
    if (btn) btn.textContent = focusPaused ? '▶️ Resume' : '⏸️ Pause';
}

function exitFocusMode() {
    if (!confirm('Exit focus mode?')) return;
    clearInterval(focusInterval); focusInterval = null;
    window.__scienceCycleFocusContext = null;
    if (focusOverlayOriginalHTML) document.getElementById('focusOverlay').innerHTML = focusOverlayOriginalHTML;
    document.getElementById('focusOverlay').classList.remove('active');
}

// ==================== SESSION COMPLETE + RATING ====================
function completeFocusSession(isManual) {
    clearInterval(focusInterval); focusInterval = null;

    var endedAt = new Date().toISOString();
    var plannedSec = focusTotalSeconds || 0;
    var actualSec = Math.max(0, plannedSec - Math.max(0, focusSeconds));
    var actualHrs = actualSec / 3600;

    // Log pomodoro + time
    var stats = get(K.pomodoroStats) || {};
    stats[today()] = (stats[today()] || 0) + 1;
    set(K.pomodoroStats, stats);

    var ctx = null;
    var scienceCtx = window.__scienceCycleFocusContext || null;
    try { ctx = get(K.sessionContext); } catch (e) {}

    var time = arr(K.time);
    var learningDomain = ctx && ctx.kind === 'study_block'
        ? normalizeLearningDomain(ctx.domain)
        : (scienceCtx ? normalizeLearningDomain(scienceCtx.learningDomain) : 'technical');
    time.push({
        id: uid(), title: focusTask,
        duration: Math.round(actualHrs * 100) / 100,
        date: today(),
        category: 'study',
        domain: null,
        learningDomain: learningDomain || null,
        pathway: ctx && ctx.pathway ? ctx.pathway : '',
        technique: scienceCtx && scienceCtx.method ? scienceCtx.method : null,
        learningCycle: !!scienceCtx,
        type: 'focus', startedAt: focusStartISO, endedAt: endedAt,
        manual: !!isManual
    });
    set(K.time, time);

    // Log to learning engine if session context exists
    try {
        if (ctx && ctx.kind === 'study_block' && typeof LEARN !== 'undefined' && typeof LEARN.addDoctrineLog === 'function') {
            LEARN.addDoctrineLog({
                moduleId: ctx.moduleId || null,
                primaryDomain: learningDomain || 'technical',
                depth: 'structured', friction: 3,
                application: 'focus session',
                note: isManual ? 'Manual completion.' : 'Timer completed.',
                minutes: Math.round(actualSec / 60)
            });
        }
    } catch (e) {}

    // Show rating screen
    var overlay = document.getElementById('focusOverlay');
    var actualMin = Math.round(actualSec / 60);
    overlay.innerHTML =
        '<div style="' + FOCUS_STYLE.container + '">' +
            '<div style="font-size:3rem;margin-bottom:12px;">🎉</div>' +
            '<div style="color:#fff;font-size:1.5rem;font-weight:800;margin-bottom:6px;">Session Complete</div>' +
            '<div style="color:rgba(255,255,255,0.5);font-size:0.9rem;margin-bottom:4px;">' + esc(focusTask) + '</div>' +
            '<div style="color:#3b82f6;font-size:0.85rem;font-weight:600;margin-bottom:28px;">' + actualMin + ' minutes focused</div>' +

            // Quality rating
            '<div style="' + FOCUS_STYLE.label + 'margin-bottom:10px;">Session Quality</div>' +
            '<div id="qualityBtns" style="display:flex;flex-direction:column;gap:8px;margin-bottom:24px;">' +
                '<button style="' + FOCUS_STYLE.ratingBtn + '" onclick="rateFocusSession(\'naive\',this)" onmouseover="this.style.background=\'rgba(255,255,255,0.12)\'" onmouseout="if(!this.dataset.selected)this.style.background=\'rgba(255,255,255,0.06)\'">' +
                    '<span style="color:#eab308;font-weight:700;">🟡 Naive</span> <span style="color:rgba(255,255,255,0.5);margin-left:8px;">Going through the motions</span>' +
                '</button>' +
                '<button style="' + FOCUS_STYLE.ratingBtn + '" onclick="rateFocusSession(\'purposeful\',this)" onmouseover="this.style.background=\'rgba(255,255,255,0.12)\'" onmouseout="if(!this.dataset.selected)this.style.background=\'rgba(255,255,255,0.06)\'">' +
                    '<span style="color:#f97316;font-weight:700;">🟠 Purposeful</span> <span style="color:rgba(255,255,255,0.5);margin-left:8px;">Had a specific goal, pushed limits</span>' +
                '</button>' +
                '<button style="' + FOCUS_STYLE.ratingBtn + '" onclick="rateFocusSession(\'deliberate\',this)" onmouseover="this.style.background=\'rgba(255,255,255,0.12)\'" onmouseout="if(!this.dataset.selected)this.style.background=\'rgba(255,255,255,0.06)\'">' +
                    '<span style="color:#ef4444;font-weight:700;">🔴 Deliberate</span> <span style="color:rgba(255,255,255,0.5);margin-left:8px;">Specific weakness + feedback or correction</span>' +
                '</button>' +
            '</div>' +

            // Comfort zone
            '<div style="' + FOCUS_STYLE.label + 'margin-bottom:10px;">Perceived Difficulty</div>' +
            '<div style="display:flex;gap:8px;justify-content:center;margin-bottom:28px;">' +
                '<button id="czComfort" style="' + FOCUS_STYLE.btnSecondary + 'min-width:100px;" onclick="setComfortZone(\'comfort\',this)">😌 Familiar</button>' +
                '<button id="czStretch" style="' + FOCUS_STYLE.btnSecondary + 'min-width:100px;" onclick="setComfortZone(\'stretch\',this)">💪 Stretch</button>' +
                '<button id="czPanic" style="' + FOCUS_STYLE.btnSecondary + 'min-width:100px;" onclick="setComfortZone(\'panic\',this)">😰 Overload</button>' +
            '</div>' +

            // Submit
            '<div style="display:flex;gap:10px;justify-content:center;">' +
                '<button style="' + FOCUS_STYLE.btnPrimary + '" onclick="submitFocusRating()">✅ Done</button>' +
                '<button style="' + FOCUS_STYLE.btnSecondary + '" onclick="submitFocusRating()">Skip</button>' +
            '</div>' +
        '</div>';
}

// ==================== RATING HANDLERS ====================
function rateFocusSession(quality, btn) {
    focusSessionQuality = quality;
    var btns = document.getElementById('qualityBtns');
    if (btns) btns.querySelectorAll('button').forEach(function(b) {
        b.style.background = 'rgba(255,255,255,0.06)';
        b.style.borderColor = 'rgba(255,255,255,0.15)';
        b.dataset.selected = '';
    });
    if (btn) {
        btn.style.background = 'rgba(59,130,246,0.2)';
        btn.style.borderColor = '#3b82f6';
        btn.dataset.selected = '1';
    }
}

function setComfortZone(zone, btn) {
    focusComfortZone = zone;
    ['czComfort', 'czStretch', 'czPanic'].forEach(function(id) {
        var el = document.getElementById(id);
        if (el) {
            el.style.background = 'rgba(255,255,255,0.1)';
            el.style.borderColor = 'rgba(255,255,255,0.2)';
        }
    });
    if (btn) {
        btn.style.background = 'rgba(59,130,246,0.2)';
        btn.style.borderColor = '#3b82f6';
    }
}

function submitFocusRating() {
    if (focusSessionQuality) {
        var log = get(K.practiceQuality) || {};
        if (!log[today()]) log[today()] = [];
        log[today()].push({
            task: focusTask,
            quality: focusSessionQuality,
            comfort: focusComfortZone || 'unknown',
            time: new Date().toISOString()
        });
        set(K.practiceQuality, log);
    }
    focusSessionQuality = '';
    focusComfortZone = '';

    // Clear session context
    try {
        var ctx = get(K.sessionContext);
        if (ctx && ctx.kind === 'study_block') set(K.sessionContext, null);
    } catch (e) {}
    if (window.__scienceCycleFocusContext) window.__lastScienceCycleFocusContext = window.__scienceCycleFocusContext;
    window.__scienceCycleFocusContext = null;

    if (focusOverlayOriginalHTML) document.getElementById('focusOverlay').innerHTML = focusOverlayOriginalHTML;
    document.getElementById('focusOverlay').classList.remove('active');
    if (typeof refreshDashboard === 'function') refreshDashboard();
    toast('Focus session logged!');
}
