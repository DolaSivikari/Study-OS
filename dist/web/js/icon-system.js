// ==================== STUDYOS ICON SYSTEM (V29.3) ====================
// Dependency-free, local SVG icons for application chrome. Meaningful user
// content (moods, ratings, book covers, celebrations) remains expressive;
// navigation, actions, headers, tabs, search, and system controls use one
// consistent 24px stroke language.

(function(){
    'use strict';

    var paths = {
        home: '<path d="M3 10.8 12 3l9 7.8"/><path d="M5.5 9.8V21h13V9.8"/><path d="M9.5 21v-6h5v6"/>',
        sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.65 17.65l1.42 1.42M2 12h2M20 12h2M4.93 19.07l1.42-1.42M17.65 6.35l1.42-1.42"/>',
        checkSquare: '<rect x="3" y="3" width="18" height="18" rx="4"/><path d="m7.5 12 3 3 6-6"/>',
        book: '<path d="M3.5 5.5A3.5 3.5 0 0 1 7 2h5v18H7a3.5 3.5 0 0 0-3.5 3.5z"/><path d="M20.5 5.5A3.5 3.5 0 0 0 17 2h-5v18h5a3.5 3.5 0 0 1 3.5 3.5z"/>',
        library: '<path d="M4 19.5V5l5-2v16.5M9 19.5V5l5-2v16.5M14 19.5V5l5-2v16.5"/><path d="M2 21h20"/>',
        mountain: '<path d="m3 20 6.5-12 3 5 2.5-4 6 11z"/><path d="m8.2 10.4 2.1 1.2 2.2-1.1"/>',
        journal: '<path d="M5 3h13a2 2 0 0 1 2 2v16H7a3 3 0 0 1-3-3V4a1 1 0 0 1 1-1Z"/><path d="M8 3v18M11 8h5M11 12h5"/>',
        chart: '<path d="M4 20V10M10 20V4M16 20v-7M22 20V7"/><path d="M2 20h22"/>',
        trend: '<path d="m3 17 6-6 4 4 8-9"/><path d="M15 6h6v6"/>',
        users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
        settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.83 2.83-.06-.06A1.7 1.7 0 0 0 15 19.4a1.7 1.7 0 0 0-1 .6 1.7 1.7 0 0 0-.4 1.1V21H9.6v-.09A1.7 1.7 0 0 0 8.5 19.4a1.7 1.7 0 0 0-1.88.34l-.06.06-2.83-2.83.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-.6-1 1.7 1.7 0 0 0-1.1-.4H3V9.6h.09A1.7 1.7 0 0 0 4.6 8.5a1.7 1.7 0 0 0-.34-1.88l-.06-.06 2.83-2.83.06.06A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-.6 1.7 1.7 0 0 0 .4-1.1V3h4v.09A1.7 1.7 0 0 0 15.5 4.6a1.7 1.7 0 0 0 1.88-.34l.06-.06 2.83 2.83-.06.06A1.7 1.7 0 0 0 19.4 9c.17.36.49.7.91.91H21v4h-.69c-.42.21-.74.55-.91 1.09Z"/>',
        search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
        calendar: '<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M8 3v4M16 3v4M3 10h18"/><path d="m8 15 2 2 5-5"/>',
        target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5"/>',
        plus: '<path d="M12 5v14M5 12h14"/>',
        menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
        clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
        brain: '<path d="M9.5 4.5A3.5 3.5 0 0 0 6 8v.3A3.8 3.8 0 0 0 4 15a3 3 0 0 0 3 4h2.5zM14.5 4.5A3.5 3.5 0 0 1 18 8v.3a3.8 3.8 0 0 1 2 6.7 3 3 0 0 1-3 4h-2.5z"/><path d="M9.5 8.5A2.5 2.5 0 0 0 7 11M14.5 8.5A2.5 2.5 0 0 1 17 11M9.5 15a2.5 2.5 0 0 1-2.5-2.5M14.5 15a2.5 2.5 0 0 0 2.5-2.5M12 3v18"/>',
        flask: '<path d="M9 3h6M10 3v6l-5 9a2 2 0 0 0 1.75 3h10.5A2 2 0 0 0 19 18l-5-9V3"/><path d="M7.5 15h9"/>',
        graduation: '<path d="m2 9 10-5 10 5-10 5z"/><path d="M6 11.5V16c2 2 10 2 12 0v-4.5M22 9v6"/>',
        cards: '<rect x="5" y="4" width="14" height="16" rx="2"/><path d="M9 8h6M9 12h6M9 16h4"/><path d="M3 7v11a4 4 0 0 0 4 4h9"/>',
        compass: '<circle cx="12" cy="12" r="9"/><path d="m15.5 8.5-2 5-5 2 2-5z"/>',
        refresh: '<path d="M20 7v5h-5M4 17v-5h5"/><path d="M6.1 8A7 7 0 0 1 18.7 6L20 8M4 16l1.3 2A7 7 0 0 0 17.9 16"/>',
        health: '<path d="M3 12h4l2-5 4 10 2-5h6"/><path d="M20.8 5.6a5.5 5.5 0 0 0-7.8 0L12 6.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 22l8.9-8.6a5.5 5.5 0 0 0-.1-7.8Z"/>',
        database: '<ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v6c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 11v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6"/>',
        upload: '<path d="M12 16V4M7 9l5-5 5 5"/><path d="M5 20h14"/>',
        download: '<path d="M12 4v12M7 11l5 5 5-5"/><path d="M5 20h14"/>',
        trash: '<path d="M4 7h16M9 7V4h6v3M6 7l1 14h10l1-14M10 11v6M14 11v6"/>',
        save: '<path d="M4 3h14l2 2v16H4z"/><path d="M8 3v6h8V3M8 21v-7h8v7"/>',
        alert: '<path d="M10.3 3.9 2.6 18a2 2 0 0 0 1.8 3h15.2a2 2 0 0 0 1.8-3L13.7 3.9a2 2 0 0 0-3.4 0Z"/><path d="M12 9v4M12 17h.01"/>',
        pause: '<path d="M8 5v14M16 5v14"/>',
        stop: '<rect x="6" y="6" width="12" height="12" rx="2"/>',
        close: '<path d="m6 6 12 12M18 6 6 18"/>',
        check: '<path d="m5 12 4 4L19 6"/>',
        lightbulb: '<path d="M9 18h6M10 22h4"/><path d="M8.2 15.5A7 7 0 1 1 15.8 15.5c-.8.6-.8 1.5-.8 2.5H9c0-1 0-1.9-.8-2.5Z"/>',
        link: '<path d="M10 13a5 5 0 0 0 7.1 0l2-2a5 5 0 0 0-7.1-7.1l-1.1 1.1"/><path d="M14 11a5 5 0 0 0-7.1 0l-2 2A5 5 0 0 0 12 20.1l1.1-1.1"/>',
        scale: '<path d="M12 3v18M5 6h14M7 6l-4 7h8zM17 6l-4 7h8zM8 21h8"/>',
        puzzle: '<path d="M19 13h2v6a2 2 0 0 1-2 2h-6v-2a2 2 0 1 0-4 0v2H5a2 2 0 0 1-2-2v-5h2a2 2 0 1 0 0-4H3V5a2 2 0 0 1 2-2h5v2a2 2 0 1 0 4 0V3h5a2 2 0 0 1 2 2v4h-2a2 2 0 1 0 0 4Z"/>',
        inbox: '<path d="M4 4h16v16H4z"/><path d="M4 14h5l2 3h2l2-3h5"/>',
        note: '<path d="M5 3h10l4 4v14H5z"/><path d="M15 3v5h5M8 12h8M8 16h6"/>',
        eye: '<path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>',
        network: '<circle cx="12" cy="5" r="2.5"/><circle cx="5" cy="18" r="2.5"/><circle cx="19" cy="18" r="2.5"/><path d="m10.8 7.2-4.6 8.6M13.2 7.2l4.6 8.6M7.5 18h9"/>',
        user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
        phone: '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.8a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.8.7A2 2 0 0 1 22 16.9Z"/>',
        mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
        message: '<path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z"/><path d="M8 9h8M8 13h5"/>',
        star: '<path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9z"/>',
        flame: '<path d="M12 22c4 0 7-3 7-7 0-3-1.5-5.5-4-8 .2 3-1.5 4-2.5 4.5.5-3-1-6-4-9 .2 4-3.5 6.5-3.5 11.5 0 4.4 3 8 7 8Z"/><path d="M9 18c0-2 1.5-3.5 3-5 0 2 2 2.7 2 4.5A2.5 2.5 0 0 1 9 18Z"/>',
        briefcase: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V4h8v3M3 12h18M10 12v2h4v-2"/>',
        building: '<path d="M4 21V7l8-4 8 4v14M2 21h20"/><path d="M8 9h2M14 9h2M8 13h2M14 13h2M8 17h2M14 17h2"/>',
        tool: '<path d="M14.7 6.3a4 4 0 0 0-5-5L12 3.6 9.6 6 7.3 3.7a4 4 0 0 0 5 5L4 17l3 3 7.7-8.3a4 4 0 0 0 5-5L17.4 9 15 6.6z"/>',
        map: '<path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3z"/><path d="M9 3v15M15 6v15"/>',
        activity: '<path d="M3 12h4l2-7 4 14 2-7h6"/>',
        sparkles: '<path d="m12 3 1.2 3.8L17 8l-3.8 1.2L12 13l-1.2-3.8L7 8l3.8-1.2zM5 14l.8 2.2L8 17l-2.2.8L5 20l-.8-2.2L2 17l2.2-.8zM19 13l.6 1.4L21 15l-1.4.6L19 17l-.6-1.4L17 15l1.4-.6z"/>',
        trophy: '<path d="M8 4h8v5a4 4 0 0 1-8 0zM10 16h4M12 13v3M8 20h8"/><path d="M8 6H4v2a4 4 0 0 0 4 4M16 6h4v2a4 4 0 0 1-4 4"/>',
        arrowRight: '<path d="M5 12h14M13 6l6 6-6 6"/>',
        play: '<path d="m8 5 11 7-11 7z"/>',
        moon: '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>'
    };

    var glyphs = {
        '⌂':'home', '🏠':'home', '☀':'sun', '☀️':'sun', '🌅':'sun', '🌙':'sun',
        '☑':'checkSquare', '☑️':'checkSquare', '✅':'checkSquare', '📋':'checkSquare',
        '📖':'book', '📕':'book', '📘':'book', '📚':'library', '◫':'book',
        '🏔️':'mountain', '△':'mountain', '📓':'journal', '📝':'note', '✍️':'note', '✏️':'note',
        '📈':'trend', '↗':'trend', '📊':'chart', '🤝':'users', '👥':'users', '◎':'users',
        '⚙':'settings', '⚙️':'settings', '⌕':'search', '🔍':'search', '🔎':'search',
        '📅':'calendar', '🕐':'clock', '🕒':'clock', '⏰':'clock', '⏱️':'clock',
        '🎯':'target', '➕':'plus', '＋':'plus', '☰':'menu', '🧠':'brain', '🧪':'flask', '⚗':'flask',
        '🎓':'graduation', '👨‍🏫':'graduation', '🧑‍🏫':'graduation', '🎴':'cards', '🃏':'cards',
        '🧭':'compass', '🔄':'refresh', '🔀':'refresh', '🏥':'health', '🩺':'health',
        '💾':'save', '📤':'upload', '📥':'download', '🗑️':'trash', '⚠':'alert', '⚠️':'alert',
        '⏸️':'pause', '⏹️':'stop', '✖':'close', '✖️':'close', '💡':'lightbulb', '🔗':'link',
        '⚖':'scale', '⚖️':'scale', '🧩':'puzzle', '🕸️':'network', '🕸':'network', '📨':'inbox', '👤':'user', '📞':'phone',
        '✉️':'mail', '📧':'mail', '💬':'message', '⭐':'star', '🌟':'star', '🔥':'flame',
        '💼':'briefcase', '🏗️':'building', '🏢':'building', '🧱':'building', '🔧':'tool',
        '🗺️':'map', '⚡':'activity', '✨':'sparkles', '🏆':'trophy', '▶':'play', '▶️':'play',
        '→':'arrowRight', '🕌':'moon'
    };

    var orderedGlyphs = Object.keys(glyphs).sort(function(a, b){ return b.length - a.length; });

    function iconMarkup(name, className) {
        var body = paths[name] || paths.sparkles;
        return '<svg class="ui-icon' + (className ? ' ' + className : '') + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' + body + '</svg>';
    }

    function resolveGlyph(value) {
        var text = String(value || '').trimStart();
        for (var i = 0; i < orderedGlyphs.length; i++) {
            if (text.indexOf(orderedGlyphs[i]) === 0) return { glyph:orderedGlyphs[i], name:glyphs[orderedGlyphs[i]] };
        }
        return null;
    }

    function createIcon(name) {
        var holder = document.createElement('span');
        holder.innerHTML = iconMarkup(name);
        return holder.firstElementChild;
    }

    function enhanceTextNode(node, host) {
        if (!node || node.nodeType !== 3) return false;
        var leading = resolveGlyph(node.nodeValue);
        if (!leading) return false;
        var raw = node.nodeValue;
        var offset = raw.length - raw.trimStart().length;
        node.nodeValue = raw.slice(0, offset) + raw.slice(offset + leading.glyph.length).replace(/^\s+/, '');
        node.parentNode.insertBefore(createIcon(leading.name), node);
        (host || node.parentElement).classList.add('has-ui-icon');
        return true;
    }

    function enhanceLeadingIcon(element) {
        if (!element || element.nodeType !== 1) return;
        if (element.matches('[data-icon]')) {
            if (element.dataset.iconEnhanced === 'true' && element.querySelector('.ui-icon')) return;
            element.innerHTML = iconMarkup(element.dataset.icon, element.dataset.iconClass || '');
            element.dataset.iconEnhanced = 'true';
            element.classList.add('has-ui-icon');
            return;
        }
        if (element.querySelector(':scope > .ui-icon, :scope > span:first-child > .ui-icon')) return;
        var firstElement = element.firstElementChild;
        if (firstElement && firstElement.tagName === 'SPAN' && !firstElement.querySelector('.ui-icon')) {
            var spanNodes = Array.from(firstElement.childNodes);
            for (var s = 0; s < spanNodes.length; s++) {
                if (String(spanNodes[s].nodeValue || '').trim() && enhanceTextNode(spanNodes[s], element)) break;
            }
        }
        var nodes = Array.from(element.childNodes);
        for (var i = 0; i < nodes.length; i++) {
            if (nodes[i].nodeType === 3 && String(nodes[i].nodeValue || '').trim()) {
                enhanceTextNode(nodes[i], element);
                break;
            }
        }
    }

    function normalizeHierarchy(root) {
        root.querySelectorAll('.page').forEach(function(page){ page.classList.add('studyos-page'); });
        root.querySelectorAll('.page > .page-header').forEach(function(header){ header.classList.add('page-header-primary'); });
        root.querySelectorAll('.tab-panel > .page-header').forEach(function(header){ header.classList.add('page-header-section'); });
        root.querySelectorAll('.page-header > div[style*="display:flex"]').forEach(function(layout){ layout.classList.add('page-header-layout'); });
        root.querySelectorAll('[style*="grid-template-columns:repeat(auto-fit"]').forEach(function(grid){ grid.classList.add('metric-grid'); });
        root.querySelectorAll('.metric-grid > .card[style*="text-align:center"]').forEach(function(card){ card.classList.add('metric-card'); });
        root.querySelectorAll('.summary-card[onclick], .card[onclick], button.card').forEach(function(card){ card.classList.add('is-clickable'); });

        root.querySelectorAll('input[type="text"], input[type="search"]').forEach(function(input){
            var leading = resolveGlyph(input.placeholder || '');
            if (leading) input.placeholder = String(input.placeholder).replace(leading.glyph, '').trimStart();
            var parent = input.parentElement;
            if (parent && parent.querySelector(':scope > span') && /Search/i.test(input.placeholder || input.id || '')) parent.classList.add('search-field');
        });
        root.querySelectorAll('.search-field > span').forEach(enhanceLeadingIcon);
    }

    function enhance(root) {
        root = root && root.querySelectorAll ? root : document;
        normalizeHierarchy(root);
        var selector = [
            '[data-icon]', '.nav-link > span:first-child', '.mobile-nav button > span:first-child', '.hamburger',
            '.topbar-search > span:first-child', '.commitment-bell-icon', '.capture-short', '.command-search-row > span:first-child',
            '.page-header h1', '.page-header h2', '.filter-btn', '.btn', '.card-title', '.ux-section-head',
            '.protocol-title', '.study-timer-label', '.learning-action-icon', '.command-result-icon', '.capture-list-icon',
            '.capture-empty-mark', '.tip-icon', '.session-icon', '.modal-header h3', '.search-field > span',
            '.learning-ladder-arrow'
        ].join(',');
        if (root.matches && root.matches(selector)) enhanceLeadingIcon(root);
        root.querySelectorAll(selector).forEach(enhanceLeadingIcon);
    }

    var scheduled = false;
    var pendingRoots = [];

    function queueRoot(root) {
        root = root && root.querySelectorAll ? root : document;
        if (root === document) {
            pendingRoots = [document];
            return;
        }
        if (pendingRoots.indexOf(document) !== -1) return;
        for (var i = pendingRoots.length - 1; i >= 0; i--) {
            var queued = pendingRoots[i];
            if (queued === root || (queued.contains && queued.contains(root))) return;
            if (root.contains && root.contains(queued)) pendingRoots.splice(i, 1);
        }
        pendingRoots.push(root);
    }

    function scheduleEnhance(root) {
        queueRoot(root);
        if (scheduled) return;
        scheduled = true;
        requestAnimationFrame(function(){
            var roots = pendingRoots.slice();
            pendingRoots = [];
            scheduled = false;
            roots.forEach(enhance);
        });
    }

    function scheduleActivePage() {
        scheduleEnhance(document.querySelector('.page.active') || document.body);
    }

    window.studyosIcon = iconMarkup;
    window.STUDYOS_ICONS = { render:iconMarkup, enhance:enhance, paths:paths, glyphs:glyphs };

    document.addEventListener('DOMContentLoaded', function(){
        enhance(document);
        var observer = new MutationObserver(function(mutations){
            mutations.forEach(function(mutation){
                var meaningful = Array.from(mutation.addedNodes || []).some(function(node){
                    return !(node.nodeType === 1 && node.matches && node.matches('svg.ui-icon'));
                });
                if (meaningful) scheduleEnhance(mutation.target);
            });
        });
        observer.observe(document.body, { childList:true, subtree:true });
        if (typeof EVENTS !== 'undefined') {
            EVENTS.on('navigation:changed', scheduleActivePage);
            EVENTS.on('storage:changed', scheduleActivePage);
            EVENTS.on('system:restored', function(){ scheduleEnhance(document); });
        }
    });
})();
