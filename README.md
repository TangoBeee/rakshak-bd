# RAKSHAK TV

One screen. No scrolling. Five channels, a fake identity check, and five easter eggs.

---

## 1. Drop in your files

```
assets/
  song.mp3                  ← the Suno track
  videos/
    dance-1.mp4             ← 2–3 short clips of friends dancing
    dance-2.mp4
    dance-3.mp4
  photos/
    rakshak.jpg             ← boot screen
    water.jpg               ← CH 07
    late-night.jpg          ← CH 12
    sport-1.jpg             ← CH 23
    sport-2.jpg             ← CH 23
    vietnam.jpg             ← CH 30
```

Exact names don't matter — **`media.js` is the only file you edit.** Change the paths
there and you're done. Anything missing just shows a small "not found" note instead of
breaking, so you can host it half-finished and fill in the rest.

Videos: force-muted so his song stays the only audio. Vertical phone clips are fine —
they sit on a blurred copy of themselves. Keep them under ~10 MB each.

## 2. Host it

It's plain static files. No build step.

```bash
# Netlify — fastest
npx netlify-cli deploy --dir . --prod

# or Vercel
npx vercel --prod

# or GitHub Pages: push this folder, Settings → Pages → deploy from branch
```

Test locally first: `python3 -m http.server 8000` → http://localhost:8000

> Open it via a server, not by double-clicking `index.html` — some browsers block
> video/audio on `file://`.

---

## What's in it

**Boot** — TV colour bars behind a "I am Rakshak Satsangi" captcha. Ticking it runs a
verification (water intake 247%, sleep schedule: none found, rank on file: AIR 23,
age: 30 ⚠). There's an "I'm not Rakshak" link that sulks at you.

**CH 01 · DANCE FLOOR** — the clips, auto-advancing. Click the picture to skip.
**CH 07 · HYDRATION NETWORK** — a live hydration feed that keeps climbing past 247%.
**CH 12 · AFTER HOURS** — the clock rolls 11:48 PM → 3:03 AM. Still online.
**CH 23 · SPORTS DESK** — season 30 standings. Rest days: 0.
**CH 30 · BIRTHDAY SPECIAL** — the message. Edit it in `media.js`.

**Controls** — click a channel, or press `1`–`5`, the real channel numbers, `↑`/`↓`,
and `M` for music.

### Easter eggs

Type these anywhere once the TV is on:

| type | what happens |
|---|---|
| `water` | the screen floods. hydration override, 999%. |
| `sleep` | lights out, "attempting sleep…", then "no." |
| `samosa` | one flies in and gets stamped **DECLINED** |
| `99` | CH 99: NO SIGNAL — "he's in a meeting. try again at 1 AM." |
| `30` | cake |

Plus: **click the blinking red LIVE dot.**

Two ticker headlines hint that typed words do something, so he'll find them. Delete
those two lines in `media.js` if you'd rather he didn't.
