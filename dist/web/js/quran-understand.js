// ==================== QURAN UNDERSTAND (V56 — split from js/quran.js, audit R7) ====================
// Understand-tab: the non-mutating quote validator UI and the integrity /
// provenance cards. The validator engine itself is js/quran-validator.js;
// this file only renders and never rewrites input or stored text.

function quranValidatorOpenReference(reference) {
    const validator = window.QURAN_VALIDATOR;
    if (!validator || typeof validator.parseReference !== 'function') return;
    const parsed = validator.parseReference(reference);
    if (!parsed) return;
    goTab('quran', 'quranread');
    quranReadJumpTo(parsed.surah, parsed.startAyah);
}

function quranValidatorClear() {
    const input = document.getElementById('quranValidatorInput');
    const reference = document.getElementById('quranValidatorReference');
    const result = document.getElementById('quranValidatorResult');
    if (input) input.value = '';
    if (reference) reference.value = '';
    if (result) result.innerHTML = '';
}

function quranValidatorRun() {
    const input = document.getElementById('quranValidatorInput');
    const referenceInput = document.getElementById('quranValidatorReference');
    const resultRoot = document.getElementById('quranValidatorResult');
    if (!input || !resultRoot) return;

    const originalText = String(input.value || '');
    const reference = referenceInput ? String(referenceInput.value || '').trim() : '';
    const validator = window.QURAN_VALIDATOR;

    if (!validator || typeof validator.validate !== 'function' || !validator.isReady()) {
        resultRoot.innerHTML =
            '<div class="quran-validator-message is-error"><strong>Validator unavailable</strong>' +
            '<span>The 6,236-verse reference index did not load.</span></div>';
        return;
    }

    if (!originalText.trim()) {
        resultRoot.innerHTML =
            '<div class="quran-validator-message is-warning"><strong>Paste Arabic text first</strong>' +
            '<span>The validator only checks complete Arabic verse text.</span></div>';
        return;
    }

    if (reference && !validator.parseReference(reference)) {
        resultRoot.innerHTML =
            '<div class="quran-validator-message is-error"><strong>Invalid reference</strong>' +
            '<span>Use a reference such as <code>1:1</code> or <code>112:1-4</code>.</span></div>';
        return;
    }

    const validation = reference
        ? validator.validateAgainst(originalText, reference)
        : validator.validate(originalText);

    let statusClass = 'is-error';
    let title = 'No verified full-verse match';
    let explanation = 'The text was not accepted as a complete Quran verse. Partial and fuzzy matches are deliberately rejected.';
    if (validation.isValid && validation.matchType === 'exact') {
        statusClass = 'is-valid';
        title = 'Exact Quran match';
        explanation = 'The submitted text matches the stored Uthmani source character for character.';
    } else if (validation.isValid && validation.matchType === 'normalized') {
        statusClass = 'is-normalized';
        title = 'Valid after normalization';
        explanation = 'The complete verse matches after comparison-only normalization of diacritics and accepted orthographic forms. The submitted text was not changed.';
    } else if (reference && validation.canonicalText) {
        title = 'Text does not match ' + validation.reference;
        explanation = 'The submitted text differs from the stored source for this reference. No automatic correction or replacement was applied.';
    }

    const matchedReference = validation.reference || '';
    const canonical = validation.canonicalText || (validation.matchedVerse ? validation.matchedVerse.text : '');
    const openButton = matchedReference && canonical
        ? '<button class="btn btn-secondary btn-sm" type="button" onclick="quranValidatorOpenReference(\'' + esc(matchedReference) + '\')">Open in reader</button>'
        : '';
    const mismatch = typeof validation.mismatchIndex === 'number' && validation.mismatchIndex >= 0
        ? '<span class="quran-validator-mismatch">First normalized mismatch index: ' + validation.mismatchIndex + '</span>'
        : '';
    const canonicalBlock = canonical
        ? '<div class="quran-validator-canonical">' +
            '<div class="quran-validator-canonical-head"><span>Stored canonical source</span><strong>' + esc(matchedReference) + '</strong></div>' +
            '<div class="quran-validator-canonical-arabic" dir="rtl" lang="ar">' + esc(canonical) + '</div>' +
          '</div>'
        : '';

    resultRoot.innerHTML =
        '<div class="quran-validator-message ' + statusClass + '">' +
            '<div class="quran-validator-result-head"><div><strong>' + esc(title) + '</strong>' +
            (matchedReference ? '<span>Reference: ' + esc(matchedReference) + '</span>' : '') +
            '</div>' + openButton + '</div>' +
            '<p>' + esc(explanation) + '</p>' +
            mismatch +
        '</div>' +
        canonicalBlock;

    // Sacred-text rule: validation is read-only. Never replace textarea content.
    input.value = originalText;
}

function renderQuranUnderstand() {
    const root = document.getElementById('quranUnderstandRoot');
    if (!root) return;

    // V56 (audit R9): the validator's 6,236-verse index needs the lazy
    // datasets; load them on first entry, then the loader rebuilds the index.
    if (typeof quranDataReady === 'function' && !quranDataReady()) {
        if (typeof quranDataStatus === 'function' && quranDataStatus() === 'error') {
            root.innerHTML = '<div class="card quran-load-error"><strong>Quran data files could not be loaded.</strong><p>The validator needs data/quran-verses.js. <button class="btn btn-secondary btn-sm" type="button" onclick="quranEnsureData(function(){renderQuranUnderstand();})">Retry</button></p></div>';
            return;
        }
        root.innerHTML = '<div class="card quran-load-pending"><strong>Loading the Quran library…</strong><p>The 6,236-verse reference index loads on first use so app startup stays fast.</p></div>';
        quranEnsureData(function() { renderQuranUnderstand(); });
        return;
    }

    const source = window.QURAN_TRANSLATION_TEVHID_SOURCE || {};
    const validatorMeta = window.QURAN_VALIDATOR_META || {};
    const validatorReady = Boolean(window.QURAN_VALIDATOR && window.QURAN_VALIDATOR.isReady && window.QURAN_VALIDATOR.isReady());

    root.innerHTML =
        // V62.4: offline availability sits at the top of Understand, because
        // this tab is where the app is honest about what comes from where.
        '<div class="card quran-offline-card">' +
            '<div class="quran-offline-head">' +
                '<div><span class="quran-validator-kicker">Offline availability</span>' +
                '<h3>Keep the word layers on this device</h3>' +
                '<p>Word meanings and timings are fetched from Quran.com. Anything you open is now stored permanently, so it keeps working offline and survives the source changing. Download ahead of time to choose when that happens.</p></div>' +
            '</div>' +
            '<div id="quranOfflineRoot"></div>' +
        '</div>' +
        '<div class="card quran-validator-card">' +
            '<div class="quran-validator-card-head">' +
                '<div><span class="quran-validator-kicker">Non-mutating verification</span><h3>Quran quote validator</h3>' +
                '<p>Paste a complete Arabic ayah, or enter a reference to compare against a specific ayah or range. Validation never edits the input or replaces stored scripture.</p></div>' +
                '<span class="quran-validator-ready ' + (validatorReady ? 'is-ready' : 'is-error') + '">' + (validatorReady ? '6,236 verses ready' : 'Reference index unavailable') + '</span>' +
            '</div>' +
            '<div class="quran-validator-form">' +
                '<label class="quran-validator-text-label"><span>Arabic text</span><textarea id="quranValidatorInput" dir="rtl" lang="ar" rows="5" placeholder="Paste the complete Arabic verse here"></textarea></label>' +
                '<label class="quran-validator-reference-label"><span>Expected reference <em>optional</em></span><input id="quranValidatorReference" class="form-input" type="text" inputmode="text" placeholder="Example: 2:255 or 112:1-4"></label>' +
            '</div>' +
            '<div class="quran-validator-actions">' +
                '<button class="btn btn-primary" type="button" onclick="quranValidatorRun()">Validate quote</button>' +
                '<button class="btn btn-secondary" type="button" onclick="quranValidatorClear()">Clear</button>' +
            '</div>' +
            '<div id="quranValidatorResult" class="quran-validator-result" aria-live="polite"></div>' +
            '<div class="quran-validator-policy"><strong>Strict mode:</strong> only complete exact or normalized verse matches are accepted. Partial and fuzzy matches are not treated as valid Quran quotations.</div>' +
        '</div>' +
        '<div class="card quran-integrity-card">' +
            '<h3>Text integrity</h3>' +
            '<p>The Arabic dataset was checked against the uploaded <code>quran-validator</code> reference database: 6,236 of 6,236 ayahs matched exactly, including both Uthmani and simplified text fields. The validator is used as a read-only comparison layer; its auto-correction behavior is intentionally not enabled in StudyOS.</p>' +
            '<p>The Read tab uses Tevhid Meali inline for all 6,236 ayahs. StudyOS does not generate, paraphrase, correct, modernize, or interpret the Arabic verses or Turkish meal.</p>' +
            '<p>The Tevhid extraction process only reconstructs PDF line wrapping and removes superscript footnote-reference numerals from the verse display. Parenthetical wording is retained. The two combined source ranges, 20:27-28 and 37:22-23, remain combined rather than being split by inference.</p>' +
            '<div class="quran-integrity-grid">' +
                '<span><strong>Arabic reference</strong>quran-validator ' + esc(validatorMeta.version || '1.3.0') + '</span>' +
                '<span><strong>Exact coverage</strong>6,236 / 6,236</span>' +
                '<span><strong>Validation mode</strong>Read-only</span>' +
            '</div>' +
            '<div class="quran-reference-links">' +
                '<a class="btn btn-secondary btn-sm" href="data/quran-validator.validation.json" target="_blank" rel="noopener">Arabic validation report</a>' +
                '<a class="btn btn-secondary btn-sm" href="THIRD-PARTY-NOTICES.md" target="_blank" rel="noopener">Third-party notice</a>' +
            '</div>' +
            (source.sha256 ? '<p class="quran-source-hash"><strong>Tevhid source PDF SHA-256:</strong> <code>' + esc(source.sha256) + '</code></p>' : '') +
        '</div>' +
        '<div class="card quran-reference-card">' +
            '<h3>Source files</h3>' +
            '<p><strong>Tevhid Meali</strong> · Halis Bayancuk (Ebu Hanzala) · 3. Baskı, Mart 2024 · Tevhid Basım Yayın.</p>' +
            '<div class="quran-reference-links">' +
                '<a class="btn btn-secondary btn-sm" href="media/quran-reference/tevhid-meali.pdf" target="_blank" rel="noopener">Text edition</a>' +
                '<a class="btn btn-secondary btn-sm" href="data/quran-translations-tevhid.validation.json" target="_blank" rel="noopener">Tevhid validation report</a>' +
            '</div>' +
            // V56: the former "Edition with Mushaf" button was removed — its
            // PDF is not shipped in the repo, so the link was permanently
            // broken (V54/V55 audit finding R1). Restore the button only if
            // media/quran-reference/tevhid-kur-an-i-kerim-meali.pdf returns.
        '</div>' +
        '<div class="card quran-reference-card">' +
            '<h3>Audio data</h3>' +
            '<p>The supplied Quran database contains 149,664 validated verse-level audio URL references: 24 complete editions with 6,236 ayahs each. Nineteen are Arabic recitations and five are other-language audio editions. It does not contain MP3 bytes, so the Listen tab streams from the recorded source URLs and requires internet access.</p>' +
            '<div class="quran-reference-links"><a class="btn btn-secondary btn-sm" href="data/quran-audio.validation.json" target="_blank" rel="noopener">Audio validation report</a></div>' +
        '</div>' +
        '<div class="card quran-reference-card">' +
            '<h3>Word-level layers (V55 — Quran.com, adapted from Mahfuz)</h3>' +
            '<p>The word-by-word reading mode, word tooltips, tajweed letter coloring, and the word-timed follow-along audio are optional online layers fetched live from Quran.com / Quran Foundation infrastructure, following the approach of the open-source <strong>Mahfuz</strong> project (MIT). They are cached in memory for the session, always labelled in the UI, and require internet access.</p>' +
            '<p>Integrity boundary: these layers never modify or replace the stored sources. The reader’s word spans only re-group the stored Arabic string and fall back to the untouched string if re-grouping is not byte-identical. When tajweed coloring is on, the displayed letters come from the labelled Quran.com tajweed text; turning it off returns to the stored StudyOS Arabic. Word meanings are shown per word (Türkçe or English) and are never merged into the Tevhid Meali.</p>' +
            '<p>Word timing tiers: reciters with real QDC segments track exactly; reciters without segments use the Alafasy timing shape rescaled to the verse duration (approximate); audio editions with no timing play with a static text display.</p>' +
            '<p>The earlier Quran-MD word dataset remains excluded: it labels <code>word_en</code> as an English meaning and <code>word_tr</code> as transliteration, and StudyOS does not relabel transliteration as Turkish or generate its own Turkish word meanings. The V55 word layer instead uses Quran.com entries that carry an explicit language label per word.</p>' +
            '<div class="quran-reference-links">' +
                '<a class="btn btn-secondary btn-sm" href="data/quran-word-audio.js" target="_blank" rel="noopener">Layer registry &amp; provenance</a>' +
                '<a class="btn btn-secondary btn-sm" href="THIRD-PARTY-NOTICES.md" target="_blank" rel="noopener">Third-party notices</a>' +
            '</div>' +
        '</div>';

    // V62.4: fills #quranOfflineRoot; async because it reads IndexedDB stats.
    if (typeof renderQuranOffline === 'function') renderQuranOffline();
}
