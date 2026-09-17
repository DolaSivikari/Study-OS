// ==================== MODULE LOADER (V56, audit R10) ====================
// Defers the four heaviest feature modules (~360 KB combined) until their
// tab is first opened, via <script> tag injection (file://-safe; no fetch,
// no ES modules per CLAUDE.md):
//   diagnostics  → js/diagnostics.js  (~144 KB)
//   guide        → js/guide.js        (~95 KB)
//   frameworklab → js/framework-lab.js (~63 KB)
//   pmptools     → js/pmp-tools.js    (~57 KB)
//
// Entry points:
//   studyosEnsureModule(name, cb)   — load one module, cb(ok)
//   studyosEnsureModules(names, cb) — load several, cb(ok)
//   studyosLazyRender(name, fnName) — ensure, then call window[fnName]()
//
// The DIAGNOSTICS tab ensures ALL lazy modules first: its runtime contract
// audit asserts typeof on contract functions (e.g. loadScenario lives in
// pmp-tools.js), and its navigation stress test visits every tab — the
// integrity surface must see the complete app.
//
// IMPORTANT for callers outside the router (see js/insights.js and
// js/learn.js): top-level `let` state inside a lazy module (e.g.
// pmpToolView) does not exist until the module loads — set such state
// INSIDE the ensure callback, never before it.

(function(){
    'use strict';

    var STUDYOS_LAZY_MODULES = {
        diagnostics: 'js/diagnostics.js',
        guide: 'js/guide.js',
        frameworklab: 'js/framework-lab.js',
        pmptools: 'js/pmp-tools.js'
    };

    var moduleState = {}; // name -> { status: idle|loading|ready|error, callbacks: [] }

    // V62.1: the portable build (tools/build-universal.js) inlines these four
    // modules and sets window.STUDYOS_PRELOADED_MODULES. Nothing read that
    // flag, so opening a lazy tab from the single-file build still injected a
    // script element pointing at js/diagnostics.js, which 404s from a file://
    // document — a console error on every visit, and a needless round trip
    // before the already-present renderer ran. Honour the flag.
    function preloaded(name) {
        var flags = window.STUDYOS_PRELOADED_MODULES;
        return !!(flags && flags[name]);
    }

    function entry(name) {
        if (!moduleState[name]) {
            moduleState[name] = { status: preloaded(name) ? 'ready' : 'idle', callbacks: [] };
        }
        return moduleState[name];
    }

    function studyosModuleReady(name) {
        return entry(name).status === 'ready';
    }

    function studyosEnsureModule(name, cb) {
        if (typeof cb !== 'function') cb = function() {};
        var src = STUDYOS_LAZY_MODULES[name];
        if (!src) { cb(false); return; }
        var st = entry(name);
        if (st.status === 'ready') { cb(true); return; }
        st.callbacks.push(cb);
        if (st.status === 'loading') return;
        st.status = 'loading';
        var script = document.createElement('script');
        script.src = src;
        script.onload = function() {
            st.status = 'ready';
            var callbacks = st.callbacks; st.callbacks = [];
            callbacks.forEach(function(fn) {
                try { fn(true); } catch (err) { console.error('lazy module callback failed', name, err); }
            });
        };
        script.onerror = function() {
            var callbacks = st.callbacks; st.callbacks = [];
            console.error('StudyOS lazy module failed to load:', src);
            callbacks.forEach(function(fn) {
                try { fn(false); } catch (err) { console.error('lazy module callback failed', name, err); }
            });
            st.status = 'idle'; // calling ensure again retries
        };
        document.head.appendChild(script);
    }

    function studyosEnsureModules(names, cb) {
        if (typeof cb !== 'function') cb = function() {};
        var remaining = names.length;
        var allOk = true;
        if (!remaining) { cb(true); return; }
        names.forEach(function(name) {
            studyosEnsureModule(name, function(ok) {
                if (!ok) allOk = false;
                remaining--;
                if (remaining === 0) cb(allOk);
            });
        });
    }

    // Router entry point: load what the tab needs, then call its renderer.
    function studyosLazyRender(name, fnName) {
        var names = name === 'diagnostics' ? Object.keys(STUDYOS_LAZY_MODULES) : [name];
        studyosEnsureModules(names, function(ok) {
            if (typeof window[fnName] === 'function') {
                window[fnName]();
            } else if (!ok) {
                console.error('StudyOS module for', name, 'did not load;', fnName, 'unavailable.');
            }
        });
    }

    window.STUDYOS_LAZY_MODULES = STUDYOS_LAZY_MODULES;
    window.studyosModuleReady = studyosModuleReady;
    window.studyosEnsureModule = studyosEnsureModule;
    window.studyosEnsureModules = studyosEnsureModules;
    window.studyosLazyRender = studyosLazyRender;
})();
