// ==================== MOBILE SHELL (V57) ====================
// Centralizes drawer state, dynamic viewport sizing, keyboard/safe-area
// handling, and horizontal tab visibility on touch devices.
(function () {
    'use strict';

    var mobileQuery = window.matchMedia ? window.matchMedia('(max-width: 900px)') : null;
    var lastDrawerTrigger = null;

    function isMobile() {
        return mobileQuery ? mobileQuery.matches : window.innerWidth <= 900;
    }

    function sidebarElements() {
        return {
            sidebar: document.querySelector('.sidebar'),
            overlay: document.querySelector('.sidebar-overlay'),
            trigger: document.querySelector('.hamburger')
        };
    }

    function setDrawer(open, options) {
        var els = sidebarElements();
        if (!els.sidebar || !els.overlay) return;
        var shouldOpen = !!open && isMobile();

        els.sidebar.classList.toggle('open', shouldOpen);
        els.overlay.classList.toggle('show', shouldOpen);
        els.sidebar.setAttribute('aria-hidden', shouldOpen ? 'false' : (isMobile() ? 'true' : 'false'));
        els.overlay.setAttribute('aria-hidden', shouldOpen ? 'false' : 'true');
        document.body.classList.toggle('mobile-drawer-open', shouldOpen);

        if (els.trigger) {
            els.trigger.setAttribute('aria-expanded', shouldOpen ? 'true' : 'false');
            els.trigger.setAttribute('aria-label', shouldOpen ? 'Close navigation' : 'Open navigation');
        }

        if (shouldOpen) {
            lastDrawerTrigger = document.activeElement;
            var active = els.sidebar.querySelector('.nav-link.active') || els.sidebar.querySelector('.nav-link');
            if (active && active.focus && !(options && options.skipFocus)) {
                window.setTimeout(function () { active.focus({ preventScroll: true }); }, 0);
            }
        } else if (options && options.restoreFocus && lastDrawerTrigger && lastDrawerTrigger.focus) {
            lastDrawerTrigger.focus({ preventScroll: true });
        }
    }

    function toggleDrawer() {
        var sidebar = document.querySelector('.sidebar');
        setDrawer(!(sidebar && sidebar.classList.contains('open')), { restoreFocus: true });
    }

    function closeDrawer(options) {
        setDrawer(false, options || {});
    }

    function syncViewportHeight() {
        var height = window.visualViewport ? window.visualViewport.height : window.innerHeight;
        if (!height || !Number.isFinite(height)) return;
        document.documentElement.style.setProperty('--app-viewport-height', Math.round(height) + 'px');
    }

    function activeTabIntoView(root) {
        var scope = root && root.querySelectorAll ? root : document;
        scope.querySelectorAll('.filter-bar, [role="tablist"]').forEach(function (bar) {
            var active = bar.querySelector('.filter-btn.active, [role="tab"][aria-selected="true"]');
            if (!active || bar.scrollWidth <= bar.clientWidth) return;
            window.requestAnimationFrame(function () {
                var target = active.offsetLeft - Math.max(0, (bar.clientWidth - active.offsetWidth) / 2);
                target = Math.max(0, Math.min(target, bar.scrollWidth - bar.clientWidth));
                try {
                    bar.scrollTo({ left: target, behavior: 'smooth' });
                } catch (e) {
                    bar.scrollLeft = target;
                }
            });
        });
    }

    function updateShellForBreakpoint() {
        var els = sidebarElements();
        if (!els.sidebar) return;
        if (isMobile()) {
            if (!els.sidebar.classList.contains('open')) els.sidebar.setAttribute('aria-hidden', 'true');
        } else {
            els.sidebar.classList.remove('open');
            if (els.overlay) els.overlay.classList.remove('show');
            els.sidebar.setAttribute('aria-hidden', 'false');
            document.body.classList.remove('mobile-drawer-open');
            if (els.trigger) els.trigger.setAttribute('aria-expanded', 'false');
        }
        syncViewportHeight();
        activeTabIntoView(document.querySelector('.page.active') || document);
    }

    // Replace the older two-class toggle with a state-safe implementation.
    window.toggleSidebar = toggleDrawer;
    window.closeMobileSidebar = closeDrawer;
    window.studyosMobileSync = updateShellForBreakpoint;
    window.studyosMobileRevealActiveTab = activeTabIntoView;

    document.addEventListener('DOMContentLoaded', function () {
        var els = sidebarElements();
        if (els.sidebar) els.sidebar.id = els.sidebar.id || 'primarySidebar';
        if (els.trigger) {
            els.trigger.setAttribute('aria-controls', els.sidebar ? els.sidebar.id : 'primarySidebar');
            els.trigger.setAttribute('aria-expanded', 'false');
        }
        if (els.overlay) els.overlay.setAttribute('aria-hidden', 'true');

        updateShellForBreakpoint();

        document.addEventListener('keydown', function (event) {
            if (event.key === 'Escape') closeDrawer({ restoreFocus: true });
        });

        document.addEventListener('click', function (event) {
            var navControl = event.target.closest('.sidebar .nav-link, .mobile-nav [data-route]');
            if (navControl) {
                closeDrawer({ skipFocus: true });
                window.setTimeout(function () {
                    activeTabIntoView(document.querySelector('.page.active') || document);
                }, 0);
            }

            var tab = event.target.closest('.filter-btn, [role="tab"]');
            if (tab) {
                window.setTimeout(function () {
                    var bar = tab.closest('.filter-bar, [role="tablist"]');
                    activeTabIntoView(bar || document);
                }, 0);
            }
        });

        var pageContainer = document.getElementById('pageContainer');
        if (pageContainer && window.MutationObserver) {
            var observer = new MutationObserver(function (records) {
                var needsSync = records.some(function (record) {
                    return record.type === 'attributes' && (record.attributeName === 'class' || record.attributeName === 'aria-selected');
                });
                if (needsSync) activeTabIntoView(document.querySelector('.page.active') || pageContainer);
            });
            observer.observe(pageContainer, {
                subtree: true,
                attributes: true,
                attributeFilter: ['class', 'aria-selected']
            });
        }
    });

    window.addEventListener('resize', updateShellForBreakpoint, { passive: true });
    window.addEventListener('orientationchange', function () {
        window.setTimeout(updateShellForBreakpoint, 120);
    }, { passive: true });

    if (window.visualViewport) {
        window.visualViewport.addEventListener('resize', syncViewportHeight, { passive: true });
        window.visualViewport.addEventListener('scroll', syncViewportHeight, { passive: true });
    }

    if (mobileQuery && mobileQuery.addEventListener) {
        mobileQuery.addEventListener('change', updateShellForBreakpoint);
    } else if (mobileQuery && mobileQuery.addListener) {
        mobileQuery.addListener(updateShellForBreakpoint);
    }
})();
