// ==================== APPLICATION SHELL ====================
// Shared navigation, topbar, overlays, and mount points live here so
// index.html remains a small bootstrap document.
(function () {
    'use strict';

    var mount = document.getElementById('appShell');
    if (!mount) {
        console.error('StudyOS shell mount #appShell not found');
        return;
    }

    mount.innerHTML = String.raw`
    <button class="hamburger" type="button" onclick="toggleSidebar()" aria-label="Open navigation" aria-controls="primarySidebar" aria-expanded="false"><span data-icon="menu"></span></button>
    <div class="sidebar-overlay" onclick="toggleSidebar()" aria-hidden="true"></div>
    <div class="app">
        <nav class="sidebar" id="primarySidebar" aria-label="Primary navigation">
            <div class="sidebar-brand">
                <div class="sidebar-brand-row">
                    <div>
                        <div class="sidebar-name">StudyOS</div>
                        <div class="sidebar-edition">V62 · Dedicated Mushaf</div>
                    </div>
                </div>
                <div class="sidebar-status">
                    <div id="sidebarDate"></div>
                    <div id="sidebarHealth" class="badge">—</div>
                </div>
            </div>

            <div class="nav-section">
                <div class="nav-section-title">Daily command</div>
                <div class="nav-link active" data-route="dashboard" onclick="go('dashboard')"><span data-icon="home"></span><strong>Home</strong></div>
                <div class="nav-link" data-route="dailyops" onclick="go('dailyops')"><span data-icon="sun"></span><strong>Today</strong></div>
                <div class="nav-link" data-route="planner" onclick="go('planner')"><span data-icon="checkSquare"></span><strong>Plan</strong></div>
            </div>
            <div class="nav-section nav-section-priority">
                <div class="nav-section-title">Your work</div>
                <div class="nav-link nav-link-sub" data-route="tasks" onclick="go('tasks')"><span data-icon="checkSquare"></span><strong>Tasks</strong><small>Due and next</small></div>
                <div class="nav-link nav-link-sub" data-route="goals" onclick="go('goals')"><span data-icon="target"></span><strong>Goals</strong><small>Progress</small></div>
                <div class="nav-link nav-link-sub" data-route="calendar" onclick="go('calendar')"><span data-icon="calendar"></span><strong>Calendar</strong><small>Schedule</small></div>
                <div class="nav-link nav-link-sub" data-route="tracker" onclick="go('tracker')"><span data-icon="clock"></span><strong>Time log</strong><small>Study and work</small></div>
                <div class="nav-link nav-link-sub" data-route="review" onclick="go('review')"><span data-icon="trend"></span><strong>Weekly review</strong><small>Reset and learn</small></div>
            </div>
            <div class="nav-section">
                <div class="nav-section-title">Learn &amp; apply</div>
                <div class="nav-link" data-route="study" onclick="go('study')"><span data-icon="book"></span><strong>Study</strong></div>
                <div class="nav-link" data-route="knowledge" onclick="go('knowledge')"><span data-icon="library"></span><strong>Knowledge</strong></div>
                <div class="nav-link" data-route="strategy" onclick="go('strategy')"><span data-icon="mountain"></span><strong>Career Strategy</strong></div>
            </div>
            <div class="nav-section">
                <div class="nav-section-title">Reflect &amp; connect</div>
                <div class="nav-link" data-route="journal" onclick="go('journal')"><span data-icon="journal"></span><strong>Journal</strong></div>
                <div class="nav-link" data-route="reviewhub" onclick="go('reviewhub')"><span data-icon="trend"></span><strong>Review</strong></div>
                <div class="nav-link" data-route="network" onclick="go('network')"><span data-icon="users"></span><strong>Network</strong></div>
            </div>
            <div class="nav-section">
                <div class="nav-section-title">Faith</div>
                <div class="nav-link" data-route="quran" onclick="go('quran')"><span data-icon="moon"></span><strong>Quran</strong></div>
                <div class="nav-link" data-route="mushaf" onclick="go('mushaf')"><span data-icon="book"></span><strong>Mushaf Reader</strong></div>
            </div>
            <div class="nav-section nav-section-system">
                <div class="nav-section-title">System</div>
                <div class="nav-link" data-route="system" onclick="go('system')"><span data-icon="settings"></span><strong>Guide, data &amp; health</strong></div>
            </div>
        </nav>

        <main class="main">
            <header class="app-topbar">
                <div class="topbar-context" aria-live="polite">
                    <span id="topbarSection">Daily command</span>
                    <span class="topbar-divider">/</span>
                    <strong id="topbarPage">Home</strong>
                </div>
                <div class="topbar-actions">
                    <button class="topbar-search" onclick="openCommandPalette()"><span><span data-icon="search"></span>Search</span><kbd>⌘K</kbd></button>
                    <button class="commitment-bell" id="commitmentBell" onclick="openCommitmentCenter()" aria-label="Commitment intelligence">
                        <span class="commitment-bell-icon" data-icon="calendar"></span><span class="commitment-bell-label">Schedule</span><span class="commitment-bell-count" id="commitmentBellCount">0</span>
                    </button>
                    <button class="btn btn-secondary btn-sm topbar-capture" onclick="openQuickCapture()" aria-label="Quick capture"><span class="capture-short" data-icon="plus"></span><span class="capture-label">Capture</span></button>
                    <button class="btn btn-primary btn-sm topbar-focus" onclick="startFocusMode()"><span data-icon="target"></span><span>Start focus</span></button>
                </div>
            </header>

            <div id="commitmentHeadsUp" class="commitment-headsup" hidden aria-live="polite"></div>
            <div id="pageContainer"></div>
        </main>
    </div>

    <nav class="mobile-nav" aria-label="Mobile navigation">
        <button data-route="dashboard" onclick="go('dashboard')"><span data-icon="home"></span>Home</button>
        <button data-route="dailyops" onclick="go('dailyops')"><span data-icon="sun"></span>Today</button>
        <button data-route="tasks" onclick="go('tasks')"><span data-icon="checkSquare"></span>Tasks</button>
        <button data-route="study" onclick="go('study')"><span data-icon="book"></span>Study</button>
        <button data-route="quran" onclick="go('quran')"><span data-icon="moon"></span>Quran</button>
        <button onclick="toggleSidebar()"><span data-icon="menu"></span>More</button>
    </nav>

    <div class="command-palette" id="commandPalette" role="dialog" aria-modal="true" aria-labelledby="commandPaletteTitle" onclick="if(event.target===this)closeCommandPalette()">
        <div class="command-palette-box">
            <div class="command-search-row">
                <span data-icon="search"></span>
                <input id="commandSearch" type="search" placeholder="Search pages, notes, tasks, sources, decisions…" oninput="renderCommandResults()" autocomplete="off" aria-label="Search all StudyOS content">
                <button onclick="closeCommandPalette()" aria-label="Close search">Esc</button>
            </div>
            <div class="command-palette-title" id="commandPaletteTitle">Find anything</div>
            <div id="commandResults" class="command-results"></div>
            <div class="command-help"><span>↑↓ move</span><span>Enter open</span><span>Esc close</span></div>
        </div>
    </div>

    <div class="focus-overlay" id="focusOverlay">
        <div class="focus-task" id="focusTask">Deep Work Session</div>
        <div style="width:100%;max-width:520px;margin-top:10px;">
            <div class="progress" style="height:10px;"><div class="progress-fill" id="focusProgressFill" style="width:0%;"></div></div>
            <div id="focusMeta" style="display:flex;justify-content:space-between;gap:10px;margin-top:8px;color:var(--text-muted);font-family:var(--font-mono);font-size:0.82rem;">
                <span id="focusMetaLeft">IN SESSION</span><span id="focusMetaRight">—</span>
            </div>
        </div>
        <div class="focus-time" id="focusTime" style="margin-top:8px;">25:00</div>
        <div style="display:flex;gap:12px;flex-wrap:wrap;justify-content:center;margin-top:10px;">
            <button class="btn btn-secondary" id="focusPauseBtn" onclick="pauseFocusMode()"><span data-icon="pause"></span>Pause</button>
            <button class="btn btn-primary" id="focusCompleteBtn" onclick="completeFocusMode()"><span data-icon="check"></span>Complete &amp; Log</button>
            <button class="btn btn-danger" id="focusExitBtn" onclick="exitFocusMode()"><span data-icon="close"></span>Exit</button>
        </div>
        <div class="focus-quote" id="focusQuote" style="max-width:680px;text-align:center;margin-top:14px;">"The successful warrior is the average man, with laser-like focus." — Bruce Lee</div>
    </div>

    <div id="modalContainer"></div>
    <div class="toast" id="toast"><span id="toastMsg"></span></div>
    <div class="study-timer" id="studyTimer">
        <div class="study-timer-label" id="studyTimerLabel"><span data-icon="target"></span>Active Recall</div>
        <div class="study-timer-time" id="studyTimerDisplay">15:00</div>
        <div class="study-timer-controls">
            <button class="btn btn-secondary btn-sm" onclick="pauseStudyTimer()"><span data-icon="pause"></span>Pause</button>
            <button class="btn btn-danger btn-sm" onclick="stopStudyTimer()"><span data-icon="stop"></span>Stop</button>
        </div>
    </div>`;
})();
