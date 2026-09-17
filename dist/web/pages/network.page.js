window.STUDYOS_PAGES = window.STUDYOS_PAGES || {};

window.STUDYOS_PAGES.network = String.raw`
<div class="page" id="network">
<div class="page-header">
                <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;">
                    <div>
                        <h2>
                            <span>🤝</span> Network
                        </h2>
                        <p>70-80% of jobs come from connections</p>
                    </div>
                    <button class="btn btn-primary" data-action="openContactModal" style="display:flex;align-items:center;gap:8px;">
                        <span>➕</span> Add Contact
                    </button>
                </div>
            </div>
            
            <!-- Network Stats -->
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:12px;margin-bottom:20px;">
                <div class="card" style="text-align:center;padding:16px;">
                    <div style="font-size:2rem;font-weight:700;color:var(--accent);" id="contactsTotal">0</div>
                    <div style="font-size:0.75rem;color:var(--text-muted);text-transform:uppercase;">Contacts</div>
                </div>
                <div class="card" style="text-align:center;padding:16px;background:linear-gradient(135deg, var(--bg-secondary), rgba(239,68,68,0.1));border-color:var(--danger);">
                    <div style="font-size:2rem;font-weight:700;color:var(--danger);" id="contactsFollowup">0</div>
                    <div style="font-size:0.75rem;color:var(--text-muted);text-transform:uppercase;">Need Follow-up</div>
                </div>
                <div class="card" style="text-align:center;padding:16px;">
                    <div style="font-size:2rem;font-weight:700;color:var(--success);" id="contactsRecent">0</div>
                    <div style="font-size:0.75rem;color:var(--text-muted);text-transform:uppercase;">Active (30d)</div>
                </div>
            </div>
            
            <!-- Filters -->
            <div class="card" style="padding:12px;margin-bottom:16px;">
                <div class="filter-bar" id="contactFilters" style="padding:0;margin:0;"></div>
            </div>
            
            <!-- Follow-up Reminders -->
            <div class="card" style="margin-bottom:16px;display:none;" id="followupSection">
                <div style="font-size:0.75rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:12px;">⚠️ Needs Follow-up</div>
                <div id="followupList"></div>
            </div>
            
            <!-- Contact List -->
            <div class="card">
                <div style="margin-bottom:12px;">
                    <input type="text" class="form-input" id="contactSearch" aria-label="Search contacts" placeholder="🔍 Search contacts..." oninput="filterContacts()">
                </div>
                <div id="contactsList"></div>
            </div>
        </div>
    `;
