window.STUDYOS_PAGES = window.STUDYOS_PAGES || {};

window.STUDYOS_PAGES.dashboard = String.raw`
<div class="page active" id="dashboard">
            <!-- HEADER -->
            <div class="page-header dashboard-hero" style="padding-bottom:8px;">
                <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;">
                    <div>
                        <h2 style="margin:0;">Good <span id="greeting">morning</span>, <span id="userName">Hebun</span></h2>
                        <div style="color:var(--text-muted);font-size:0.85rem;margin-top:4px;" id="heroVision"></div>
                    </div>
                    <div style="display:flex;gap:6px;">
                        <span class="badge" id="systemHealthBadge">OPERATIONAL</span>
                        <button class="btn btn-sm btn-primary" onclick="go('protocol')">🌅 Morning / Evening</button>
                        <button class="btn btn-sm btn-secondary" onclick="startFocusMode()">🎯 Focus</button>
                    </div>
                </div>
            </div>

            <!-- PRIMARY STRIP: the four signals most useful at the start of a day -->
            <div class="summary-strip dashboard-primary-metrics" style="margin-bottom:12px;">
                <div class="summary-card" onclick="go('goals')" style="cursor:pointer;">
                    <span class="summary-card-icon" data-icon="target" aria-hidden="true"></span>
                    <div class="summary-kicker">Goals</div>
                    <div class="summary-value" id="dashGoalsPct">—</div>
                    <div class="summary-hint" id="dashGoalsHint">progress</div>
                </div>
                <div class="summary-card" onclick="go('tasks')" style="cursor:pointer;">
                    <span class="summary-card-icon" data-icon="checkSquare" aria-hidden="true"></span>
                    <div class="summary-kicker">Tasks</div>
                    <div class="summary-value" id="dashTaskCount">0</div>
                    <div class="summary-hint" id="dashTaskHint">due today</div>
                </div>
                <div class="summary-card" onclick="go('tracker')" style="cursor:pointer;">
                    <span class="summary-card-icon" data-icon="clock" aria-hidden="true"></span>
                    <div class="summary-kicker">Study</div>
                    <div class="summary-value" id="dashStudyHours">0h</div>
                    <div class="summary-hint" id="dashStudyHint">hours today</div>
                </div>
                <div class="summary-card" onclick="go('flashcards')" style="cursor:pointer;">
                    <span class="summary-card-icon" data-icon="cards" aria-hidden="true"></span>
                    <div class="summary-kicker">SRS Due</div>
                    <div class="summary-value" id="dashSRSCount">0</div>
                    <div class="summary-hint" id="dashSRSHint">cards</div>
                </div>
            </div>
            <details class="dashboard-secondary-metrics">
                <summary><span>More indicators</span><small>90-day direction and operating score</small></summary>
                <div class="summary-strip">
                <div class="summary-card" onclick="go('horizon')" style="cursor:pointer;">
                    <span class="summary-card-icon" data-icon="mountain" aria-hidden="true"></span>
                    <div class="summary-kicker">90-Day</div>
                    <div class="summary-value" id="dashHorizonPct">—</div>
                    <div class="summary-hint" id="dashHorizonHint">progress</div>
                </div>
                <div class="summary-card" onclick="go('operator')" style="cursor:pointer;">
                    <span class="summary-card-icon" data-icon="compass" aria-hidden="true"></span>
                    <div class="summary-kicker">Operator</div>
                    <div class="summary-value" id="dashOperatorScore">—</div>
                    <div class="summary-hint" id="dashOperatorHint">score</div>
                </div>
                </div>
            </details>

            <!-- V49: one random Quran passage per StudyOS opening.
                 Arabic and Tevhid Meali strings are read directly from the
                 validated Quran data files and are never rewritten here. -->
            <section class="daily-quran-card" id="dailyQuranVerseCard" aria-labelledby="dailyQuranVerseTitle">
                <div class="daily-quran-head">
                    <div>
                        <div class="daily-quran-kicker">Quran · Tevhid Meali</div>
                        <h3 id="dailyQuranVerseTitle">Daily Quran Verse</h3>
                        <p>Randomly selected once when StudyOS opens.</p>
                    </div>
                    <div class="daily-quran-actions">
                        <button class="btn btn-sm btn-secondary" type="button" onclick="dailyQuranNewVerse()">↻ New Verse</button>
                        <button class="btn btn-sm btn-primary" type="button" onclick="dailyQuranOpenInReader()">Open in Quran →</button>
                    </div>
                </div>
                <div id="dailyQuranVerseRoot" aria-live="polite"></div>
            </section>

            <div class="ux-section-head">🌅 Start Here — Today</div>
            <div class="card" style="padding:16px;margin-bottom:16px;">
                <div class="card-header" style="margin-bottom:12px;align-items:flex-start;">
                    <div>
                        <span class="card-title">🧭 What Should I Do Now?</span>
                        <div class="muted" style="margin-top:4px;">Your top recommendation, current pressure, and suggested next actions.</div>
                    </div>
                    <button class="btn btn-sm btn-secondary" onclick="go('system')">System →</button>
                </div>
                <div id="dashCommandDeck"></div>
            </div>

            <div id="dashCommitmentIntelligence" class="card commitment-dashboard"></div>

            <!-- TODAY ROW: Focus + Blind Spot + Next Move -->
            <div style="display:grid;grid-template-columns:1fr 1.2fr 1fr;gap:14px;margin-bottom:16px;">
                <div class="card" style="padding:14px;">
                    <div class="card-header" style="margin-bottom:10px;">
                        <span class="card-title">🎯 Today's Focus</span>
                        <span class="btn btn-sm btn-secondary" onclick="go('protocol')">Morning / Evening →</span>
                    </div>
                    <div id="todayFocusTask" style="font-weight:700;margin-bottom:6px;">Set your intention in the Morning Protocol</div>
                    <div id="todayFocusMeta" class="muted" style="font-size:0.8rem;"></div>
                    <div style="display:flex;justify-content:space-between;font-size:0.78rem;margin-top:12px;padding-top:10px;border-top:1px solid var(--border);">
                        <span class="muted">SRS: <span id="statSRS">—</span></span>
                        <span class="muted">Review: <span id="dashReviewStatus">—</span></span>
                        <span class="muted">Follow-ups: <span id="dashFollowups">0</span></span>
                    </div>
                </div>
                <div class="card" id="blindSpotCard" style="padding:14px;"></div>
                <div class="card" style="padding:14px;border-left:3px solid var(--accent);">
                    <div class="card-header" style="margin-bottom:10px;">
                        <span class="card-title">⚡ Next Move</span>
                        <span class="badge badge-blue">AI</span>
                    </div>
                    <div id="v7NextMovePanel"></div>
                </div>
            </div>

            <!-- V18.5: QUICK ACTIONS + FEATURE DIRECTORY -->
            <details class="dash-group" open><summary><span class="dash-group-title">Go to…</span><span class="dash-group-sub">Every tool, and where it lives</span></summary><div class="dash-group-body">
            <div class="ux-qa-row" style="display:grid;grid-template-columns:1fr 1.15fr;gap:14px;margin-bottom:16px;">
                <div class="card" style="padding:14px;">
                    <div class="card-header" style="margin-bottom:10px;">
                        <span class="card-title">⚡ Quick Actions</span>
                        <span class="muted" style="font-size:0.75rem;">one tap to log or launch</span>
                    </div>
                    <div class="ux-quick-grid">
                        <button class="btn btn-secondary ux-qa-btn" onclick="openTaskModal()"><span class="ux-qa-ico">➕</span><span>Add Task</span></button>
                        <button class="btn btn-secondary ux-qa-btn" onclick="openTimeModal()"><span class="ux-qa-ico">⏱️</span><span>Log Time</span></button>
                        <button class="btn btn-secondary ux-qa-btn" onclick="startFocusMode()"><span class="ux-qa-ico">🎯</span><span>Start Focus</span></button>
                        <button class="btn btn-secondary ux-qa-btn" onclick="go('flashcards')"><span class="ux-qa-ico">🎴</span><span>Review Cards</span></button>
                        <button class="btn btn-secondary ux-qa-btn" onclick="openJournalModal()"><span class="ux-qa-ico">✍️</span><span>Journal Entry</span></button>
                        <button class="btn btn-secondary ux-qa-btn" onclick="go('review')"><span class="ux-qa-ico">📋</span><span>Weekly Review</span></button>
                        <button class="btn btn-secondary ux-qa-btn" onclick="go('doctrine')"><span class="ux-qa-ico">🧠</span><span>Doctrine Library</span></button>
                        <button class="btn btn-secondary ux-qa-btn" onclick="go('pmptools')"><span class="ux-qa-ico">🎓</span><span>PMP Practice</span></button>
                        <button class="btn btn-secondary ux-qa-btn" onclick="openDecisionModal()"><span class="ux-qa-ico">⚖️</span><span>Log Decision</span></button>
                    </div>
                </div>
                <div class="card" style="padding:14px;">
                    <div class="card-header" style="margin-bottom:8px;">
                        <span class="card-title">🔎 Find What You Need</span>
                        <span class="muted" style="font-size:0.75rem;">"I want to…"</span>
                    </div>
                    <input type="text" class="form-input" id="findWhatYouNeedFilter" placeholder="Search… e.g. \"PMP\""
                        oninput="filterFindWhatYouNeed(this.value)" aria-label="Filter directory"
                        style="margin-bottom:10px;">
                    <div class="ux-dir" style="display:grid;grid-template-columns:1fr 1fr;gap:0 16px;">
                        <div class="ux-dir-row" onclick="go('review')"><span class="ux-dir-q">plan my week</span><span class="ux-dir-path">Review → Weekly Review</span></div>
                        <div class="ux-dir-row" onclick="go('pmptools')"><span class="ux-dir-q">study PMP</span><span class="ux-dir-path">Study → PMP Practice</span></div>
                        <div class="ux-dir-row" onclick="go('tracker')"><span class="ux-dir-q">log study/work hours</span><span class="ux-dir-path">Plan → Time Log</span></div>
                        <div class="ux-dir-row" onclick="go('protocol')"><span class="ux-dir-q">run my morning/evening routine</span><span class="ux-dir-path">Today → Morning / Evening</span></div>
                        <div class="ux-dir-row" onclick="go('operator')"><span class="ux-dir-q">build my daily plan</span><span class="ux-dir-path">Today → Command Center</span></div>
                        <div class="ux-dir-row" onclick="go('flashcards')"><span class="ux-dir-q">review flashcards</span><span class="ux-dir-path">Study → Flashcards</span></div>
                        <div class="ux-dir-row" onclick="go('doctrine')"><span class="ux-dir-q">train from my books</span><span class="ux-dir-path">Knowledge → Doctrine Library</span></div>
                        <div class="ux-dir-row" onclick="go('journal')"><span class="ux-dir-q">write a reflection</span><span class="ux-dir-path">Journal</span></div>
                        <div class="ux-dir-row" onclick="go('decisions')"><span class="ux-dir-q">record a decision</span><span class="ux-dir-path">Strategy → Decision Journal</span></div>
                        <div class="ux-dir-row" onclick="go('horizon')"><span class="ux-dir-q">work on my 90-day plan</span><span class="ux-dir-path">Strategy → 90-Day Plan</span></div>
                        <div class="ux-dir-row" onclick="go('health')"><span class="ux-dir-q">check system health</span><span class="ux-dir-path">System → System Health</span></div>
                        <div class="ux-dir-row" onclick="go('settings')"><span class="ux-dir-q">back up my data</span><span class="ux-dir-path">System → Settings</span></div>
                    </div>
                </div>
            </div>

            <!-- V18.5: LEARNING PROGRESS -->
            </div></details><details class="dash-group"><summary><span class="dash-group-title">Learning progress</span><span class="dash-group-sub">Paths, retention, balance, momentum</span></summary><div class="dash-group-body">
            <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:14px;margin-bottom:16px;">
                <div class="card" style="padding:14px;">
                    <div class="card-header" style="margin-bottom:10px;">
                        <span class="card-title">📖 Continue Learning</span>
                        <span class="btn btn-sm btn-secondary" onclick="go('learn')">Learning Paths →</span>
                    </div>
                    <div id="dashLearn"></div>
                </div>
                <div class="card" style="padding:14px;">
                    <div class="card-header" style="margin-bottom:10px;">
                        <span class="card-title">🧠 Learning</span>
                        <span class="btn btn-sm btn-secondary" onclick="go('doctrine')">Doctrine →</span>
                    </div>
                    <div id="learningIntegrityCard"></div>
                    <button class="btn btn-sm btn-secondary" onclick="go('flashcards')" style="width:100%;margin-top:10px;">
                        Review <span id="dashSRSDue">0</span> SRS Cards
                    </button>
                </div>
                <div class="card" style="padding:14px;">
                    <div class="card-header" style="margin-bottom:10px;">
                        <span class="card-title">📊 Study Balance</span>
                        <span class="btn btn-sm btn-secondary" onclick="go('tracker')">Time Log →</span>
                    </div>
                    <div id="domainBalanceCard"></div>
                    <div id="studyLoadCard" style="margin-top:10px;"></div>
                </div>
            </div>
            <div class="card" id="momentumTrendCard" style="padding:14px;margin-bottom:16px;">
                <div class="card-header" style="margin-bottom:10px;">
                    <span class="card-title">📈 Skill Momentum (30d)</span>
                    <span class="btn btn-sm btn-secondary" onclick="go('operator')">Command Center →</span>
                </div>
                <canvas id="dashMomentumChart" style="width:100%;height:120px;"></canvas>
            </div>

            <!-- V18.5: PLANS & TASKS -->
            </div></details><details class="dash-group"><summary><span class="dash-group-title">Plans &amp; tasks</span><span class="dash-group-sub">Goals, tasks, calendar, strategic pulse</span></summary><div class="dash-group-body">
            <!-- Strategic Readiness Index (rendered by strategic.js) -->
            <div id="dashStrategic"></div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:16px;">
                <div class="card" style="padding:14px;">
                    <div class="card-header" style="margin-bottom:10px;">
                        <span class="card-title">🎯 Goals</span>
                        <span class="btn btn-sm btn-secondary" onclick="go('goals')">Open →</span>
                    </div>
                    <div id="dashGoalsPreview"></div>
                </div>
                <div class="card" style="padding:14px;">
                    <div class="card-header" style="margin-bottom:10px;">
                        <span class="card-title">✅ Tasks</span>
                        <span class="btn btn-sm btn-secondary" onclick="go('tasks')">Open →</span>
                    </div>
                    <div id="v7TasksPreview"></div>
                </div>
                <div class="card" style="padding:14px;">
                    <div class="card-header" style="margin-bottom:10px;">
                        <span class="card-title">📅 Calendar</span>
                        <span class="btn btn-sm btn-secondary" onclick="go('calendar')">Open →</span>
                    </div>
                    <div id="dashCalendarPreview"></div>
                </div>
                <div class="card" style="padding:14px;">
                    <div class="card-header" style="margin-bottom:10px;">
                        <span class="card-title">🎯 90-Day Plan</span>
                        <span class="btn btn-sm btn-secondary" onclick="go('horizon')">Open →</span>
                    </div>
                    <div id="strategicPulseCard"></div>
                </div>
            </div>

            <!-- V18.5: PERSONAL OPERATING SYSTEM -->
            </div></details><details class="dash-group"><summary><span class="dash-group-title">Operating system</span><span class="dash-group-sub">Time, risk, discipline, journal, wisdom</span></summary><div class="dash-group-body">
            <!-- SNAPSHOT STRIP: planned time / task risk / streak / 7-day sparklines -->
            <div class="summary-strip" style="margin-bottom:16px;">
                <div class="summary-card"><div class="summary-kicker">Planned</div><div class="summary-value" id="v7Time">—</div><div class="summary-hint" id="v7TimeMeta"></div></div>
                <div class="summary-card"><div class="summary-kicker">Task Risk</div><div class="summary-value" id="v7Risk">—</div><div class="summary-hint" id="v7RiskMeta"></div></div>
                <div class="summary-card"><div class="summary-kicker">Streak</div><div class="summary-value" id="v7Momentum">—</div><div class="summary-hint" id="v7MomentumMeta"></div></div>
                <div class="summary-card"><div class="summary-kicker">Discipline 7d</div><div class="sparkline" id="disciplineSparkline"></div></div>
                <div class="summary-card"><div class="summary-kicker">Hours 7d</div><div class="sparkline" id="hoursSparkline"></div></div>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:14px;margin-bottom:16px;">
                <div class="card" style="padding:14px;">
                    <div class="card-header" style="margin-bottom:10px;">
                        <span class="card-title">📝 Quick Journal</span>
                        <span class="btn btn-sm btn-secondary" onclick="go('journal')">Full →</span>
                    </div>
                    <textarea id="dashJournalQuick" class="form-textarea" placeholder="Capture a thought..." rows="3" style="margin-bottom:8px;" aria-label="Quick journal"></textarea>
                    <button class="btn btn-sm btn-primary" onclick="dashSaveQuickJournal()" style="width:100%;">Save</button>
                </div>
                <div class="card" style="padding:14px;">
                    <div class="card-header" style="margin-bottom:10px;">
                        <span class="card-title">🧭 Wisdom</span>
                        <span class="btn btn-sm btn-secondary" onclick="nextWisdom()">Next →</span>
                    </div>
                    <div id="dashWisdom"></div>
                </div>
                <div class="card" id="dailyQuoteCard" style="padding:14px;">
                    <div class="card-header" style="margin-bottom:10px;">
                        <span class="card-title">💬 Daily Quote</span>
                    </div>
                    <div id="dailyQuoteText" style="font-style:italic;line-height:1.5;"></div>
                    <div id="dailyQuoteAuthor" class="muted" style="margin-top:8px;font-size:0.85rem;"></div>
                </div>
            </div>

            <!-- V18.5: SYSTEM HEALTH -->
            </div></details><details class="dash-group"><summary><span class="dash-group-title">System health</span><span class="dash-group-sub">Storage, engines, diagnostics</span></summary><div class="dash-group-body">
            <div class="card" style="padding:14px;">
                <div class="card-header" style="margin-bottom:10px;">
                    <span class="card-title">⚙️ System Status</span>
                    <span class="btn btn-sm btn-secondary" onclick="go('diagnostics')">Diagnostics →</span>
                </div>
                <div class="ux-qa-row" style="display:grid;grid-template-columns:1fr 1fr;gap:14px;">
                    <div id="systemStatusCard"></div>
                    <div id="operatorScoreCard"></div>
                </div>
            </div>
        </div>
    </div></details>`;
