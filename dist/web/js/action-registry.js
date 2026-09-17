// ==================== ACTION REGISTRY (V25) ====================
// Additive infrastructure only. Does NOT migrate any existing onclick="..."
// handler — every button that works today keeps working exactly as before.
// This adds a second, optional way to wire up a button:
//
//   <button data-action="startFocusMode">Focus</button>
//   <button data-action="go" data-action-arg="dashboard">Home</button>
//   <button data-action="goTab" data-action-arg="planner" data-action-arg2="tasks">Tasks</button>
//
// Migrating existing onclick="..." buttons to data-action is a separate,
// future release done page-by-page (see SIMPLIFICATION-PLAN.md V25) —
// intentionally not done in this release, to keep the blast radius at zero
// for buttons that already work.

// V62.3 — studyosBindClick(el, fn)
//
// The one blessed way to wire a click handler onto a DYNAMICALLY created
// control. Use it instead of el.addEventListener('click', fn).
//
// Why it exists: there is no DOM API to enumerate addEventListener listeners,
// so the runtime interaction audit (js/diagnostics.js) physically cannot see
// them. It checks getAttribute('onclick'), data-action, and the .onclick
// property — an addEventListener-bound button therefore reports as "has no
// action" even though it works perfectly. That produced 8 false failures in
// Framework Lab and, worse, trains you to ignore red in the audit.
//
// Assigning .onclick keeps the control visible to the audit. Single-listener
// bindings on freshly created elements — which is every case in the app — are
// behaviourally identical either way. If you ever genuinely need multiple
// listeners on one element, use addEventListener and add data-action-bound
// so the audit still counts it as wired.
(function() {
    window.studyosBindClick = function(el, fn) {
        if (!el || typeof fn !== 'function') return el;
        el.onclick = fn;
        return el;
    };
})();

(function() {
    document.addEventListener('click', function(e) {
        var el = e.target.closest ? e.target.closest('[data-action]') : null;
        if (!el) return;

        var fnName = el.getAttribute('data-action');
        var fn = window[fnName];
        if (typeof fn !== 'function') {
            console.warn('action-registry: no function named "' + fnName + '" (button: ' + (el.textContent || '').trim() + ')');
            return;
        }

        var arg = el.getAttribute('data-action-arg');
        var arg2 = el.getAttribute('data-action-arg2');
        if (arg !== null && arg2 !== null) fn(arg, arg2);
        else if (arg !== null) fn(arg);
        else fn();
    });
})();
