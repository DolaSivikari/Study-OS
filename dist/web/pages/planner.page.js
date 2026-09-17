window.STUDYOS_PAGES = window.STUDYOS_PAGES || {};

window.STUDYOS_PAGES.planner = String.raw`
<div class="page" id="planner">
            <div class="page-header">
                <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;">
                    <div>
                        <h2>📋 Plan</h2>
                        <p style="color:var(--text-muted);">Manage goals, tasks, calendar blocks, and study/work time logs here.</p>
                    </div>
                    <button class="btn btn-primary" onclick="openTaskModal()">➕ Add Task</button>
                </div>
            </div>
        <div class="filter-bar" id="plannerTabs">
            <button class="filter-btn active" onclick="goTab('planner','goals')">🎯 Goals</button>
            <button class="filter-btn" onclick="goTab('planner','tasks')">✅ Tasks</button>
            <button class="filter-btn" onclick="goTab('planner','calendar')">📅 Calendar</button>
            <button class="filter-btn" onclick="goTab('planner','tracker')">⏱️ Time Log</button>
        </div>
        <div class="tab-panel" id="tab-goals">
<div class="page-header">
                <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;">
                    <div>
                        <h2>
                            <span>🎯</span> Goals
                        </h2>
                        <p>Track your ambitions</p>
                    </div>
                    <button class="btn btn-primary" onclick="openGoalModal()" style="display:flex;align-items:center;gap:8px;">
                        <span>➕</span> New Goal
                    </button>
                </div>
            </div>
            
            <!-- Goal Stats -->
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:12px;margin-bottom:20px;" id="goalStats"></div>
            
            <!-- Filters -->
            <div class="card" style="padding:12px;margin-bottom:16px;">
                <div class="filter-bar" id="goalFilters" style="margin:0;"></div>
            </div>
            
            <!-- Goals Grid -->
            <div id="goalsContainer"></div>
        </div>
        <div class="tab-panel" id="tab-tasks" style="display:none;">
<div class="page-header">
                <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;">
                    <div>
                        <h2>
                            <span>✅</span> Tasks
                        </h2>
                        <p>Plan work with optional start times, estimates, and conflict-aware warnings.</p>
                    </div>
                    <button class="btn btn-primary" onclick="openTaskModal()" style="display:flex;align-items:center;gap:8px;">
                        <span>➕</span> Add Task
                    </button>
                </div>
            </div>

            <div id="taskConflictSummary" aria-live="polite"></div>
            
            <!-- Task Stats -->
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(100px,1fr));gap:12px;margin-bottom:20px;">
                <div class="card" style="text-align:center;padding:14px;">
                    <div style="font-size:1.6rem;font-weight:700;color:var(--accent);" id="tasksDueToday">0</div>
                    <div style="font-size:0.7rem;color:var(--text-muted);text-transform:uppercase;">Due Today</div>
                </div>
                <div class="card" style="text-align:center;padding:14px;">
                    <div style="font-size:1.6rem;font-weight:700;color:var(--danger);" id="tasksOverdue">0</div>
                    <div style="font-size:0.7rem;color:var(--text-muted);text-transform:uppercase;">Overdue</div>
                </div>
                <div class="card" style="text-align:center;padding:14px;">
                    <div style="font-size:1.6rem;font-weight:700;color:var(--success);" id="tasksCompleted">0</div>
                    <div style="font-size:0.7rem;color:var(--text-muted);text-transform:uppercase;">Done</div>
                </div>
                <div class="card" style="text-align:center;padding:14px;">
                    <div style="font-size:1.6rem;font-weight:700;color:var(--purple);" id="tasksTotal">0</div>
                    <div style="font-size:0.7rem;color:var(--text-muted);text-transform:uppercase;">Total</div>
                </div>
            </div>
            
            <!-- Quick Add -->
            <div class="card" style="padding:12px;margin-bottom:16px;">
                <div style="display:flex;gap:10px;">
                    <input type="text" class="form-input" id="quickTaskInput" placeholder="Quick add task... (Enter to save)" style="flex:1;" onkeydown="if(event.key==='Enter')quickAddTask()">
                    <button class="btn btn-primary" onclick="quickAddTask()">Add</button>
                </div>
            </div>
            
            <!-- Filters & Tasks -->
            <div class="card" style="padding:0;overflow:hidden;">
                <div class="filter-bar" id="taskFilters" style="padding:12px 16px;background:var(--bg-tertiary);margin:0;"></div>
                <div id="tasksContainer" style="padding:0;"></div>
            </div>
        </div>
        <div class="tab-panel" id="tab-calendar" style="display:none;">
<div class="page-header">
                <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;">
                    <div>
                        <h2>
                            <span>📅</span> Calendar
                        </h2>
                        <p>Recurring blocks, task deadlines, habit timing, and shared schedule intelligence.</p>
                    </div>
                    <button class="btn btn-primary" onclick="openEventModal()" style="display:flex;align-items:center;gap:8px;">
                        <span>➕</span> Add Block
                    </button>
                </div>
            </div>
            
            <!-- Calendar Navigation -->
            <div class="card" style="padding:16px;margin-bottom:20px;">
                <div style="display:flex;justify-content:space-between;align-items:center;">
                    <button class="btn btn-secondary" onclick="changeMonth(-1)" style="padding:8px 16px;">← Prev</button>
                    <div style="text-align:center;">
                        <div style="font-size:1.3rem;font-weight:700;" id="calendarMonthYear">February 2026</div>
                        <button class="btn btn-secondary btn-sm" onclick="goToToday()" style="margin-top:6px;font-size:0.75rem;">Today</button>
                    </div>
                    <button class="btn btn-secondary" onclick="changeMonth(1)" style="padding:8px 16px;">Next →</button>
                </div>
            </div>
            
            <!-- Mini Stats -->
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:12px;margin-bottom:20px;">
                <div class="card" style="text-align:center;padding:14px;">
                    <div style="font-size:1.4rem;font-weight:700;color:var(--accent);" id="calEventsThisMonth">0</div>
                    <div style="font-size:0.7rem;color:var(--text-muted);text-transform:uppercase;">This Month</div>
                </div>
                <div class="card" style="text-align:center;padding:14px;">
                    <div style="font-size:1.4rem;font-weight:700;color:var(--purple);" id="calEventsThisWeek">0</div>
                    <div style="font-size:0.7rem;color:var(--text-muted);text-transform:uppercase;">This Week</div>
                </div>
                <div class="card" style="text-align:center;padding:14px;">
                    <div style="font-size:1.4rem;font-weight:700;color:var(--success);" id="calEventsToday">0</div>
                    <div style="font-size:0.7rem;color:var(--text-muted);text-transform:uppercase;">Today</div>
                </div>
            </div>
            
            <div class="board">
                <div>
                    <!-- Calendar Grid -->
                    <div class="card" style="padding:12px;overflow-x:auto;">
                        <div id="calendarGrid"></div>
                    </div>

                    <!-- Upcoming Events -->
                    <div class="card" style="margin-top:16px;">
                        <div style="font-size:0.75rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:12px;">📋 Upcoming Blocks</div>
                        <div id="upcomingEvents"></div>
                    </div>
                </div>

                <div class="rail">
                    <div class="card" id="calConflictPanel" style="padding:14px;"></div>
                    <div class="next-move" id="calNextMovePanel"></div>
                    <div class="card" id="calDayPanel" style="padding:14px;"></div>
                </div>
            </div>
        </div>
        <div class="tab-panel" id="tab-tracker" style="display:none;">
<div class="page-header">
                <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;">
                    <div>
                        <h2>
                            <span>⏱️</span> Time Log
                        </h2>
                        <p>Log study and work hours — this feeds all learning metrics</p>
                    </div>
                    <button class="btn btn-primary" onclick="openTimeModal()" style="display:flex;align-items:center;gap:8px;">
                        <span>⏰</span> Log Time
                    </button>
                </div>
            </div>
            
            <!-- Time Stats -->
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:12px;margin-bottom:20px;">
                <div class="card" style="text-align:center;padding:18px;background:linear-gradient(135deg, var(--bg-secondary), rgba(249,115,22,0.1));border-color:var(--accent);">
                    <div style="font-size:2.2rem;font-weight:700;color:var(--accent);font-family:var(--font-mono);" id="timeToday">0h</div>
                    <div style="font-size:0.75rem;color:var(--text-muted);text-transform:uppercase;">Today</div>
                </div>
                <div class="card" style="text-align:center;padding:18px;">
                    <div style="font-size:2.2rem;font-weight:700;color:var(--success);font-family:var(--font-mono);" id="timeWeek">0h</div>
                    <div style="font-size:0.75rem;color:var(--text-muted);text-transform:uppercase;">This Week</div>
                </div>
                <div class="card" style="text-align:center;padding:18px;">
                    <div style="font-size:2.2rem;font-weight:700;color:var(--purple);font-family:var(--font-mono);" id="timeMonth">0h</div>
                    <div style="font-size:0.75rem;color:var(--text-muted);text-transform:uppercase;">This Month</div>
                </div>
                <div class="card" style="text-align:center;padding:18px;">
                    <div style="font-size:2.2rem;font-weight:700;color:#58a6ff;font-family:var(--font-mono);" id="timeTotal">0h</div>
                    <div style="font-size:0.75rem;color:var(--text-muted);text-transform:uppercase;">All Time</div>
                </div>
            </div>
            
            <!-- Activity Heatmap -->
            <div class="card" style="margin-bottom:16px;">
                <div style="font-size:0.75rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:12px;">📅 Last 28 Days</div>
                <div id="timeHeatmap" style="display:flex;gap:4px;flex-wrap:wrap;"></div>
            </div>
            
            <!-- Category Breakdown -->
            <div class="card" style="margin-bottom:16px;">
                <div style="font-size:0.75rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:12px;">📊 By Category</div>
                <div id="timeCategoryBreakdown"></div>
            </div>
            
            <!-- Recent Sessions -->
            <div class="card">
                <div style="font-size:0.75rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:12px;">🕐 Recent Sessions</div>
                <div id="recentSessions"></div>
            </div>
        </div>
        </div>
    `;
