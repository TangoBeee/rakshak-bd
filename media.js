/* ══════════════════════════════════════════════════════════════════
   RAKSHAK TV — the only file you need to edit.

   Drop files into  assets/  then point the paths below at them.
   Anything you leave as ''  is skipped, and the channel still works.
   ══════════════════════════════════════════════════════════════════ */

const MEDIA = {

  /* ── the song ──────────────────────────────────────────────────
     Your Suno track. This is the ONLY audio on the page —
     the dance clips are force-muted so they never fight it.        */
  song: {
    src:    'assets/song.mp3',
    title:  'RAKSHAK (feat. a lot of water)',   // shown next to the ♪ button
    volume: 0.6,
  },


  /* ── CH 01 · dance clips ───────────────────────────────────────
     2–3 short clips is perfect. Vertical phone videos are fine —
     they're letterboxed against a blurred copy of themselves.
     Add or remove entries freely; the dots at the bottom follow.   */
  clips: [
    { src: 'assets/videos/dance-1.mp4', label: 'exhibit A' },
    { src: 'assets/videos/dance-2.mp4', label: 'exhibit B' },
    { src: 'assets/videos/dance-3.mp4', label: 'exhibit C' },
  ],


  /* ── photos ────────────────────────────────────────────────────
     Six slots. Any aspect ratio works — they're cropped to fill,
     so use `focus` to keep his face in frame.
     Set src to '' and that channel falls back to a clean colour.   */
  photos: {

    /* the boot-up test card — a small inset portrait of him */
    testcard:  { src: 'assets/photos/rakshak.jpg',   focus: '50% 35%' },

    /* CH 07 — him, ideally with the water bottle in shot */
    hydration: { src: 'assets/photos/water.jpg',     focus: 'center' },

    /* CH 12 — anything late-night / at a desk / lit by a screen */
    afterhours:{ src: 'assets/photos/late-night.jpg', focus: 'center' },

    /* CH 23 — two sporty ones: badminton, running, pool, chess… */
    sports:  [ { src: 'assets/photos/sport-1.jpg',   focus: 'center' },
               { src: 'assets/photos/sport-2.jpg',   focus: 'center' } ],

    /* CH 30 — the nicest one. Vietnam, or you two together */
    birthday:  { src: 'assets/photos/vietnam.jpg',   focus: '50% 40%' },
  },


  /* ── the message on CH 30 ──────────────────────────────────────
     Keep it short. It's funnier landing after four joke channels.  */
  message: [
    'Seven years older. Definitely more experienced.',
    'Somehow still just my work buddy.',
    '',
    "I've learned a lot working with you. Here's to more good work,",
    'good places, good health — and maybe some sleep.',
  ],


  /* ── the news ticker ───────────────────────────────────────────
     Scrolls along the bottom forever. Add your own.                */
  ticker: [
    'BREAKING: LOCAL MAN TURNS 30, SHOWS NO SIGNS OF SLOWING DOWN',
    'HYDRATION LEVELS REMAIN CRITICALLY ABOVE NORMAL',
    'SOURCES CONFIRM HE HAS STILL NEVER FINISHED A SAMOSA',
    'IIT DELHI · CSE · AIR 23 · REFUSES TO BRING IT UP',
    'NOW BROADCASTING LIVE FROM VIETNAM',
    'COLLEAGUE, 23, INSISTS THE AGE GAP IS "NOT A REAL THING"',
    'LAST SEEN ONLINE AT 1:26 AM. AGAIN.',
    'BADMINTON COURT REPORTED UNDEFEATED IN HIS ABSENCE',
    'SALAD SUPPLIES IN THE OFFICE RUNNING DANGEROUSLY LOW',
    'HE SAYS HE IS "JUST FINISHING ONE THING"',

    /* these two are hints — they make the easter eggs findable.
       secret words: WATER · SLEEP · SAMOSA · 99 · 30
       (also: click the blinking red LIVE dot)                      */
    'VIEWERS ARE ADVISED TO TRY TYPING THE WORD "WATER"',
    'CERTAIN WORDS ARE KNOWN TO AFFECT THIS BROADCAST',
  ],
};
