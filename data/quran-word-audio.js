// ==================== QURAN WORD-LEVEL AUDIO & TEXT LAYERS (V55) ====================
// Registry and provenance record for the OPTIONAL online layers added in V55,
// adapted from the open-source Mahfuz project (github.com/theilgaz/mahfuz, MIT).
//
// These layers are fetched live from public Quran.com / Quran Foundation
// infrastructure and are always labelled in the UI as coming from that source.
// They never replace the stored StudyOS sources:
//   - Arabic verse text remains data/quran-verses.js (verbatim).
//   - The passage meaning remains data/quran-translations-tevhid.js (verbatim).
//   - Listen-tab streaming URLs remain data/quran-audio.js (validated refs).
//
// What this file registers:
//   1. TIMED_RECITERS — reciters whose QDC chapter audio ships word-level
//      timing segments ([wordPosition, startMs, endMs]). Used by the Read
//      tab follow-along player. Slug/ID table adapted from Mahfuz
//      apps/web/src/lib/audio-service.ts (SLUG_TO_QDC_ID).
//   2. EDITION_TO_QDC — conservative mapping from the StudyOS Listen-tab
//      edition identifiers (data/quran-audio.js, Al Quran Cloud) to QDC
//      reciter IDs where both catalogues describe the same recording family.
//      Used only to pick better-matching timing shapes for the Listen-tab
//      word highlight; the audio stream itself is unchanged.
//   3. ENDPOINTS — the exact public endpoints used, for auditability.
//
// Fallback tiers (adapted from Mahfuz):
//   Tier 1: reciter has real word segments → exact word highlight.
//   Tier 2: no segments → Mishary al-Afasy's segments are linearly rescaled
//           to the target verse duration (approximate highlight).
//   Tier 3: no timing at all (e.g. non-Arabic audio editions) → audio plays,
//           the word indicator simply does not move.
// All timing data is cached in memory for the session only; nothing is
// written to storage except the small preference object registered under
// K.quranFollowAlong.
(function(){
    window.QURAN_WORD_AUDIO = {
        title: 'Quran word-level audio timing and word/tajweed text layers',
        adaptedFrom: 'Mahfuz (github.com/theilgaz/mahfuz), MIT license',
        dataProviders: [
            'Quran.com QDC API (audio files + verse/word timings)',
            'Quran.com API v4 (word-by-word text, translation, transliteration; tajweed-annotated Uthmani text)',
            'audio.qurancdn.com / download.quranicaudio.com (chapter mp3 streams)'
        ],
        requiresInternet: true,
        neverReplacesLocalSources: true,

        ENDPOINTS: {
            timing: 'https://api.qurancdn.com/api/qdc/audio/reciters/{reciterId}/audio_files?chapter={1-114}&segments=true',
            wbw: 'https://api.quran.com/api/v4/verses/by_chapter/{1-114}?language={lang}&words=true&word_fields=text_uthmani,translation,transliteration&word_translation_language={lang}&per_page=50&page={n}',
            tajweed: 'https://api.quran.com/api/v4/quran/verses/uthmani_tajweed?chapter_number={1-114}',
            audioCdn: 'https://audio.qurancdn.com/'
        },

        // QDC reciter id used to synthesise approximate segments when the
        // selected reciter provides none (Tier 2).
        FALLBACK_RECITER_ID: 7, // Mishari Rashid al-Afasy

        // Tier-1 reciters for the Read-tab follow-along player.
        TIMED_RECITERS: [
            { slug: 'mishary-rashid-alafasy', qdcId: 7, name: 'Mishary Rashid Alafasy' },
            { slug: 'abdulbasit-abdulsamad-murattal', qdcId: 2, name: 'AbdulBaset AbdulSamad (Murattal)' },
            { slug: 'abdulbasit-abdulsamad-mujawwad', qdcId: 1, name: 'AbdulBaset AbdulSamad (Mujawwad)' },
            { slug: 'mahmoud-khalil-al-husary', qdcId: 6, name: 'Mahmoud Khalil Al-Husary' },
            { slug: 'mahmoud-khalil-al-husary-muallim', qdcId: 12, name: 'Al-Husary (Muallim)' },
            { slug: 'abdur-rahman-as-sudais', qdcId: 3, name: 'Abdur-Rahman As-Sudais' },
            { slug: 'saud-ash-shuraim', qdcId: 10, name: 'Saud Ash-Shuraim' },
            { slug: 'maher-al-muaiqly', qdcId: 52, name: 'Maher Al-Muaiqly' },
            { slug: 'saad-al-ghamdi', qdcId: 13, name: 'Saad Al-Ghamdi' },
            { slug: 'minshawi-murattal', qdcId: 9, name: 'Al-Minshawi (Murattal)' },
            { slug: 'minshawi-mujawwad', qdcId: 8, name: 'Al-Minshawi (Mujawwad)' },
            { slug: 'yasser-ad-dossari', qdcId: 97, name: 'Yasser Ad-Dossari' },
            { slug: 'khalid-al-jalil', qdcId: 170, name: 'Khalid Al-Jalil' },
            { slug: 'fatih-seferagic', qdcId: 134, name: 'Fatih Seferagic' },
            { slug: 'mahmood-ali-al-banna', qdcId: 129, name: 'Mahmood Ali Al-Banna' }
        ],

        // Listen-tab edition → QDC reciter (same recording family only).
        // Editions not listed here fall back to the Alafasy timing shape
        // (Tier 2); non-Arabic audio editions get no word sync (Tier 3).
        EDITION_TO_QDC: {
            'ar.alafasy': 7,
            'ar.abdulbasitmurattal': 2,
            'ar.husary': 6,
            'ar.abdurrahmaansudais': 3,
            'ar.saoodshuraym': 10,
            'ar.mahermuaiqly': 52,
            'ar.minshawi': 9,
            'ar.minshawimujawwad': 8
        }
    };
})();
