window.STUDYOS_PAGES = window.STUDYOS_PAGES || {};

window.STUDYOS_PAGES.dailyops = String.raw`
<div class="page" id="dailyops">
            <div class="page-header">
                <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;">
                    <div>
                        <h2>🌅 Today</h2>
                        <p style="color:var(--text-muted);">Run your daily operating system here: morning/evening protocol, daily plan, scorecard, and habits.</p>
                    </div>
                    <button class="btn btn-primary" onclick="startFocusMode()">🎯 Start Focus</button>
                </div>
            </div>
        <div class="filter-bar" id="dailyopsTabs">
            <button class="filter-btn" onclick="goTab('dailyops','operator')">🧭 Command Center</button>
            <button class="filter-btn active" onclick="goTab('dailyops','protocol')">🌅 Morning / Evening</button>
            <button class="filter-btn" onclick="goTab('dailyops','discipline')">📊 Scorecard</button>
            <button class="filter-btn" onclick="goTab('dailyops','habits')">🔄 Habits</button>
        </div>
        <div class="tab-panel" id="tab-operator" style="display:none;">
            <div id="operatorRoot"></div>
            
            <canvas id="momentumChart" width="600" height="200" style="width:100%;max-height:200px;margin-top:16px;"></canvas>
        </div>
        <div class="tab-panel" id="tab-protocol">
<div class="page-header">
                <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;">
                    <div>
                        <h2 id="protocolTitle">
                            <span>🌅</span> Morning Protocol
                        </h2>
                        <p>Start your day with intention</p>
                    </div>
                    <div id="protocolTime" style="font-size:2rem;font-weight:700;color:var(--accent);font-family:var(--font-mono);"></div>
                </div>
            </div>
            
            <!-- Protocol Progress -->
            <div class="card" style="padding:16px;margin-bottom:20px;background:linear-gradient(135deg, var(--bg-secondary), rgba(168,85,247,0.1));border-color:var(--purple);">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
                    <span style="color:var(--purple);font-weight:600;">Protocol Progress</span>
                    <span id="protocolProgress" style="color:var(--purple);font-weight:700;">0/5</span>
                </div>
                <div class="progress" style="height:8px;background:rgba(168,85,247,0.2);">
                    <div class="progress-fill" id="protocolProgressBar" style="width:0%;background:var(--purple);"></div>
                </div>
            </div>
            
            <!-- Protocol Steps -->
            <div id="protocolSteps" style="margin-bottom:20px;"></div>
            
            <!-- Intention & Energy -->
            <div class="card">
                <div style="margin-bottom:20px;">
                    <label for="protocolIntention" style="font-size:0.75rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;display:block;margin-bottom:8px;">🎯 Today's Intention</label>
                    <textarea class="form-textarea" id="protocolIntention" name="protocolIntention" placeholder="At [time], in [place], I will [specific action]…" style="min-height:80px;font-size:1rem;"></textarea>
                </div>
                <div style="margin-bottom:20px;">
                    <!-- Not a <label> on purpose: this heads a button group (#energySelector),
                         not a single focusable field. The real value lives in the hidden
                         protocolEnergy input, which a visible label shouldn't point to. -->
                    <div style="font-size:0.75rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;display:block;margin-bottom:12px;">⚡ Energy Level</div>
                    <div style="display:flex;gap:8px;flex-wrap:wrap;" id="energySelector" role="group" aria-label="Energy level"></div>
                    <input type="hidden" id="protocolEnergy" name="protocolEnergy" value="7">
                </div>
                <button class="btn btn-primary" onclick="completeProtocol()" style="width:100%;padding:14px;font-size:1rem;display:flex;align-items:center;justify-content:center;gap:8px;">
                    <span>✅</span> Complete Protocol
                </button>
            </div>
        </div>
        <div class="tab-panel" id="tab-discipline" style="display:none;">
<div class="page-header">
                <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;">
                    <div>
                        <h2>
                            <span>🏆</span> Discipline Scorecard
                        </h2>
                        <p id="disciplineDate">Track your daily excellence</p>
                    </div>
                </div>
            </div>
            
            <!-- Streak & Stats -->
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:12px;margin-bottom:20px;">
                <div class="card" style="text-align:center;padding:20px;background:linear-gradient(135deg, var(--bg-secondary), rgba(249,115,22,0.1));border-color:var(--accent);">
                    <div style="font-size:2.5rem;margin-bottom:4px;">🔥</div>
                    <div style="font-size:2rem;font-weight:700;color:var(--accent);" id="disciplineStreak">0</div>
                    <div style="font-size:0.75rem;color:var(--text-muted);text-transform:uppercase;">Day Streak</div>
                </div>
                <div class="card" style="text-align:center;padding:20px;">
                    <div style="font-size:2.5rem;margin-bottom:4px;">📊</div>
                    <div style="font-size:2rem;font-weight:700;color:var(--success);" id="disciplineAvg">0%</div>
                    <div style="font-size:0.75rem;color:var(--text-muted);text-transform:uppercase;">7-Day Avg</div>
                </div>
                <div class="card" style="text-align:center;padding:20px;">
                    <div style="font-size:2.5rem;margin-bottom:4px;">🎯</div>
                    <div style="font-size:2rem;font-weight:700;color:var(--purple);" id="disciplineTodayScore">0/50</div>
                    <div style="font-size:0.75rem;color:var(--text-muted);text-transform:uppercase;">Today</div>
                </div>
            </div>
            
            <!-- Daily Score Items -->
            <div class="card">
                <div style="font-size:0.75rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:16px;">Rate Your Day</div>
                <div id="disciplineItems"></div>
                <div style="margin-top:20px;padding-top:16px;border-top:1px solid var(--border);">
                    <div class="progress" style="height:12px;border-radius:6px;"><div class="progress-fill" id="disciplineProgress" style="width:0%;transition:width 0.3s;"></div></div>
                </div>
            </div>
            
            <!-- Weekly Heatmap -->
            <div class="card" style="margin-top:16px;">
                <div style="font-size:0.75rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:12px;">Last 7 Days</div>
                <div id="disciplineHeatmap" style="display:flex;gap:8px;justify-content:space-between;"></div>
            </div>

            <!-- Communication Practice -->
            <div class="card" style="margin-top:20px;">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;">
                    <div>
                        <div style="font-weight:700;">💬 Communication Practice</div>
                        <div style="font-size:0.8rem;color:var(--text-muted);">Practice the message and the receiver-side loop</div>
                    </div>
                    <div style="font-size:0.8rem;color:var(--text-muted);" id="commStreak">0 day streak</div>
                </div>
                <div id="commActivities"></div>
                <div style="font-size:0.75rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;margin:14px 0 8px;">How you closed the loop</div>
                <div id="commQualityBehaviors"></div>
                <div style="font-size:0.75rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;margin:14px 0 8px;">Receiver outcome</div>
                <div id="commOutcome" class="communication-outcome-scale"></div>
                <div style="margin-top:10px;">
                    <input type="text" class="form-input" id="commNote" placeholder="What did the receiver understand, question, or commit to?" style="font-size:0.85rem;">
                </div>
            </div>

            <!-- Energy Tracker -->
            <div class="card" style="margin-top:20px;">
                <div style="font-weight:700;margin-bottom:14px;">⚡ Energy Level</div>
                <div style="display:flex;gap:8px;margin-bottom:14px;" id="energyRating"></div>
                <div style="font-size:0.8rem;color:var(--text-muted);margin-bottom:8px;">What did you do today?</div>
                <div id="energyActivities" style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:10px;"></div>
                <div id="energyInsight" style="margin-top:12px;"></div>
            </div>
        </div>
        <div class="tab-panel" id="tab-habits" style="display:none;">
<div class="page-header">
                <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;">
                    <div>
                        <h2>
                            <span>✨</span> Habits
                        </h2>
                        <p>Anchor tiny behaviors; add a preferred time only when the habit needs protection.</p>
                    </div>
                    <button class="btn btn-primary" onclick="openHabitModal()" style="display:flex;align-items:center;gap:8px;">
                        <span>➕</span> New Habit
                    </button>
                </div>
            </div>
            <div id="habitConflictSummary" aria-live="polite"></div>
            <div class="card" style="padding:14px;margin-bottom:16px;">
                <div class="card-header" style="margin-bottom:10px;">
                    <span class="card-title">📈 Behavior Momentum (30d)</span>
                </div>
                <canvas id="habitsMomentumChart" style="width:100%;height:120px;"></canvas>
            </div>
            
            <!-- Habit Stats -->
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:12px;margin-bottom:20px;">
                <div class="card" style="text-align:center;padding:16px;">
                    <div style="font-size:1.8rem;font-weight:700;color:var(--accent);" id="habitsActive">0</div>
                    <div style="font-size:0.75rem;color:var(--text-muted);text-transform:uppercase;">Active Habits</div>
                </div>
                <div class="card" style="text-align:center;padding:16px;">
                    <div style="font-size:1.8rem;font-weight:700;color:var(--success);" id="habitsTodayDone">0</div>
                    <div style="font-size:0.75rem;color:var(--text-muted);text-transform:uppercase;">Done Today</div>
                </div>
                <div class="card" style="text-align:center;padding:16px;">
                    <div style="font-size:1.8rem;font-weight:700;color:var(--purple);" id="habitsLongestStreak">0🔥</div>
                    <div style="font-size:0.75rem;color:var(--text-muted);text-transform:uppercase;">Best Streak</div>
                </div>
                <div class="card" style="text-align:center;padding:16px;">
                    <div style="font-size:1.8rem;font-weight:700;color:var(--accent);" id="habitsMomentum">0</div>
                    <div style="font-size:0.75rem;color:var(--text-muted);text-transform:uppercase;">Momentum (7d avg)</div>
                </div>
            </div>
            
            <!-- Habits Grid -->
            <div id="habitsContainer"></div>
        </div>
        </div>
    `;
