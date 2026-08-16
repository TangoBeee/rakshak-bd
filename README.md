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
age: 30 ⚠) and finishes by checking the visitor's country from their IP. There's an
"I'm not Rakshak" link that sulks at you.

### The gate 🔒

**Visitors in India are turned away; everyone else gets in.** Blocked visitors see
*THIS ONE IS FOR RAKSHAK ONLY — everything checked out except you.*

The page never mentions location. The last verification line reads
*matching you against the real Rakshak → MATCH / NO MATCH*, so it reads as though
the site simply knows who he is.

**The way in: type `rak`** anywhere on the boot screen. Works whether you've been
blocked already or haven't touched the checkbox yet. Not hinted at anywhere on the
page — hand it out to whoever should get in.

Both are in `media.js`:

```js
region: { block: ['IN'], bypass: 'rak' }
```

Add more country codes to `block` (`['IN','US']`) or change the secret word.
`block: []` opens it to everyone.

> If the IP lookup fails — API down, ad-blocker, no network — the check lets the
> visitor **in** rather than out. Being locked out of your own birthday page because
> a third-party API had a bad day would be worse than a stranger getting in.

**CH 01 · DANCE FLOOR** — each clip loops until *you* move on. Swipe/drag the picture
sideways, tap it, use `←` `→`, or hit a dot. An on-screen hint says so, and disappears
once you've changed clip for the first time. Nothing auto-advances.
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
| `badminton` | a birdie smashes across, stamped **UNRETURNABLE** |
| `salad` | 🥗 — SUPPLIES CRITICAL |
| `akto` | red alert, **PROD IS DOWN** … then "just kidding. happy birthday." |
| `iit` | **23** — "he didn't tell us. we found out." |
| `vietnam` | 🇻🇳 "you are already there." |
| `99` | CH 99: NO SIGNAL — "he's in a meeting. try again at 1 AM." |
| `30` | cake |

Plus two that aren't typed:

- **The Konami code** — `↑ ↑ ↓ ↓ ← → ← →` — 90 pieces of confetti and HAPPY BIRTHDAY.
  (The arrows still work the remote as you go; that's part of the fun.)
- **Click the blinking red LIVE dot** — "not actually live. filmed earlier. he was working."

Four ticker headlines hint that typed words and old arcade codes do something, so he'll
find them. Delete those lines in `media.js` if you'd rather he didn't.
