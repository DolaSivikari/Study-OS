// =====================================================================
// STUDYOS V60 — LIVE UI UNIFICATION BRIDGE
// Applies the Claude Design hierarchy to static page templates and to
// dynamic content generated after load. It never replaces content, IDs,
// event handlers, storage contracts, routes, or Quran data.
// =====================================================================
(function () {
    'use strict';

    var PAGE_LABELS = {
        dashboard: 'Dashboard', dailyops: 'Today', planner: 'Plan', study: 'Study',
        knowledge: 'Knowledge', strategy: 'Career Strategy', journal: 'Journal',
        reviewhub: 'Review', network: 'Network', quran: 'Quran',
        mushaf: 'Mushaf Reader', system: 'System'
    };

    var METRIC_ROOTS = [
        'goalStats', 'journalStats', 'knowledgeStats', 'scienceSummary',
        'systemHealthStats', 'reviewMetrics', 'networkMetrics'
    ];

    function isMetricCard(card) {
        if (!card || !card.classList || !card.classList.contains('card')) return false;
        if (card.classList.contains('summary-card')) return false;
        if (card.classList.contains('metric-card') || card.classList.contains('ui-metric-card')) return true;
        var style = String(card.getAttribute('style') || '').replace(/\s+/g, '').toLowerCase();
        if (style.indexOf('text-align:center') !== -1 && style.indexOf('padding') !== -1) return true;
        var children = Array.prototype.filter.call(card.children || [], function (el) {
            return el.tagName !== 'SCRIPT' && el.tagName !== 'STYLE';
        });
        if (children.length === 2 && !card.querySelector('button,input,textarea,select,canvas,table')) {
            var text = String(children[0].textContent || '').trim();
            return /^[-–—+]?\d[\d.,%/hmd\s🔥]*$/i.test(text) || text === '—';
        }
        return false;
    }

    function annotateHeader(header, primary) {
        if (!header || !header.classList) return;
        header.classList.add(primary ? 'page-header-primary' : 'page-header-section');
        var layout = header.firstElementChild;
        if (layout && layout.tagName === 'DIV') layout.classList.add('page-header-layout');
        var actions = header.querySelector(':scope > .page-actions, :scope > div > .page-actions');
        if (actions) actions.classList.add('page-actions');
    }

    function annotateMetricContainer(container) {
        if (!container || !container.children) return;
        var cards = Array.prototype.filter.call(container.children, function (child) {
            return child.classList && child.classList.contains('card');
        });
        if (!cards.length) return;
        var metricCards = cards.filter(isMetricCard);
        if (metricCards.length && metricCards.length >= Math.ceil(cards.length * 0.6)) {
            container.classList.add('ui-metric-grid');
            metricCards.forEach(function (card) { card.classList.add('ui-metric-card', 'metric-card'); });
        }
    }

    function annotate(root) {
        root = root && root.querySelectorAll ? root : document;

        Object.keys(PAGE_LABELS).forEach(function (id) {
            var page = document.getElementById(id);
            if (!page) return;
            // V62.1: 'claude-design-page' was previously hard-coded into the
            // static page templates by V61. It is applied here instead so the
            // V61 style layer follows live markup and dynamically rendered
            // content, exactly like every other class this bridge applies.
            page.classList.add('studyos-page', 'claude-design-page');
            if (!page.getAttribute('data-screen-label')) page.setAttribute('data-screen-label', PAGE_LABELS[id]);

            var directHeaders = page.querySelectorAll(':scope > .page-header');
            if (directHeaders[0]) annotateHeader(directHeaders[0], true);
            page.querySelectorAll('.tab-panel > .page-header').forEach(function (header) {
                annotateHeader(header, false);
            });

            var primaryTabs = page.querySelector(':scope > .filter-bar');
            if (primaryTabs) primaryTabs.classList.add('primary-tabs');
        });

        root.querySelectorAll('.card').forEach(function (card) {
            if (isMetricCard(card)) card.classList.add('ui-metric-card', 'metric-card');
        });

        root.querySelectorAll('[style*="display:grid"], .metric-grid').forEach(annotateMetricContainer);
        METRIC_ROOTS.forEach(function (id) { annotateMetricContainer(document.getElementById(id)); });

        root.querySelectorAll('.ux-section-head').forEach(function (el) {
            el.classList.add('ui-section-label');
        });

        root.querySelectorAll('.summary-card[onclick], .card[onclick]').forEach(function (el) {
            el.classList.add('is-clickable');
        });

        if (window.STUDYOS_ICONS && typeof window.STUDYOS_ICONS.enhance === 'function') {
            try { window.STUDYOS_ICONS.enhance(root === document ? document : root); } catch (e) {}
        }
    }

    window.applyStudyOSUnification = annotate;

    annotate(document);

    var scheduled = false;
    function scheduleAnnotate() {
        if (scheduled) return;
        scheduled = true;
        window.requestAnimationFrame(function () {
            scheduled = false;
            annotate(document);
        });
    }

    if (window.MutationObserver) {
        var observer = new MutationObserver(function (mutations) {
            var meaningful = mutations.some(function (m) { return m.addedNodes && m.addedNodes.length; });
            if (meaningful) scheduleAnnotate();
        });
        observer.observe(document.getElementById('pageContainer') || document.body, {
            childList: true,
            subtree: true
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        annotate(document);
        window.setTimeout(function () { annotate(document); }, 120);
        window.setTimeout(function () { annotate(document); }, 500);
    });
})();
