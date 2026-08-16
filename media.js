/* ══════════════════════════════════════════════════════════════════
   RAKSHAK TV — the only file you need to edit.

   Drop files into  assets/  then point the paths below at them.
   Anything you leave as ''  is skipped, and the channel still works.
   ══════════════════════════════════════════════════════════════════ */

const MEDIA = {

  /* ── the songs ─────────────────────────────────────────────────
     The first one plays on turn-on. When it ends the next starts,
     and after the last it wraps back to the first — round and round.
     A small ⇄ button next to the title skips ahead by hand.        */
  songs: [
    { src: 'assets/song-1.mp3', title: 'Just Another Day' },
    { src: 'assets/song-2.mp3', title: 'Just Another Day · take 2' },
  ],
  volume:     0.6,   // normal background level
  duckVolume: 0.25,  // level while a clip with its own sound plays —
                     // low enough to hear the clip, loud enough that the
                     // song is still clearly there underneath
  leadIn:     2000,  // ms the song plays alone before the first clip starts


  /* ── who gets in ───────────────────────────────────────────────
     The boot check quietly resolves the visitor's country and turns
     away anyone in `block`. Everyone else is let through. Nothing on
     the page says so — to a visitor it just looks like the site
     knows who Rakshak is.

     `bypass` is the secret word: type it anywhere on the boot
     screen and it opens regardless, blocked or not.

     If the lookup fails or is blocked, the check lets the visitor
     IN rather than out — better than locking Rakshak out of his
     own birthday because an API was down.

     Heads up: this repo is public, so anyone who opens the source
     can find both the country list and the word.                   */
  region: {
    block:  ['IN'],   // these are turned away; everywhere else gets in
    bypass: 'rak',
  },


  /* ── CH 01 · dance clips ───────────────────────────────────────
     2–3 short clips is perfect. Vertical phone videos are fine —
     they're letterboxed against a blurred copy of themselves.
     Add or remove entries freely; the dots at the bottom follow.

     Add  sound: true  to a clip whose own audio matters — the song ducks
     down to `duckVolume` while it plays, then comes back up. Clips without
     it stay silent and the song keeps playing at its normal level.  */
  clips: [
    { src: 'assets/videos/dance-1.mp4', label: 'exhibit A' },
    { src: 'assets/videos/dance-2.mp4', label: 'exhibit B', sound: true },
    { src: 'assets/videos/dance-3.mp4', label: 'exhibit C', sound: true },
  ],



  /* ── photos ────────────────────────────────────────────────────
     Six slots. Any aspect ratio works — they're cropped to fill,
     so use `focus` to keep his face in frame.
     Set src to '' and that channel falls back to a clean colour.   */
  photos: {

    /* boot screen — the clean portrait (with the bird) */
    testcard:  { src: 'assets/photos/rakshak.jpg',    focus: '50% 42%' },

    /* CH 07 — the portrait again; this channel is mostly the readout */
    hydration: { src: 'assets/photos/rakshak.jpg',    focus: '50% 42%' },

    /* CH 12 — feet on the desk, garland on, laptop still open */
    afterhours:{ src: 'assets/photos/late-night.jpg', focus: '38% 50%' },

    /* CH 23 — the fist raise. reads as a win. */
    sports:  [ { src: 'assets/photos/victory.jpg',    focus: '46% 28%' } ],

    /* CH 30 — Goa, cap, cash, Big Daddy Casino */
    birthday:  { src: 'assets/photos/goa.jpg',        focus: '54% 38%' },
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

    /* these are hints — they make the easter eggs findable.
       typed words:  WATER · SLEEP · SAMOSA · BADMINTON · SALAD
                     AKTO · IIT · VIETNAM · 99 · 30
       also:         the Konami code (↑↑↓↓←→←→)
                     clicking the blinking red LIVE dot             */
    'VIEWERS ARE ADVISED TO TRY TYPING THE WORD "WATER"',
    'CERTAIN WORDS ARE KNOWN TO AFFECT THIS BROADCAST',
    'TYPE WHAT HE LIKES. TYPE WHAT HE AVOIDS. SEE WHAT HAPPENS.',
    'OLD ARCADE CHEAT CODES REPORTEDLY STILL WORK HERE',
  ],
};
