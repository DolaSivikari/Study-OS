window.STUDYOS_PAGES = window.STUDYOS_PAGES || {};

window.STUDYOS_PAGES.knowledge = String.raw`
<div class="page" id="knowledge">
            <div class="page-header">
                <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;">
                    <div>
                        <h2>📚 Knowledge</h2>
                        <p style="color:var(--text-muted);">Capture quickly, connect ideas, cite evidence, and train doctrine modules built from your books.</p>
                    </div>
                    <div style="display:flex;gap:8px;flex-wrap:wrap;">
                        <button class="btn btn-secondary" onclick="openQuickCapture()">＋ Quick capture</button>
                        <button class="btn btn-primary" onclick="go('doctrine')">🧠 Open Doctrine Library</button>
                    </div>
                </div>
            </div>
        <div class="filter-bar" id="knowledgeTabs">
            <button class="filter-btn active" onclick="goTab('knowledge','knowledgevault')">📚 Knowledge Vault</button>
            <button class="filter-btn" onclick="goTab('knowledge','capture')">✦ Capture Inbox</button>
            <button class="filter-btn" onclick="goTab('knowledge','doctrine')">🧠 Doctrine Library</button>
        </div>
        <div class="tab-panel" id="tab-knowledgevault">
<div class="page-header">
                <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;">
                    <div>
                        <h2>
                            <span>📚</span> Knowledge Vault
                        </h2>
                        <p>Your second brain</p>
                    </div>
                    <div class="page-actions" style="display:flex;gap:8px;flex-wrap:wrap;">
                        <button class="btn btn-primary" onclick="openKnowledgeModal('note')" style="display:flex;align-items:center;gap:8px;">
                            <span>📝</span> New Note
                        </button>
                        <button class="btn" onclick="openKnowledgeModal('critical')" style="display:flex;align-items:center;gap:8px;background:var(--purple);border-color:var(--purple);color:white;">
                            <span>🔍</span> Critical Analysis
                        </button>
                        <button class="btn" onclick="openKnowledgeModal('model')" style="display:flex;align-items:center;gap:8px;background:var(--success);border-color:var(--success);color:white;">
                            <span>🧠</span> Mental Model
                        </button>
                        <button class="btn" onclick="openKnowledgeModal('book')" style="display:flex;align-items:center;gap:8px;background:#f97316;border-color:#f97316;color:white;">
                            <span>📚</span> Book
                        </button>
                        <button class="btn btn-secondary" onclick="openKnowledgeGraph()" style="display:flex;align-items:center;gap:8px;">
                            <span>🕸️</span> Graph View
                        </button>
                    </div>
                </div>
            </div>
            
            <!-- Vault Stats -->
            <div id="knowledgeStats"></div>
            
            <!-- Knowledge Search & Filters -->
            <div class="card" style="padding:14px;margin-bottom:20px;">
                <div style="display:flex;gap:12px;flex-wrap:wrap;align-items:center;">
                    <div style="flex:1;min-width:200px;position:relative;">
                        <input type="text" class="form-input" id="knowledgeSearch" aria-label="Search knowledge" placeholder="Search notes..." 
                               style="padding-left:36px;background:var(--bg-primary);" oninput="renderKnowledge()">
                        <span style="position:absolute;left:12px;top:50%;transform:translateY(-50%);color:var(--text-muted);">🔍</span>
                    </div>
                    <div class="filter-bar" id="knowledgeFilters" style="margin:0;"></div>
                </div>
                <div id="knowledgeTypeFilter" style="display:flex;gap:4px;flex-wrap:wrap;margin-top:10px;"></div>
            </div>
            
            <!-- Knowledge Grid -->
            <div id="knowledgeContainer" style="display:block;"></div>
        </div>
        <div class="tab-panel" id="tab-capture" style="display:none;">
            <div id="captureInboxRoot"></div>
        </div>
        <div class="tab-panel" id="tab-doctrine" style="display:none;">
<div id="doctrineRoot"></div>
        </div>
        </div>
    `;
