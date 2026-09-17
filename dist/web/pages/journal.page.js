window.STUDYOS_PAGES = window.STUDYOS_PAGES || {};

window.STUDYOS_PAGES.journal = String.raw`
<div class="page" id="journal">
<!-- Modern Journal Header -->
            <div class="page-header">
                <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;">
                    <div>
                        <h2>
                            <span>📓</span> Journal
                        </h2>
                        <p>Capture thoughts, reflect, grow</p>
                    </div>
                    <div style="display:flex;gap:8px;flex-wrap:wrap;">
                        <button class="btn btn-secondary" onclick="openQualityReviewModal()">Fix → Learn → Prevent</button>
                        <button class="btn btn-primary" onclick="openJournalModal()" style="display:flex;align-items:center;gap:8px;padding:10px 20px;">
                            <span style="font-size:1.1rem;">✍️</span> New Entry
                        </button>
                    </div>
                </div>
            </div>

            <div id="qualityLoopRoot"></div>
            
            <!-- Search & Filters -->
            <div class="card" style="padding:14px;margin-bottom:20px;">
                <div style="display:flex;gap:12px;flex-wrap:wrap;align-items:center;">
                    <div style="flex:1;min-width:200px;position:relative;">
                        <input type="text" class="form-input" id="journalSearch" placeholder="Search entries..." 
                               style="padding-left:36px;background:var(--bg-primary);" oninput="renderJournalEntries()">
                        <span style="position:absolute;left:12px;top:50%;transform:translateY(-50%);color:var(--text-muted);">🔍</span>
                    </div>
                    <div class="filter-bar" id="journalFilters" style="margin:0;flex-wrap:wrap;"></div>
                </div>
            </div>
            
            <!-- Journal Stats -->
            <div id="journalStats" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:12px;margin-bottom:20px;"></div>
            <!-- V63: reflections you committed to, resurfaced on the same
                 expanding schedule the flashcard engine uses. -->
            <div id="journalRevisitQueue" hidden></div>
            
            <!-- Journal Entries -->
            <div id="journalContainer"></div>
        </div>
    `;
