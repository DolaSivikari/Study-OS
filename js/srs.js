// ==================== SPACED REPETITION / FLASHCARDS ====================
// Enhanced with: Confidence Calibration (Phase 1), Interleaved Reviews (Phase 2),
// Pre-Test Mode (Phase 3), Desirable Difficulty (Phase 6)

let editingCardId = null;
let srsFilter = 'all';
let currentReviewCards = [];
let currentCardIndex = 0;
let cardFlipped = false;
let srsMode = null; // initialized from Settings on first render
let srsFocusedCategory = 'auto';
let preTestMode = false;

// Spaced repetition intervals (in days)
const SRS_INTERVALS = {
    new: 0,
    hard: 1,
    medium: 3,
    easy: 7,
    mastered: 14
};

function srsInitializeMode() {
    if (srsMode) return;
    const settings = typeof getSettings === 'function' ? getSettings() : {};
    srsMode = settings.interleaveDefault === false ? 'focused' : 'interleaved';
}

function setSRSMode(mode) {
    srsMode = mode === 'focused' ? 'focused' : 'interleaved';
    renderFlashcards();
}

function setSRSFocusedCategory(category) {
    srsFocusedCategory = category || 'auto';
    renderFlashcards();
}

function srsShuffle(items) {
    const result = items.slice();
    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
}

function srsInterleaveByCategory(cards) {
    const buckets = {};
    cards.forEach(card => {
        const category = card.category || 'general';
        if (!buckets[category]) buckets[category] = [];
        buckets[category].push(card);
    });
    Object.keys(buckets).forEach(category => { buckets[category] = srsShuffle(buckets[category]); });

    const mixed = [];
    let previousCategory = null;
    while (mixed.length < cards.length) {
        const available = Object.keys(buckets).filter(category => buckets[category].length);
        const alternatives = available.filter(category => category !== previousCategory);
        const choices = alternatives.length ? alternatives : available;
        const category = choices[Math.floor(Math.random() * choices.length)];
        mixed.push(buckets[category].pop());
        previousCategory = category;
    }
    return mixed;
}

function srsAutoFocusedCategory(cards) {
    const counts = {};
    cards.forEach(card => {
        const category = card.category || 'general';
        counts[category] = (counts[category] || 0) + 1;
    });
    return Object.keys(counts).sort((a, b) => counts[b] - counts[a] || a.localeCompare(b))[0] || 'general';
}

function srsReviewPlan(card, rating) {
    const previous = Math.max(0, Number(card && card.interval) || 0);
    const currentEase = Math.min(3, Math.max(1.3, Number(card && card.easeFactor) || 2.5));
    const settings = typeof getSettings === 'function' ? getSettings() : {};
    const stretch = 1 + Math.max(0, Math.min(50, Number(settings.spacingStretch) || 0)) / 100;
    let interval;
    let easeFactor = currentEase;

    if (rating === 'again') {
        interval = 1;
        easeFactor = Math.max(1.3, currentEase - 0.2);
    } else if (rating === 'hard') {
        interval = previous <= 1 ? 2 : previous * 1.2;
        easeFactor = Math.max(1.3, currentEase - 0.1);
    } else if (rating === 'easy') {
        interval = previous <= 1 ? 7 : previous * currentEase * 1.3 * stretch;
        easeFactor = Math.min(3, currentEase + 0.1);
    } else {
        interval = previous <= 1 ? 3 : previous * currentEase * stretch;
    }

    return {
        interval: Math.max(1, Math.min(365, Math.round(interval))),
        easeFactor
    };
}

function srsReviewWasCorrect(review) {
    if (!review) return false;
    return Number(review.ratingScale) >= 2 ? review.outcome !== 'again' : review.outcome !== 'hard';
}

function renderFlashcards() {
    srsInitializeMode();
    const cards = arr(K.flashcards);
    const todayStr = today();
    
    const dueCards = cards.filter(c => !c.nextReview || c.nextReview <= todayStr);
    const dueNow = dueCards.length;
    const newCards = cards.filter(c => !c.nextReview || c.reviews === 0).length;
    
    document.getElementById('srsDueNow').textContent = dueNow;
    document.getElementById('srsDueToday').textContent = dueNow;
    document.getElementById('srsTotal').textContent = cards.length;
    
    // Calculate streak
    const reviewHistory = get(K.cardReviews) || {};
    let streak = 0;
    let checkDate = new Date();
    while (reviewHistory[fmtDate(checkDate)] && streak < 365) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
    }
    document.getElementById('srsStreak').textContent = streak;
    
    // Calibration score
    const calibration = getCalibrationScore();
    const calibEl = document.getElementById('srsCalibration');
    if (calibEl) {
        calibEl.textContent = calibration !== null ? calibration.toFixed(0) + '%' : '—';
        calibEl.style.color = calibration !== null ? (calibration >= 80 ? 'var(--success)' : calibration >= 60 ? 'var(--warning)' : 'var(--danger)') : 'var(--text-muted)';
    }
    
    // Review prompt
    const reviewArea = document.getElementById('srsStartReview');
    const reviewButton = reviewArea && reviewArea.querySelector('button');
    if (reviewArea) reviewArea.style.display = 'block';
    if (reviewButton) {
        reviewButton.style.display = '';
        reviewButton.textContent = 'Start Review Session';
        reviewButton.onclick = startSRSReview;
    }
    if (dueNow > 0) {
        document.getElementById('srsReviewPrompt').textContent = `You have ${dueNow} card${dueNow > 1 ? 's' : ''} to review!`;
        reviewArea.style.display = 'block';
    } else if (cards.length === 0) {
        document.getElementById('srsReviewPrompt').textContent = 'Create your first flashcard to get started';
        reviewButton.textContent = 'Create Card';
        reviewButton.onclick = () => openFlashcardModal();
    } else {
        document.getElementById('srsReviewPrompt').textContent = '🎉 All caught up! No cards due.';
        if (reviewButton) reviewButton.style.display = 'none';
    }
    
    // Mode toggle
    const modeEl = document.getElementById('srsModeToggle');
    if (modeEl) {
        const categories = [...new Set(dueCards.map(card => card.category || 'general'))].sort();
        modeEl.innerHTML = `
            <div class="srs-mode-controls">
                <button class="filter-btn ${srsMode==='interleaved'?'active':''}" onclick="setSRSMode('interleaved')">Mixed review</button>
                <button class="filter-btn ${srsMode==='focused'?'active':''}" onclick="setSRSMode('focused')">Focused review</button>
                ${srsMode === 'focused' ? `<label class="srs-category-label">Category
                    <select class="form-select srs-category-select" onchange="setSRSFocusedCategory(this.value)">
                        <option value="auto" ${srsFocusedCategory === 'auto' ? 'selected' : ''}>Auto · largest due group</option>
                        ${categories.map(category => `<option value="${esc(category)}" ${srsFocusedCategory === category ? 'selected' : ''}>${esc(category)}</option>`).join('')}
                    </select>
                </label>` : ''}
            </div>
            <div class="srs-mode-note">${srsMode === 'interleaved'
                ? 'Mixes due categories and avoids same-category runs when possible. Useful after the basics are established.'
                : 'Keeps this session within one category. Useful for a new topic or a single procedure.'}</div>
        `;
    }
    
    // Filters
    document.getElementById('srsFilters').innerHTML = `
        <button class="filter-btn ${srsFilter==='all'?'active':''}" onclick="srsFilter='all';renderFlashcards()">All (${cards.length})</button>
        <button class="filter-btn ${srsFilter==='due'?'active':''}" onclick="srsFilter='due';renderFlashcards()">Due (${dueNow})</button>
        <button class="filter-btn ${srsFilter==='new'?'active':''}" onclick="srsFilter='new';renderFlashcards()">New (${newCards})</button>
    `;
    
    let filtered = cards;
    if (srsFilter === 'due') filtered = cards.filter(c => c.nextReview && c.nextReview <= todayStr);
    if (srsFilter === 'new') filtered = cards.filter(c => !c.nextReview || c.reviews === 0);
    
    document.getElementById('flashcardsList').innerHTML = filtered.length ? filtered.map(card => `
        <div class="srs-queue-item" onclick="editFlashcard('${card.id}')">
            <div style="flex:1;min-width:0;">
                <div style="font-weight:500;margin-bottom:4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${esc(card.question.substring(0, 60))}${card.question.length > 60 ? '...' : ''}</div>
                <div style="font-size:0.75rem;color:var(--text-muted);display:flex;gap:8px;">
                    <span>${card.category || 'general'}</span>
                    <span>•</span>
                    <span>${card.reviews || 0} reviews</span>
                </div>
            </div>
            ${card.nextReview && card.nextReview <= todayStr ? '<span class="due-badge due-now">Due</span>' : 
              card.nextReview ? `<span class="due-badge due-soon">${card.nextReview}</span>` : 
              '<span class="due-badge" style="background:rgba(34,197,94,0.15);color:var(--success);">New</span>'}
        </div>
    `).join('') : '<div class="empty">No flashcards yet. Create one to start learning!</div>';
}

function openFlashcardModal() {
    editingCardId = null;
    document.getElementById('flashcardModalTitle').textContent = 'New Flashcard';
    document.getElementById('cardQuestionInput').value = '';
    document.getElementById('cardAnswerInput').value = '';
    document.getElementById('cardCategory').value = 'pmp';
    document.getElementById('cardTags').value = '';
    document.getElementById('deleteCardBtn').style.display = 'none';
    openModal('flashcardModal');
}

function editFlashcard(id) {
    const card = arr(K.flashcards).find(c => c.id === id);
    if (!card) return;
    editingCardId = id;
    document.getElementById('flashcardModalTitle').textContent = 'Edit Flashcard';
    document.getElementById('cardQuestionInput').value = card.question || '';
    document.getElementById('cardAnswerInput').value = card.answer || '';
    document.getElementById('cardCategory').value = card.category || 'general';
    document.getElementById('cardTags').value = (card.tags || []).join(', ');
    document.getElementById('deleteCardBtn').style.display = 'inline-block';
    openModal('flashcardModal');
}

function saveFlashcard() {
    const question = document.getElementById('cardQuestionInput').value.trim();
    const answer = document.getElementById('cardAnswerInput').value.trim();
    if (!question || !answer) { toast('Please fill in both question and answer'); return; }
    
    const cards = arr(K.flashcards);
    const cardData = {
        question, answer,
        category: document.getElementById('cardCategory').value,
        tags: document.getElementById('cardTags').value.split(',').map(t => t.trim()).filter(t => t),
        updatedAt: new Date().toISOString()
    };
    
    if (editingCardId) {
        const idx = cards.findIndex(c => c.id === editingCardId);
        if (idx >= 0) cards[idx] = { ...cards[idx], ...cardData };
    } else {
        cards.push({
            id: uid(), ...cardData,
            createdAt: new Date().toISOString(),
            reviews: 0, nextReview: today(), interval: 0, easeFactor: 2.5
        });
    }
    set(K.flashcards, cards);
    closeModal('flashcardModal');
    renderFlashcards();
    toast(editingCardId ? 'Card updated!' : 'Card created!');
}

function deleteFlashcard() {
    if (!editingCardId || !confirm('Delete this flashcard?')) return;
    set(K.flashcards, arr(K.flashcards).filter(c => c.id !== editingCardId));
    closeModal('flashcardModal');
    renderFlashcards();
    toast('Card deleted');
}

// ==================== PHASE 1: CONFIDENCE CALIBRATION ====================

function getCalibrationScore() {
    const reviews = arr(K.cardReviewDetails);
    if (reviews.length < 10) return null;
    const recent = reviews.slice(-100);
    const withConfidence = recent.filter(r => r.confidence);
    if (withConfidence.length < 5) return null;
    
    // Calibration = how well confidence predicts accuracy
    // Confidence 1-5 maps to expected accuracy 20%-100%
    let totalError = 0;
    const bins = {};
    withConfidence.forEach(r => {
        const c = r.confidence;
        if (!bins[c]) bins[c] = { correct: 0, total: 0 };
        bins[c].total++;
        if (srsReviewWasCorrect(r)) bins[c].correct++;
    });
    
    let calibrated = 0, total = 0;
    Object.entries(bins).forEach(([conf, data]) => {
        const expected = (parseInt(conf) / 5); // 1->0.2, 5->1.0
        const actual = data.correct / data.total;
        calibrated += (1 - Math.abs(expected - actual)) * data.total;
        total += data.total;
    });
    
    return total > 0 ? (calibrated / total) * 100 : null;
}

// ==================== PHASE 2: INTERLEAVED REVIEWS ====================

function startSRSReview() {
    srsInitializeMode();
    const cards = arr(K.flashcards);
    const todayStr = today();
    const dueCards = cards.filter(c => !c.nextReview || c.nextReview <= todayStr);
    
    if (srsMode === 'interleaved') {
        currentReviewCards = srsInterleaveByCategory(dueCards);
    } else {
        const category = srsFocusedCategory === 'auto' ? srsAutoFocusedCategory(dueCards) : srsFocusedCategory;
        currentReviewCards = srsShuffle(dueCards.filter(card => (card.category || 'general') === category));
    }
    
    if (currentReviewCards.length === 0) { toast('No cards to review!'); return; }
    
    currentCardIndex = 0;
    cardFlipped = false;
    preTestMode = false;
    
    document.getElementById('srsStartReview').style.display = 'none';
    document.getElementById('srsReviewArea').style.display = 'block';
    showCurrentCard();
}

// ==================== PHASE 3: PRE-TEST MODE ====================

function startPreTest(pathwayId) {
    const cards = arr(K.flashcards);
    const pathway = pathwayId || 'pmp';
    
    // Get cards the user hasn't reviewed yet in this pathway
    const unreviewed = cards.filter(c => c.category === pathway && (!c.reviews || c.reviews === 0));
    
    if (unreviewed.length === 0) {
        toast('No new cards available for pre-test in this pathway');
        return;
    }
    
    currentReviewCards = unreviewed.sort(() => Math.random() - 0.5).slice(0, 10);
    currentCardIndex = 0;
    cardFlipped = false;
    preTestMode = true;
    
    document.getElementById('srsStartReview').style.display = 'none';
    document.getElementById('srsReviewArea').style.display = 'block';
    go('flashcards');
    showCurrentCard();
}

function showCurrentCard() {
    if (currentCardIndex >= currentReviewCards.length) {
        finishSRSReview();
        return;
    }
    
    const card = currentReviewCards[currentCardIndex];
    currentConfidence = 0;
    const modeLabel = preTestMode ? '🧪 Pre-Test' : (srsMode === 'interleaved' ? '🔀 Interleaved' : '🎯 Focused');
    
    document.getElementById('cardMeta').innerHTML = `
        <span>${modeLabel}</span> · Card ${currentCardIndex + 1} of ${currentReviewCards.length}
        ${card.category ? ` · <span style="color:var(--purple);font-weight:500;">${card.category.toUpperCase()}</span>` : ''}
    `;
    document.getElementById('cardQuestion').textContent = card.question;
    document.getElementById('cardAnswer').textContent = card.answer;
    
    document.getElementById('cardFront').style.display = 'block';
    document.getElementById('cardBack').style.display = 'none';
    document.getElementById('cardDifficulty').style.display = 'none';

    ['again', 'hard', 'good', 'easy'].forEach(rating => {
        const label = document.getElementById(`srs${rating.charAt(0).toUpperCase() + rating.slice(1)}Interval`);
        if (!label) return;
        const days = srsReviewPlan(card, rating).interval;
        label.textContent = `${days} day${days === 1 ? '' : 's'}`;
    });
    
    // Show confidence rating before flip
    const confEl = document.getElementById('cardConfidence');
    if (confEl) {
        confEl.style.display = 'flex';
        confEl.innerHTML = `
            <div style="font-size:0.8rem;color:var(--text-muted);margin-bottom:6px;">How confident are you?</div>
            <div style="display:flex;gap:6px;">
                ${[1,2,3,4,5].map(n => `<button class="btn btn-sm" style="min-width:36px;background:var(--bg-tertiary);border:1px solid var(--border);" onclick="setConfidence(${n})" id="conf${n}">${n}</button>`).join('')}
            </div>
            <div style="display:flex;justify-content:space-between;font-size:0.65rem;color:var(--text-muted);margin-top:2px;"><span>Guessing</span><span>Certain</span></div>
        `;
    }
    
    document.getElementById('currentFlashcard').classList.remove('flipped');
    cardFlipped = false;
}

let currentConfidence = 0;

function setConfidence(level) {
    currentConfidence = level;
    for (let i = 1; i <= 5; i++) {
        const btn = document.getElementById('conf' + i);
        if (btn) {
            btn.style.background = i <= level ? 'var(--accent)' : 'var(--bg-tertiary)';
            btn.style.color = i <= level ? 'white' : 'var(--text-primary)';
        }
    }
}

function flipCard() {
    if (cardFlipped) return;
    cardFlipped = true;
    
    document.getElementById('cardFront').style.display = 'none';
    document.getElementById('cardBack').style.display = 'block';
    document.getElementById('cardDifficulty').style.display = 'flex';
    const confEl = document.getElementById('cardConfidence');
    if (confEl) confEl.style.display = 'none';
    document.getElementById('currentFlashcard').classList.add('flipped');
}

function rateCard(difficulty) {
    const card = currentReviewCards[currentCardIndex];
    const cards = arr(K.flashcards);
    const idx = cards.findIndex(c => c.id === card.id);
    
    if (idx >= 0) {
        const normalizedRating = difficulty === 'medium' ? 'good' : difficulty;
        const plan = srsReviewPlan(cards[idx], normalizedRating);
        
        const nextDate = new Date();
        nextDate.setDate(nextDate.getDate() + plan.interval);
        
        cards[idx].reviews = (cards[idx].reviews || 0) + 1;
        cards[idx].interval = plan.interval;
        cards[idx].easeFactor = plan.easeFactor;
        cards[idx].nextReview = fmtDate(nextDate);
        cards[idx].lastReview = today();
        cards[idx].lastRating = normalizedRating;
        if (normalizedRating === 'again') cards[idx].lapses = (cards[idx].lapses || 0) + 1;
        if (preTestMode) cards[idx].preTested = true;
        
        set(K.flashcards, cards);
    }
    
    // Log review with confidence (Phase 1)
    const reviewHistory = get(K.cardReviews) || {};
    reviewHistory[today()] = (reviewHistory[today()] || 0) + 1;
    set(K.cardReviews, reviewHistory);
    
    // Detailed review log for calibration
    const detailKey = K.cardReviewDetails;
    const details = get(detailKey) || [];
    details.push({
        cardId: card.id,
        date: today(),
        confidence: currentConfidence,
        outcome: difficulty === 'medium' ? 'good' : difficulty,
        ratingScale: 2,
        category: card.category,
        mode: preTestMode ? 'pretest' : srsMode
    });
    // Keep last 500 entries
    if (details.length > 500) details.splice(0, details.length - 500);
    set(detailKey, details);
    
    currentConfidence = 0;
    currentCardIndex++;
    showCurrentCard();
}

function finishSRSReview() {
    document.getElementById('srsReviewArea').style.display = 'none';
    document.getElementById('srsStartReview').style.display = 'block';
    
    const mode = preTestMode ? 'Pre-test' : 'Review';
    toast(`🎉 ${mode} session complete! ${currentReviewCards.length} cards reviewed`);
    preTestMode = false;
    renderFlashcards();
}


function createFlashcardPack(moduleId){
    if (typeof doctrineCreateFlashcardPack === 'function') return doctrineCreateFlashcardPack(moduleId);
    return openFlashcardModal();
}
window.createFlashcardPack = createFlashcardPack;
window.SRS_ENGINE = {
    version: 2,
    reviewPlan: srsReviewPlan,
    interleaveByCategory: srsInterleaveByCategory,
    autoFocusedCategory: srsAutoFocusedCategory,
    reviewWasCorrect: srsReviewWasCorrect,
    selfTest: function(){
        var fresh = { interval:0, easeFactor:2.5 };
        var ratingsOk = srsReviewPlan(fresh, 'again').interval === 1 &&
            srsReviewPlan(fresh, 'hard').interval === 2 &&
            srsReviewPlan(fresh, 'good').interval === 3 &&
            srsReviewPlan(fresh, 'easy').interval === 7;
        var cards = [
            { id:'a1', category:'a' }, { id:'a2', category:'a' },
            { id:'b1', category:'b' }, { id:'b2', category:'b' }
        ];
        var mixed = srsInterleaveByCategory(cards);
        var mixedOk = mixed.length === 4 && mixed.every(function(card, index){
            return index === 0 || card.category !== mixed[index - 1].category;
        });
        var focusedOk = srsAutoFocusedCategory(cards.concat([{ id:'a3', category:'a' }])) === 'a';
        var calibrationOk = !srsReviewWasCorrect({ outcome:'again', ratingScale:2 }) &&
            srsReviewWasCorrect({ outcome:'hard', ratingScale:2 }) &&
            !srsReviewWasCorrect({ outcome:'hard' });
        return {
            pass: ratingsOk && mixedOk && focusedOk && calibrationOk,
            checks:{ adaptiveRatings:ratingsOk, trueInterleaving:mixedOk, focusedCategory:focusedOk, calibrationCompatibility:calibrationOk }
        };
    }
};
