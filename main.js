/* ══════════════════════════════════════════════════════════════════
   RAKSHAK TV — behaviour.  Nothing to edit here; content is media.js
   ══════════════════════════════════════════════════════════════════ */

(() => {
  'use strict';

  const $  = (s, r = document) => r.querySelector(s);
  const el = (id) => document.getElementById(id);
  const pad2 = (n) => String(n).padStart(2, '0');

  const P = MEDIA.photos;

  /* ── song ducking ─────────────────────────────────────────────
     Ramps the background song down while a clip with its own audio
     plays, and back up afterwards. Declared early because the stage
     calls it before the music section runs.                        */
  const FULL_VOL = MEDIA.volume ?? 0.6;
  const DUCK_VOL = MEDIA.duckVolume ?? 0.08;
  let duckTimer = null, ducked = false;

  /* the song gets a head start before the first clip moves */
  const LEAD_IN = MEDIA.leadIn ?? 2000;
  let songStartedAt = 0, introDone = false, introTimer = null;

  function leadInLeft() {
    if (introDone || !songStartedAt) return 0;
    const left = Math.max(0, songStartedAt + LEAD_IN - performance.now());
    if (!left) introDone = true;
    return left;
  }

  function duck(on) {
    if (on === ducked) return;
    ducked = on;
    const a = el('audio');
    const to = on ? DUCK_VOL : FULL_VOL;
    const from = a.volume;
    clearInterval(duckTimer);
    let i = 0, steps = 18;
    duckTimer = setInterval(() => {
      i++;
      a.volume = Math.min(1, Math.max(0, from + (to - from) * (i / steps)));
      if (i >= steps) clearInterval(duckTimer);
    }, 22);
  }


  /* ════ 1 · CHANNELS ═══════════════════════════════════════════ */

  const CHANNELS = [
    { num: '01', name: 'DANCE FLOOR',       cc: '--pink',  mood: 'live',  media: 'clips',      build: chDance },
    { num: '07', name: 'HYDRATION NETWORK', cc: '--blue',  mood: 'quiet', media: P.hydration,  build: chHydro },
    { num: '12', name: 'AFTER HOURS',       cc: '--green', mood: 'dark',  media: P.afterhours, build: chNight },
    { num: '23', name: 'SPORTS DESK',       cc: '--amber', mood: 'quiet', media: P.sports,     build: chSport },
    { num: '30', name: 'BIRTHDAY SPECIAL',  cc: '--red',   mood: 'quiet', media: P.birthday,   build: chBday  },
  ];

  let current = -1;
  let timers = [];
  const every = (fn, ms) => timers.push(setInterval(fn, ms));
  const after = (fn, ms) => timers.push(setTimeout(fn, ms));
  const clearTimers = () => { timers.forEach(t => { clearInterval(t); clearTimeout(t); }); timers = []; };


  /* ════ 2 · STAGE (video / photo layers) ═══════════════════════ */

  const stage   = el('stage');
  const vid     = el('vid');
  const vidBlur = el('vidBlur');
  const pic     = el('pic');
  const screen  = el('screen');

  function miss(text) {
    let m = $('.stage__miss', stage);
    if (!m) { m = document.createElement('div'); m.className = 'stage__miss'; stage.appendChild(m); }
    m.textContent = text;
    m.style.display = '';
  }
  const unmiss = () => { const m = $('.stage__miss', stage); if (m) m.style.display = 'none'; };

  function showVideo(clip) {
    const src = clip && clip.src;
    pic.classList.remove('is-live');
    if (!src) {
      vid.classList.remove('is-live'); vidBlur.classList.remove('is-live');
      duck(false);
      return miss('no clip yet · drop one in assets/videos/');
    }
    unmiss();
    [vid, vidBlur].forEach(v => { if (v.getAttribute('src') !== src) v.setAttribute('src', src); });

    /* the blurred backdrop is a second copy of the same file — always silent,
       or you'd hear the clip twice, slightly out of sync */
    vidBlur.muted = true;

    const wantSound = !!clip.sound;
    vid.muted  = !wantSound;
    vid.volume = clip.volume ?? 1;

    vid.classList.add('is-live'); vidBlur.classList.add('is-live');

    const start = () => {
      duck(wantSound);
      vidBlur.play().catch(() => {});
      vid.play().catch(() => {
        /* browser refused to autoplay with sound — fall back to silent */
        vid.muted = true; duck(false); vid.play().catch(() => {});
      });
    };

    /* let the song have the room to itself for a beat first */
    const wait = leadInLeft();
    clearTimeout(introTimer);
    if (wait) {
      vid.pause(); vidBlur.pause();
      try { vid.currentTime = 0; } catch {}       // hold on the first frame
      introTimer = setTimeout(() => { introDone = true; start(); }, wait);
    } else {
      start();
    }
  }

  function showPhoto(cfg) {
    clearTimeout(introTimer);        /* cancel any pending clip start */
    vid.classList.remove('is-live'); vidBlur.classList.remove('is-live');
    vid.pause(); vidBlur.pause();
    duck(false);
    if (!cfg || !cfg.src) { pic.classList.remove('is-live'); return miss('photo slot empty · see media.js'); }
    const probe = new Image();
    probe.onload  = () => { unmiss(); pic.style.backgroundImage = `url("${cfg.src}")`;
                            pic.style.backgroundPosition = cfg.focus || 'center';
                            pic.classList.add('is-live'); };
    probe.onerror = () => { pic.classList.remove('is-live'); miss(cfg.src + ' not found'); };
    probe.src = cfg.src;
  }

  /* two sports photos, gently swapping */
  function showPhotoSet(list) {
    const shots = (list || []).filter(p => p && p.src);
    if (!shots.length) return showPhoto(null);
    let i = 0;
    showPhoto(shots[0]);
    if (shots.length < 2) return;
    every(() => {
      i = (i + 1) % shots.length;
      pic.classList.remove('is-live');
      after(() => showPhoto(shots[i]), 420);
    }, 5200);
  }


  /* ════ 3 · STATIC BURST ═══════════════════════════════════════ */

  const cv = el('static'), cx = cv.getContext('2d', { willReadFrequently: false });

  function noise() {
    const w = cv.width = Math.ceil(screen.clientWidth / 3);
    const h = cv.height = Math.ceil(screen.clientHeight / 3);
    const d = cx.createImageData(w, h);
    for (let i = 0; i < d.data.length; i += 4) {
      const v = (Math.random() * 255) | 0;
      d.data[i] = d.data[i + 1] = d.data[i + 2] = v;
      d.data[i + 3] = 255;
    }
    cx.putImageData(d, 0, 0);
  }

  function burst(then) {
    noise();
    cv.classList.add('is-on');
    setTimeout(noise, 70);
    setTimeout(() => { noise(); then && then(); }, 140);
    setTimeout(() => cv.classList.remove('is-on'), 300);
  }


  /* ════ 4 · WIDGETS ════════════════════════════════════════════ */

  const widget = el('widget');
  const rows = (list) => list.map(([k, v, hi]) =>
    `<div class="row${hi ? ' hi' : ''}"><span>${k}</span><b>${v}</b></div>`).join('');

  /* ── CH 01 ──
     No auto-advance: each clip loops until the viewer slides to another. */
  let clipIdx = 0, dancePlay = null, clipCount = 0, hintUsed = false;

  function chDance() {
    const clips = (MEDIA.clips || []).filter(c => c && c.src);
    if (clipIdx >= clips.length) clipIdx = 0;
    clipCount = clips.length;

    const play = (i) => {
      clipIdx = i;
      showVideo(clips[i]);
      $('.w-dance__label').textContent = clips[i]
        ? clips[i].label.toUpperCase() + (clips[i].sound ? ' 🔊' : '')
        : '—';
      [...widget.querySelectorAll('.w-dance__dots button')]
        .forEach((b, n) => b.classList.toggle('is-on', n === i));
    };

    widget.innerHTML = `
      <div class="w-dance">
        <p class="w-dance__cap">FRIENDS OF RAKSHAK <b>·</b> ALLEGEDLY DANCING <b>·</b>
          <b class="w-dance__label">—</b></p>
        <div class="w-dance__dots">${clips.map(() => '<button type="button"></button>').join('')}</div>
        ${clips.length > 1
          ? `<p class="w-dance__hint${hintUsed ? ' is-gone' : ''}">
               <i>◀</i> slide for the next clip <i>▶</i></p>`
          : ''}
      </div>`;

    [...widget.querySelectorAll('.w-dance__dots button')]
      .forEach((b, n) => b.addEventListener('click', () => { play(n); usedHint(); }));

    dancePlay = play;
    play(clipIdx);
  }

  function usedHint() {
    hintUsed = true;
    const h = $('.w-dance__hint', widget);
    if (h) h.classList.add('is-gone');
  }

  /* slide left/right to change clip */
  function slideClip(dir) {
    if (current !== 0 || !dancePlay || clipCount < 2) return;
    dancePlay((clipIdx + dir + clipCount) % clipCount);
    usedHint();
  }

  /* ── CH 07 ── */
  function chHydro() {
    showPhoto(CHANNELS[1].media);
    let pct = 247, bottles = 11, mins = 4;

    widget.innerHTML = `
      <div class="w-hydro">
        <p class="k">LIVE HYDRATION FEED <span style="opacity:.5">·</span> SUBJECT: R. SATSANGI</p>
        <p class="big w-hydro__num"><span id="hyNum">247</span><sup>%</sup></p>
        <div class="w-hydro__bar"><i id="hyBar" style="width:100%"></i><u></u></div>
        <p class="k">DAILY TARGET CLEARED AT 09:14 AM</p>
        <div class="w-hydro__rows">${rows([
          ['BOTTLES TODAY',        '<span id="hyBot">11</span>'],
          ['LAST REFILL',          '<span id="hyMin">4</span> MIN AGO'],
          ['JUNK FOOD DETECTED',   'NONE'],
          ['STATUS',               'STILL THIRSTY', true],
        ])}</div>
      </div>`;

    every(() => {
      pct += 1 + ((Math.random() * 2) | 0);
      el('hyNum').textContent = pct;
      el('hyBar').style.width = Math.min(100, 40 + pct / 8) + '%';
      if (pct % 7 < 2) el('hyBot').textContent = ++bottles;
      el('hyMin').textContent = (mins = mins > 1 ? mins - 1 : 9);
    }, 1900);
  }

  /* ── CH 12 ── */
  const NIGHT = ['11:48 PM', '12:37 AM', '1:26 AM', '2:14 AM', '3:03 AM'];
  function chNight() {
    showPhoto(CHANNELS[2].media);
    let i = 0, h = 3, m = 12;

    widget.innerHTML = `
      <div class="w-night">
        <p class="k">AFTER HOURS <span style="opacity:.5">·</span> UNSCHEDULED PROGRAMMING</p>
        <p class="big w-night__time" id="ngTime">${NIGHT[0]}</p>
        <p class="w-night__on"><i></i>STILL ONLINE</p>
        <div class="w-night__why">${rows([
          ['REASON GIVEN',            '&ldquo;ONE THING&rdquo;'],
          ['TIME SINCE ONE THING',    '<span id="ngEl">3H 12M</span>'],
          ['SLEEP',                   'PENDING', true],
        ])}</div>
      </div>`;

    every(() => {
      i = (i + 1) % NIGHT.length;
      const t = el('ngTime');
      t.style.opacity = 0;
      after(() => { t.textContent = NIGHT[i]; t.style.opacity = 1; }, 220);
      if (++m > 59) { m = 0; h++; }
      el('ngEl').textContent = `${h}H ${pad2(m)}M`;
    }, 2800);
  }

  /* ── CH 23 ── */
  function chSport() {
    showPhotoSet(CHANNELS[3].media);
    let km = 12.4;

    widget.innerHTML = `
      <div class="w-sport">
        <p class="k">SPORTS DESK <span style="opacity:.5">·</span> SEASON 30 STANDINGS</p>
        <div class="w-sport__grid">${rows([
          ['BADMINTON',  'W 47 &nbsp;·&nbsp; L 3'],
          ['CHESS',      'W 31 &nbsp;·&nbsp; L 12'],
          ['RUNNING',    '<span id="spKm">12.4</span> KM THIS WEEK'],
          ['SWIMMING',   '&ldquo;JUST A FEW LAPS&rdquo;'],
          ['REST DAYS',  '0', true],
        ])}</div>
      </div>`;

    every(() => { km += 0.1; el('spKm').textContent = km.toFixed(1); }, 2600);
  }

  /* ── CH 30 ── */
  function chBday() {
    showPhoto(CHANNELS[4].media);
    const body = (MEDIA.message || [])
      .map(l => l ? `<div>${l}</div>` : '<div class="gap"></div>').join('');

    widget.innerHTML = `
      <div class="w-bday">
        <p class="k">CHANNEL 30 <span style="opacity:.5">·</span> SPECIAL BROADCAST</p>
        <p class="big w-bday__num">THIRTY.</p>
        <div class="w-bday__msg">${body}</div>
        <p class="w-bday__sign">17.08.2026 &nbsp;·&nbsp; VIETNAM &nbsp;·&nbsp; HAPPY BIRTHDAY, RAKSHAK</p>
      </div>`;
  }


  /* ════ 5 · TUNING ═════════════════════════════════════════════ */

  function tune(i, quiet) {
    if (i === current) return;
    current = i;
    const ch = CHANNELS[i];

    clearTimers();
    dancePlay = null;                    /* only CH 01 is slideable */
    screen.style.setProperty('--accent', `var(${ch.cc})`);
    screen.dataset.mood = ch.mood;
    el('bugNum').textContent  = ch.num;
    el('bugName').textContent = ch.name;

    [...el('chans').children].forEach((b, n) => b.classList.toggle('is-on', n === i));

    const paint = () => { widget.innerHTML = ''; ch.build(); };
    quiet ? paint() : burst(paint);
  }

  const hop = (d) => tune((current + d + CHANNELS.length) % CHANNELS.length);


  /* ════ 6 · REMOTE + KEYS ══════════════════════════════════════ */

  el('chans').innerHTML = CHANNELS.map((c, i) => `
    <button class="chan" type="button" style="--cc:var(${c.cc})" data-i="${i}">
      <b>${c.num}</b><span>${c.name}</span>
    </button>`).join('');

  el('chans').addEventListener('click', (e) => {
    const b = e.target.closest('.chan');
    if (b) tune(+b.dataset.i);
  });

  /* ── drag / swipe the picture on CH 01 to change clip ─────────── */
  {
    let down = false, x0 = 0, y0 = 0, dx = 0, sideways = false;

    const settle = () => {
      stage.style.transition = 'transform .34s var(--ease, cubic-bezier(.2,.8,.2,1))';
      stage.style.transform  = '';
      setTimeout(() => { stage.style.transition = ''; }, 360);
    };

    screen.addEventListener('pointerdown', (e) => {
      if (current !== 0 || e.target.closest('.w-dance__dots, .ticker, .brand')) return;
      down = true; sideways = false;
      x0 = e.clientX; y0 = e.clientY; dx = 0;
      stage.style.transition = '';
      screen.setPointerCapture?.(e.pointerId);
    });

    screen.addEventListener('pointermove', (e) => {
      if (!down) return;
      const mx = e.clientX - x0, my = e.clientY - y0;
      if (!sideways && Math.abs(mx) < 8 && Math.abs(my) < 8) return;
      if (!sideways) sideways = Math.abs(mx) > Math.abs(my);   // decide once
      if (!sideways) return;
      dx = mx;
      stage.style.transform = `translateX(${(mx * 0.34).toFixed(1)}px)`;
    });

    const release = () => {
      if (!down) return;
      down = false;
      settle();
      if (Math.abs(dx) > 55)      slideClip(dx < 0 ? 1 : -1);   // swipe
      else if (Math.abs(dx) < 8)  slideClip(1);                 // plain tap
      dx = 0;
    };

    screen.addEventListener('pointerup', release);
    screen.addEventListener('pointercancel', () => { down = false; dx = 0; settle(); });
    screen.addEventListener('pointerleave', release);
  }

  let live = false;                 /* true once the set is switched on */
  let buf = '';
  addEventListener('keydown', (e) => {
    if (!live) return;
    const k = e.key.toLowerCase();

    /* the Konami code, tracked separately since arrows also drive the remote */
    if (k.startsWith('arrow')) {
      kbuf = [...kbuf, k].slice(-KONAMI.length);
      if (kbuf.join() === KONAMI.join()) { kbuf = []; confetti(); return; }
    } else {
      kbuf = [];
    }

    /* secret words */
    buf = (buf + k).slice(-20);
    for (const word in EGGS) if (buf.endsWith(word)) { buf = ''; return EGGS[word](); }

    const n = CHANNELS.findIndex(c => c.num === '0' + k || c.num === k);
    if (n > -1) return tune(n);
    if (/^[1-5]$/.test(k))       return tune(+k - 1);
    if (k === 'arrowup')         { e.preventDefault(); return hop(-1); }
    if (k === 'arrowdown')       { e.preventDefault(); return hop(1); }
    if (k === 'arrowright')      { e.preventDefault(); return slideClip(1); }
    if (k === 'arrowleft')       { e.preventDefault(); return slideClip(-1); }
    if (k === 'm')               return toggleMusic();
  });


  /* ════ 6b · EASTER EGGS ═══════════════════════════════════════ */

  const egg = el('egg');
  let eggBusy = false;

  function stage_egg(html, ms, cls) {
    if (eggBusy) return;
    eggBusy = true;
    egg.className = 'egg is-on ' + (cls || '');
    egg.innerHTML = html;
    setTimeout(() => { egg.classList.remove('is-on'); eggBusy = false; }, ms);
  }

  const EGGS = {

    /* type WATER — the screen floods */
    water: () => stage_egg(`
      <div class="egg__flood"></div>
      <div class="egg__mid">
        <p class="k">HYDRATION OVERRIDE</p>
        <p class="big" style="color:var(--blue)">999<sup style="font-size:.3em">%</sup></p>
        <p class="k">PLEASE STOP</p>
      </div>`, 4200, 'egg--water'),

    /* type SLEEP — a brief, doomed attempt */
    sleep: () => {
      stage_egg(`<div class="egg__mid"><p class="egg__type" id="eggT">attempting sleep…</p></div>`, 4000, 'egg--sleep');
      setTimeout(() => { const t = el('eggT'); if (t) t.textContent = 'no.'; }, 2100);
    },

    /* type SAMOSA — politely declined */
    samosa: () => stage_egg(`
      <div class="egg__fly">🥟</div>
      <div class="egg__stamp">DECLINED</div>`, 3000, 'egg--samosa'),

    /* type 99 — the channel that isn't on the remote */
    99: () => stage_egg(`
      <div class="egg__mid">
        <p class="big" style="font-size:clamp(3rem,10vw,7rem)">CH 99</p>
        <p class="k" style="margin-top:1.4em">NO SIGNAL</p>
        <p class="k" style="margin-top:.7em;color:var(--white)">he's in a meeting. try again at 1 AM.</p>
      </div>`, 3600, 'egg--dead'),

    /* type 30 — obviously */
    30: () => stage_egg(`
      <div class="egg__mid"><p class="egg__cake">🎂</p></div>`, 2600, 'egg--cake'),

    /* type BADMINTON — unreturnable */
    badminton: () => stage_egg(`
      <div class="egg__birdie">🏸</div>
      <div class="egg__stamp">UNRETURNABLE</div>`, 3200, 'egg--samosa'),

    /* type AKTO — the work-buddy heart attack */
    akto: () => {
      stage_egg(`<div class="egg__mid">
          <p class="k" style="color:var(--red)">● INCIDENT</p>
          <p class="big" id="eggA" style="font-size:clamp(2rem,7vw,4.6rem);color:var(--red)">PROD IS DOWN</p>
        </div>`, 4600, 'egg--dead');
      setTimeout(() => {
        const a = el('eggA');
        if (!a) return;
        a.style.color = 'var(--green)';
        a.style.fontSize = 'clamp(1.6rem,5vw,3.4rem)';
        a.textContent = 'just kidding. happy birthday.';
      }, 2200);
    },

    /* type IIT — the thing he never mentions */
    iit: () => stage_egg(`
      <div class="egg__mid">
        <p class="k">JEE ADVANCED · ALL INDIA RANK</p>
        <p class="big" style="color:var(--amber)">23</p>
        <p class="k" style="color:var(--white)">he didn't tell us. we found out.</p>
      </div>`, 3600, 'egg--dead'),

    /* type VIETNAM — only funny for one person */
    vietnam: () => stage_egg(`
      <div class="egg__mid">
        <p class="egg__cake" style="font-size:clamp(60px,16vw,150px)">🇻🇳</p>
        <p class="k" style="color:var(--white);font-size:clamp(12px,2.2vw,17px)">you are already there.</p>
      </div>`, 3200, 'egg--dead'),

    /* type SALAD — the office supply crisis */
    salad: () => stage_egg(`
      <div class="egg__mid">
        <p class="egg__cake">🥗</p>
        <p class="k" style="color:var(--green)">SUPPLIES CRITICAL</p>
      </div>`, 2800, 'egg--cake'),
  };

  /* ── the Konami code — ↑↑↓↓←→←→ ── */
  const KONAMI = ['arrowup','arrowup','arrowdown','arrowdown','arrowleft','arrowright','arrowleft','arrowright'];
  let kbuf = [];

  function confetti() {
    const colours = ['var(--pink)', 'var(--blue)', 'var(--amber)', 'var(--green)', 'var(--red)', '#fff'];
    let bits = '';
    for (let i = 0; i < 90; i++) {
      bits += `<i style="left:${(Math.random() * 100).toFixed(1)}%;` +
              `background:${colours[i % colours.length]};` +
              `animation-duration:${(2.2 + Math.random() * 2.2).toFixed(2)}s;` +
              `animation-delay:${(Math.random() * 0.9).toFixed(2)}s"></i>`;
    }
    stage_egg(`<div class="egg__confetti">${bits}</div>
      <div class="egg__mid">
        <p class="big" style="font-size:clamp(2rem,7.5vw,5.4rem)">HAPPY BIRTHDAY</p>
        <p class="k" style="color:var(--white)">RAKSHAK <span style="opacity:.5">·</span> 30</p>
      </div>`, 5400, 'egg--party');
  }

  /* click the LIVE dot */
  $('.rec').addEventListener('click', (e) => {
    e.stopPropagation();
    stage_egg(`<div class="egg__mid"><p class="k" style="color:var(--white);font-size:clamp(12px,2vw,16px)">
      not actually live.<br><br>filmed earlier.<br><br>he was working.</p></div>`, 3200, 'egg--dead');
  });


  /* ════ 7 · TICKER ═════════════════════════════════════════════ */

  {
    const items = (MEDIA.ticker || []).map(t => `<span>${t}</span><b>◆</b>`).join('');
    el('ticker').innerHTML = items + items;      // doubled → seamless loop
  }


  /* ════ 8 · MUSIC ══════════════════════════════════════════════ */

  const audio = el('audio'), musicBtn = el('music'), swapBtn = el('swap');
  const SONGS = (MEDIA.songs || []).filter(s => s && s.src);
  let songIdx = 0, badSongs = 0;
  let hasSong = SONGS.length > 0;

  audio.volume = MEDIA.volume ?? 0.6;
  if (SONGS.length < 2) swapBtn.hidden = true;

  function loadSong(i, play) {
    songIdx = (i + SONGS.length) % SONGS.length;
    const s = SONGS[songIdx];
    audio.src = encodeURI(s.src);          /* filenames may have spaces */
    el('musicTitle').textContent = s.title || 'now playing';
    if (play) audio.play()
      .then(() => { badSongs = 0; musicBtn.classList.add('is-playing'); })
      .catch(() => {});
  }

  if (hasSong) {
    loadSong(0, false);

    /* one song ends → the next one starts; wraps back round for ever */
    audio.addEventListener('ended', () => { badSongs = 0; loadSong(songIdx + 1, true); });

    /* a missing/broken file shouldn't stop the music — skip to the next,
       unless every single one is broken */
    audio.addEventListener('error', () => {
      if (++badSongs >= SONGS.length) {
        el('musicTitle').textContent = 'song not found';
        musicBtn.classList.remove('is-playing');
        return;
      }
      loadSong(songIdx + 1, true);
    });
  } else {
    el('musicTitle').textContent = 'no song file yet';
    swapBtn.hidden = true;
  }

  function toggleMusic() {
    if (!hasSong) return;
    if (audio.paused) audio.play().then(() => musicBtn.classList.add('is-playing')).catch(() => {});
    else { audio.pause(); musicBtn.classList.remove('is-playing'); }
  }
  musicBtn.addEventListener('click', toggleMusic);

  /* ⇄ — next track, keeps playing if it already was */
  swapBtn.addEventListener('click', () => {
    if (!hasSong) return;
    loadSong(songIdx + 1, !audio.paused || musicBtn.classList.contains('is-playing'));
    swapBtn.classList.add('is-spun');
    setTimeout(() => swapBtn.classList.remove('is-spun'), 400);
  });


  /* ════ 9 · THE IDENTITY CHECK ═════════════════════════════════ */

  const CHECKS = [
    ['scanning facial structure',      'match 98.2%'],
    ['cross-referencing water intake', '247%'],
    ['searching for a sleep schedule', 'none found'],
    ['reviewing junk food history',    'clean'],
    ['verifying rank on file',         'AIR 23'],
    ['confirming age',                 '30', true],
  ];

  const box = el('capBox'), log = el('capLog'), go = el('capGo'),
        deny = el('capDeny'), block = el('capBlock');
  let checking = false, blocked = false, bypassed = false;

  const REG    = MEDIA.region || {};
  const BLOCK  = (REG.block || ['IN']).map(s => String(s).toUpperCase());
  const SECRET = String(REG.bypass || 'rak').toLowerCase();
  const napi   = (ms) => new Promise(r => setTimeout(r, ms));

  /* Where is this person? Tried in order; first one that answers wins.
     All three are keyless, HTTPS, CORS-enabled. */
  async function locate() {
    const sources = [
      ['https://api.country.is/',  d => d.country],
      ['https://ipwho.is/',        d => d.country_code],
      ['https://ipapi.co/json/',   d => d.country_code],
    ];
    for (const [url, pick] of sources) {
      try {
        const stop = new AbortController();
        const t = setTimeout(() => stop.abort(), 4500);
        const res = await fetch(url, { signal: stop.signal, cache: 'no-store' });
        clearTimeout(t);
        if (!res.ok) continue;
        const code = pick(await res.json());
        if (code) return String(code).toUpperCase();
      } catch { /* try the next one */ }
    }
    return null;              // couldn't tell — see the fail-open note below
  }

  /* start looking straight away so it's ready when the checks finish */
  const located = locate();

  function line(mark, label, value, cls) {
    const li = document.createElement('li');
    if (cls) li.className = cls;
    li.innerHTML = `<b>${mark}</b><span>${label}${value ? ` <em>${value}</em>` : ''}</span>`;
    log.appendChild(li);
    return li;
  }

  function allowIn() {
    blocked = false;
    block.hidden = true;
    box.classList.remove('is-busy', 'is-fail');
    box.classList.add('is-on');
    box.setAttribute('aria-checked', 'true');
    go.hidden = false;
    go.focus();
  }

  async function runCheck() {
    checking = true;
    box.classList.add('is-busy');
    log.classList.add('is-open');

    for (const [label, value, warn] of CHECKS) {
      await napi(300);
      line(warn ? '!' : '✓', label, value, warn ? 'warn' : '');
    }

    await napi(300);
    /* Deliberately says nothing about how this is decided — as far as the
       visitor is concerned, the page simply knows who Rakshak is. */
    const sig = line('◦', 'matching you against the real Rakshak', 'one moment…', 'pend');
    const cc  = bypassed ? null : await located;
    await napi(600);

    /* Fail-open on purpose: if the lookup is blocked or offline we let them
       through rather than lock Rakshak out of his own birthday. */
    const ok = bypassed || !cc || !BLOCK.includes(cc);

    sig.className = ok ? '' : 'fail';
    sig.innerHTML = `<b>${ok ? '✓' : '✕'}</b><span>matching you against the real Rakshak ` +
                    `<em>${ok ? 'MATCH' : 'NO MATCH'}</em></span>`;

    await napi(320);

    if (ok) {
      line('✓', 'IDENTITY CONFIRMED — WELCOME BACK, RAKSHAK', '', 'done');
      allowIn();
    } else {
      blocked = true;
      box.classList.remove('is-busy');
      box.classList.add('is-fail');
      line('✕', 'YOU ARE NOT RAKSHAK', '', 'fail done');
      block.hidden = false;
    }
    checking = false;
  }

  box.addEventListener('click', () => {
    if (checking || box.classList.contains('is-on')) return;
    runCheck();
  });

  /* ── the hack: type the secret word anywhere on the boot screen ── */
  let secretBuf = '';
  addEventListener('keydown', (e) => {
    if (live || bypassed) return;
    if (e.key.length !== 1) return;
    secretBuf = (secretBuf + e.key.toLowerCase()).slice(-12);
    if (!secretBuf.includes(SECRET)) return;

    secretBuf = '';
    bypassed  = true;

    if (blocked) {                       // already turned away → let them in
      line('✓', 'MANUAL OVERRIDE ACCEPTED', '', 'done');
      allowIn();
    } else if (!checking && !box.classList.contains('is-on')) {
      runCheck();                        // not started → run it, pre-approved
    }
    /* mid-check: the region step reads `bypassed` when it gets there */
  });

  let denies = 0;
  deny.addEventListener('click', () => {
    denies++;
    deny.classList.add('is-sulking');
    if (denies === 1) {
      deny.textContent = "Then this isn't for you.";
      setTimeout(() => {
        deny.classList.remove('is-sulking');
        deny.textContent = '…fine. you can watch too.';
      }, 1600);
    } else {
      deny.textContent = 'nice try, Rakshak.';
    }
  });

  go.addEventListener('click', () => {
    live = true;
    el('boot').classList.add('is-off');
    el('tv').classList.add('is-on');
    el('tv').setAttribute('aria-hidden', 'false');
    setTimeout(() => el('boot').remove(), 600);

    if (hasSong) {
      /* stamped synchronously so the first clip knows to wait for the song */
      songStartedAt = performance.now();
      audio.play()
        .then(()  => musicBtn.classList.add('is-playing'))
        .catch(() => { introDone = true; });   /* no song → don't hold the clip */
    } else {
      introDone = true;
    }
    tune(0);
  });


  addEventListener('resize', () => { if (cv.classList.contains('is-on')) noise(); });
})();
