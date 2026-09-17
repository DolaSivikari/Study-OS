window.STUDYOS_PAGES = window.STUDYOS_PAGES || {};

window.STUDYOS_PAGES.strategy = String.raw`
<div class="page" id="strategy">
            <div class="page-header">
                <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;">
                    <div>
                        <h2>🏔️ Career Strategy</h2>
                        <p style="color:var(--text-muted);">Long-term direction: 5-year → 90-day plans, decision journal, and systems thinking.</p>
                    </div>
                    <button class="btn btn-primary" onclick="openDecisionModal()">⚖️ Log Decision</button>
                </div>
            </div>
        <div class="filter-bar" id="strategyTabs">
            <button class="filter-btn active" onclick="goTab('strategy','horizon')">🏔️ 5yr / 90-Day Plan</button>
            <button class="filter-btn" onclick="goTab('strategy','decisions')">⚖️ Decision Journal</button>
            <button class="filter-btn" onclick="goTab('strategy','frameworklab')">🧩 Systems Lab</button>
        </div>
        <div class="tab-panel" id="tab-horizon">
<div class="page-header">
                <div>
                    <h2 style="font-size:1.6rem;font-weight:700;margin-bottom:4px;display:flex;align-items:center;gap:10px;">
                        <span>🏔️</span> Strategic Horizon
                    </h2>
                    <p style="color:var(--text-muted);font-size:0.85rem;">5-Year Identity → 12-Month Targets → 90-Day War Plan</p>
                </div>
            </div>
            <div id="strategicHorizonContainer"></div>
        </div>
        <div class="tab-panel" id="tab-decisions" style="display:none;">
<div class="page-header">
                <div>
                    <h2 style="font-size:1.6rem;font-weight:700;margin-bottom:4px;display:flex;align-items:center;gap:10px;">
                        <span>⚖️</span> Decision Journal
                    </h2>
                    <p style="color:var(--text-muted);font-size:0.85rem;">Log decisions now, review outcomes in 30-90 days. Calibrate your judgment.</p>
                </div>
                <button class="btn btn-primary" onclick="openDecisionModal()">+ New Decision</button>
            </div>
            <div id="decisionFilterTabs" style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:16px;"></div>
            <div id="decisionsContainer"></div>
        </div>
        <div class="tab-panel" id="tab-frameworklab" style="display:none;">
<div id="frameworkLabRoot"></div>
        </div>
        </div>
    `;
