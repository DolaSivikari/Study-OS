window.STUDYOS_PAGES = window.STUDYOS_PAGES || {};

window.STUDYOS_PAGES.mushaf = String.raw`
<div class="page studyos-page claude-design-page mushaf-focus-page" id="mushaf" data-screen-label="Mushaf Reader">
    <!-- V62.3: also carries the standard page-header classes so the Mushaf
         route participates in the shared page hierarchy like the other 11
         pages. The .mushaf-dedicated-header rules still own its appearance. -->
    <header class="page-header page-header-primary mushaf-dedicated-header">
        <div class="mushaf-dedicated-title">
            <span class="mushaf-dedicated-kicker">Faith · Focus reading</span>
            <h2><span aria-hidden="true">📖</span> Mushaf Reader</h2>
            <p>Read one Quran page at a time with minimal distraction. Your page, display, font, and audio-follow settings remain connected to the main Quran tools.</p>
        </div>
        <div class="mushaf-dedicated-actions">
            <button class="btn btn-secondary btn-sm" type="button" onclick="go('quran')"><span aria-hidden="true">←</span> Quran tools</button>
            <button class="btn btn-primary btn-sm" id="mushafFocusToggle" type="button" onclick="quranMushafToggleFocus()">Focus view</button>
        </div>
    </header>
    <div id="quranMushafRoot" aria-live="polite"></div>
    <!-- V62.5: focus view hides the follow-along bar, so recitation started
         from a meaning row could not be stopped. This floating transport is
         the only audio control visible in focus view. -->
    <div class="mushaf-focus-transport" id="quranMushafFocusTransport" data-playback="idle" role="group" aria-label="Recitation controls">
        <button class="mushaf-focus-transport-btn" id="quranMushafFocusPlay" type="button" onclick="quranFollowAlongPlayPause()" aria-label="Play recitation" data-state="idle">▶</button>
        <button class="mushaf-focus-transport-btn" id="quranMushafFocusStop" type="button" onclick="quranFollowAlongStop()" aria-label="Stop recitation" disabled>■</button>
    </div>
    <button class="mushaf-focus-exit" id="mushafFocusExit" type="button" onclick="quranMushafToggleFocus(false)" aria-label="Exit Mushaf focus view">Exit focus</button>
</div>
`;
