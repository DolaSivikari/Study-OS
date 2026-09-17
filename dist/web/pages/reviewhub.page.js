window.STUDYOS_PAGES = window.STUDYOS_PAGES || {};

window.STUDYOS_PAGES.reviewhub = String.raw`
<div class="page" id="reviewhub">
            <div class="page-header">
                <div>
                    <h2>📈 Review & Insights</h2>
                    <p style="color:var(--text-muted);">Plan your week here — weekly reflection prompts plus insights across all your data.</p>
                </div>
            </div>
        <div class="filter-bar" id="reviewhubTabs">
            <button class="filter-btn active" onclick="goTab('reviewhub','review')">📋 Weekly Review</button>
            <button class="filter-btn" onclick="goTab('reviewhub','insights')">📈 Insights</button>
        </div>
        <div class="tab-panel" id="tab-review">
<div class="page-header">
                <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;">
                    <div>
                        <h2>
                            <span>📋</span> Weekly Review
                        </h2>
                        <p>Reflect, learn, and plan ahead</p>
                    </div>
                    <div id="reviewWeekLabel" style="font-size:0.9rem;color:var(--text-muted);"></div>
                </div>
            </div>
            
            <!-- Review Status -->
            <div class="card" style="padding:20px;margin-bottom:20px;background:linear-gradient(135deg, var(--bg-secondary), rgba(34,197,94,0.1));border-color:var(--success);" id="reviewStatusCard">
                <div style="display:flex;align-items:center;gap:16px;">
                    <div style="font-size:3rem;" id="reviewStatusIcon">📋</div>
                    <div style="flex:1;">
                        <div style="font-size:1.1rem;font-weight:600;" id="reviewStatusText">Weekly review not started</div>
                        <div style="font-size:0.85rem;color:var(--text-muted);" id="reviewStatusSub">Take 15 minutes to reflect on your week</div>
                    </div>
                    <button class="btn btn-primary" onclick="startWeeklyReview()" id="startReviewBtn">Start Review</button>
                </div>
            </div>
            
            <!-- Week Summary Stats -->
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:12px;margin-bottom:20px;">
                <div class="card" style="text-align:center;padding:14px;">
                    <div style="font-size:1.6rem;font-weight:700;color:var(--accent);" id="reviewHours">0h</div>
                    <div style="font-size:0.7rem;color:var(--text-muted);text-transform:uppercase;">Study Hours</div>
                </div>
                <div class="card" style="text-align:center;padding:14px;">
                    <div style="font-size:1.6rem;font-weight:700;color:var(--success);" id="reviewTasks">0</div>
                    <div style="font-size:0.7rem;color:var(--text-muted);text-transform:uppercase;">Tasks Done</div>
                </div>
                <div class="card" style="text-align:center;padding:14px;">
                    <div style="font-size:1.6rem;font-weight:700;color:var(--purple);" id="reviewDiscipline">0%</div>
                    <div style="font-size:0.7rem;color:var(--text-muted);text-transform:uppercase;">Avg Discipline</div>
                </div>
                <div class="card" style="text-align:center;padding:14px;">
                    <div style="font-size:1.6rem;font-weight:700;color:#58a6ff;" id="reviewJournals">0</div>
                    <div style="font-size:0.7rem;color:var(--text-muted);text-transform:uppercase;">Journal Entries</div>
                </div>
            </div>
            
            <!-- Review Sections -->
            <div id="reviewSections"></div>
            
            <!-- Past Reviews -->
            <div class="card" style="margin-top:20px;">
                <div style="font-size:0.75rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:12px;">📜 Past Reviews</div>
                <div id="pastReviews"></div>
            </div>
        </div>
        <div class="tab-panel" id="tab-insights" style="display:none;">
<div class="page-header">
                <div>
                    <h2>
                        <span>📊</span> Analytics & Insights
                    </h2>
                    <p>Understand your progress</p>
                </div>
            </div>
            
            <div class="card" style="padding:0;overflow:hidden;">
                <div class="filter-bar" id="insightTabs" style="padding:12px 16px;background:var(--bg-tertiary);margin:0;"></div>
                <div id="insightsContent" style="padding:16px;"></div>
            </div>
        </div>
        </div>
    `;
