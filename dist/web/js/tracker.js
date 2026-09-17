// ==================== TRACKER ====================
function refreshTracker() {
    const entries = arr(K.time);
    const td = today();
    const ws = new Date(); ws.setDate(ws.getDate() - ws.getDay());
    const ms = new Date(); ms.setDate(1);
    
    // Stats
    const todayHours = entries.filter(e => e.date === td).reduce((s, e) => s + (parseFloat(e.duration) || 0), 0);
    const weekHours = entries.filter(e => e.date >= fmtDate(ws)).reduce((s, e) => s + (parseFloat(e.duration) || 0), 0);
    const monthHours = entries.filter(e => e.date >= fmtDate(ms)).reduce((s, e) => s + (parseFloat(e.duration) || 0), 0);
    const totalHours = entries.reduce((s, e) => s + (parseFloat(e.duration) || 0), 0);
    
    document.getElementById('timeToday').textContent = todayHours.toFixed(1) + 'h';
    document.getElementById('timeWeek').textContent = weekHours.toFixed(1) + 'h';
    document.getElementById('timeMonth').textContent = monthHours.toFixed(1) + 'h';
    document.getElementById('timeTotal').textContent = totalHours.toFixed(1) + 'h';
    
    // 28-day heatmap
    const heatmapEl = document.getElementById('timeHeatmap');
    if (heatmapEl) {
        let heatmapHtml = '';
        for (let i = 27; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const ds = fmtDate(d);
            const dayHours = entries.filter(e => e.date === ds).reduce((s, e) => s + (parseFloat(e.duration) || 0), 0);
            const level = dayHours === 0 ? '' : dayHours < 1 ? 'l1' : dayHours < 2 ? 'l2' : dayHours < 3 ? 'l3' : dayHours < 4 ? 'l4' : 'l5';
            heatmapHtml += `<div class="time-cell ${level}" title="${ds}: ${dayHours.toFixed(1)}h"></div>`;
        }
        heatmapEl.innerHTML = heatmapHtml;
    }
    
    // Category breakdown
    const categories = {};
    entries.forEach(e => {
        const cat = e.category || 'other';
        categories[cat] = (categories[cat] || 0) + (parseFloat(e.duration) || 0);
    });
    
    const catColors = { study: 'var(--accent)', work: 'var(--purple)', project: 'var(--success)', reading: '#58a6ff', other: 'var(--text-muted)' };
    const catEl = document.getElementById('timeCategoryBreakdown');
    if (catEl) {
        const maxCat = Math.max(...Object.values(categories), 1);
        catEl.innerHTML = Object.entries(categories).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([cat, hours]) => `
            <div class="category-bar">
                <span class="category-label">${cat}</span>
                <div class="category-progress"><div class="category-fill" style="width:${(hours / maxCat) * 100}%;background:${catColors[cat] || 'var(--accent)'};"></div></div>
                <span class="category-value">${hours.toFixed(1)}h</span>
            </div>
        `).join('') || '<div class="empty">No data yet</div>';
    }
    
    // Recent sessions
    document.getElementById('recentSessions').innerHTML = entries.slice(-10).reverse().map(e => `
        <div class="session-item">
            <span class="session-icon">${e.category === 'study' ? '📚' : e.category === 'work' ? '💼' : e.category === 'project' ? '🔧' : '⏱️'}</span>
            <div class="session-info">
                <div class="session-title">${esc(e.title)}</div>
                <div class="session-meta">${esc(e.category)}${e.domain ? ' • ' + esc(e.domain) : ''}${timeEntryLearningDomain(e) ? ' • ' + esc(timeEntryLearningDomain(e)) : ''} • ${e.date}</div>
            </div>
            <span class="session-hours">${e.duration}h</span>
        </div>
    `).join('') || '<div class="empty">No sessions logged yet</div>';
}

function openTimeModal(){document.getElementById('timeTitle').value='';document.getElementById('timeDuration').value='';document.getElementById('timeDate').value=today();document.getElementById('timeCategory').value='study';document.getElementById('timeDomain').value='';document.getElementById('timeLearningDomain').value='technical';openModal('timeModal');}

// V11 helper: open time modal with prefilled study domain and duration (hours)
function openTimeModalWithPrefill(domain, title, hours){
  try {
    openTimeModal();
    const d = (domain || '').toLowerCase();
    const t = title || '';
    const h = (typeof hours === 'number' && !Number.isNaN(hours)) ? hours : 1;
    const elTitle = document.getElementById('timeTitle');
    const elDur = document.getElementById('timeDuration');
    const elDom = document.getElementById('timeDomain');
    const elLearningDom = document.getElementById('timeLearningDomain');
    if (elTitle) elTitle.value = t;
    if (elDur) elDur.value = String(h);
    const axis = normalizeLearningDomain(d);
    if (elDom && Array.from(elDom.options).some(option => option.value === d) && !['technical','strategic','leadership'].includes(d)) elDom.value = d;
    if (elLearningDom && axis) elLearningDom.value = axis;
  } catch(e){
    console.warn('openTimeModalWithPrefill failed', e);
  }
}
function saveTimeEntry(){const title=document.getElementById('timeTitle').value.trim();const dur=document.getElementById('timeDuration').value;if(!title||!dur){toast('Fill required');return;}const entries=arr(K.time);const domain=document.getElementById('timeDomain').value||null;const category=document.getElementById('timeCategory').value;const learningDomain=document.getElementById('timeLearningDomain').value||normalizeLearningDomain(domain)||(category==='study'?'technical':null);entries.push({id:uid(),title,duration:parseFloat(dur),date:document.getElementById('timeDate').value||today(),category,domain,learningDomain});set(K.time,entries);closeModal('timeModal');refreshTracker();refreshDashboard();toast('Logged!');}
