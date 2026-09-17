// ==================== PAGE LOADER ====================
// Extracts page content from window.STUDYOS_PAGES (populated by the
// pages/*.page.js <script> tags loaded just above this file in index.html)
// and injects them into #pageContainer.
// Works on file:// protocol (no XHR, no server needed, no ES modules).
// Each page's HTML lives in its own pages/PAGENAME.page.js file so it can
// be edited independently without touching index.html.
//
// Back-compat: if a page's file failed to load for some reason, fall back
// to an inline <template id="tpl-*"> in index.html if one still exists,
// so a single missing script doesn't take down page-loader entirely.

(function() {
    var PAGE_IDS = [
        'dashboard','dailyops','planner','study','knowledge',
        'strategy','journal','reviewhub','network','system','quran','mushaf'
    ];

    var container = document.getElementById('pageContainer');
    if (!container) {
        console.error('PageLoader: #pageContainer not found');
        return;
    }

    var pages = window.STUDYOS_PAGES || {};
    var html = '';
    var loaded = 0;
    var failed = [];

    PAGE_IDS.forEach(function(pid) {
        if (typeof pages[pid] === 'string') {
            html += pages[pid] + '\n';
            loaded++;
            return;
        }
        var tpl = document.getElementById('tpl-' + pid);
        if (tpl) {
            html += tpl.innerHTML + '\n';
            loaded++;
        } else {
            failed.push(pid);
        }
    });

    container.innerHTML = html;

    // Keep page routing correct even if a stylesheet is delayed, blocked, or
    // overridden. Only the dashboard is mounted on first paint; router.js
    // owns subsequent page visibility.
    Array.prototype.forEach.call(container.querySelectorAll('.page'), function(page) {
        var isHome = page.id === 'dashboard';
        page.classList.toggle('active', isHome);
        page.hidden = !isHome;
        page.setAttribute('aria-hidden', isHome ? 'false' : 'true');
    });

    if (failed.length > 0) {
        console.warn('PageLoader: Missing page content (checked window.STUDYOS_PAGES and <template>):', failed);
    }

    console.log('PageLoader: ' + loaded + '/' + PAGE_IDS.length + ' pages loaded');
})();
