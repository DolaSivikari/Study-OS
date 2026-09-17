window.STUDYOS_PAGES = window.STUDYOS_PAGES || {};

window.STUDYOS_PAGES.quran = String.raw`
<div class="page studyos-page claude-design-page" id="quran" data-screen-label="Quran">
<div class="page-header page-header-primary"><div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;"><div><h2><span>🕌</span> Quran Tools</h2><p style="color:var(--text-muted);">Search verses, listen, study meanings, validate references, and manage your Quran learning tools. For distraction-free page reading, open the dedicated Mushaf Reader.</p></div><button class="btn btn-primary btn-sm" type="button" onclick="go('mushaf')">Open Mushaf Reader →</button></div></div>
<div class="filter-bar" id="quranTabs">
<button class="filter-btn active" data-tab="quranread" onclick="goTab('quran','quranread')">📖 Read & Search</button>
<button class="filter-btn" data-tab="quranlisten" onclick="goTab('quran','quranlisten')">🎧 Listen</button>
<button class="filter-btn" data-tab="quranunderstand" onclick="goTab('quran','quranunderstand')">🕌 Understand</button>
</div>
<div class="tab-panel" id="tab-quranread"><div id="quranReadRoot"></div></div>
<div class="tab-panel" id="tab-quranlisten" style="display:none;"><div id="quranListenRoot"></div></div>
<div class="tab-panel" id="tab-quranunderstand" style="display:none;"><div id="quranUnderstandRoot"></div></div>
</div>
`;
