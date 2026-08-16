/* ══════════════════════════════════════════════════════════════════
   RAKSHAK TV — behaviour.  Nothing to edit here; content is media.js
   ══════════════════════════════════════════════════════════════════ */

(() => {
  'use strict';

  const $  = (s, r = document) => r.querySelector(s);
  const el = (id) => document.getElementById(id);
  const pad2 = (n) => String(n).padStart(2, '0');

  const P = MEDIA.photos;


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

  function showVideo(src) {
    pic.classList.remove('is-live');
    if (!src) { vid.classList.remove('is-live'); vidBlur.classList.remove('is-live'); return miss('no clip yet · drop one in assets/videos/'); }
    unmiss();
    [vid, vidBlur].forEach(v => { if (v.getAttribute('src') !== src) v.setAttribute('src', src); });
    vid.muted = vidBlur.muted = true;                 // the song is the only audio
    vid.classList.add('is-live'); vidBlur.classList.add('is-live');
    vid.play().catch(() => {}); vidBlur.play().catch(() => {});
  }

  function showPhoto(cfg) {
    vid.classList.remove('is-live'); vidBlur.classList.remove('is-live');
    vid.pause(); vidBlur.pause();
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

  /* ── CH 01 ── */
  let clipIdx = 0;
  function chDance() {
    const clips = (MEDIA.clips || []).filter(c => c && c.src);
    if (clipIdx >= clips.length) clipIdx = 0;

    const play = (i) => {
      clipIdx = i;
      showVideo(clips[i] ? clips[i].src : '');
      $('.w-dance__label').textContent = clips[i] ? clips[i].label.toUpperCase() : '—';
      [...widget.querySelectorAll('.w-dance__dots button')]
        .forEach((b, n) => b.classList.toggle('is-on', n === i));
    };

    widget.innerHTML = `
      <div class="w-dance">
        <p class="w-dance__cap">FRIENDS OF RAKSHAK <b>·</b> ALLEGEDLY DANCING <b>·</b>
          <b class="w-dance__label">—</b></p>
        <div class="w-dance__dots">${clips.map(() => '<button type="button"></button>').join('')}</div>
      </div>`;

    [...widget.querySelectorAll('.w-dance__dots button')]
      .forEach((b, n) => b.addEventListener('click', () => play(n)));

    play(clipIdx);
    if (clips.length > 1) every(() => play((clipIdx + 1) % clips.length), 12000);
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

  /* click the picture on CH 01 to skip to the next clip */
  screen.addEventListener('click', (e) => {
    if (current !== 0 || e.target.closest('.w-dance__dots')) return;
    const dots = widget.querySelectorAll('.w-dance__dots button');
    if (dots.length > 1) dots[(clipIdx + 1) % dots.length].click();
  });

  let live = false;                 /* true once the set is switched on */
  let buf = '';
  addEventListener('keydown', (e) => {
    if (!live) return;
    const k = e.key.toLowerCase();

    /* secret words first */
    buf = (buf + k).slice(-8);
    for (const word in EGGS) if (buf.endsWith(word)) { buf = ''; return EGGS[word](); }

    const n = CHANNELS.findIndex(c => c.num === '0' + k || c.num === k);
    if (n > -1) return tune(n);
    if (/^[1-5]$/.test(k))       return tune(+k - 1);
    if (k === 'arrowup')         { e.preventDefault(); return hop(-1); }
    if (k === 'arrowdown')       { e.preventDefault(); return hop(1); }
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
  };

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

  const audio = el('audio'), musicBtn = el('music');
  let hasSong = !!(MEDIA.song && MEDIA.song.src);

  if (hasSong) {
    audio.src = MEDIA.song.src;
    audio.volume = MEDIA.song.volume ?? 0.6;
    el('musicTitle').textContent = MEDIA.song.title || 'now playing';
    audio.addEventListener('error', () => {
      hasSong = false;
      el('musicTitle').textContent = 'no song file yet';
      musicBtn.classList.remove('is-playing');
    }, { once: true });
  } else {
    el('musicTitle').textContent = 'no song file yet';
  }

  function toggleMusic() {
    if (!hasSong) return;
    if (audio.paused) audio.play().then(() => musicBtn.classList.add('is-playing')).catch(() => {});
    else { audio.pause(); musicBtn.classList.remove('is-playing'); }
  }
  musicBtn.addEventListener('click', toggleMusic);


  /* ════ 9 · THE IDENTITY CHECK ═════════════════════════════════ */

  const CHECKS = [
    ['scanning facial structure',      'match 98.2%'],
    ['cross-referencing water intake', '247%'],
    ['searching for a sleep schedule', 'none found'],
    ['reviewing junk food history',    'clean'],
    ['verifying rank on file',         'AIR 23'],
    ['confirming age',                 '30', true],
  ];

  const box = el('capBox'), log = el('capLog'), go = el('capGo'), deny = el('capDeny');
  let checking = false;

  box.addEventListener('click', () => {
    if (checking || box.classList.contains('is-on')) return;
    checking = true;
    box.classList.add('is-busy');
    log.classList.add('is-open');

    CHECKS.forEach(([label, value, warn], i) => {
      setTimeout(() => {
        const li = document.createElement('li');
        if (warn) li.className = 'warn';
        li.innerHTML = `<b>${warn ? '!' : '✓'}</b><span>${label} <em>${value}</em></span>`;
        log.appendChild(li);
      }, 260 + i * 300);
    });

    setTimeout(() => {
      box.classList.remove('is-busy');
      box.classList.add('is-on');
      box.setAttribute('aria-checked', 'true');
      const li = document.createElement('li');
      li.className = 'done';
      li.innerHTML = `<b>✓</b><span>IDENTITY CONFIRMED — WELCOME BACK, RAKSHAK</span>`;
      log.appendChild(li);
      go.hidden = false;
      go.focus();
    }, 260 + CHECKS.length * 300 + 260);
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
    if (hasSong) audio.play().then(() => musicBtn.classList.add('is-playing')).catch(() => {});
    tune(0);
  });


  addEventListener('resize', () => { if (cv.classList.contains('is-on')) noise(); });
})();
