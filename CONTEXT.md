# CONTEXT — Mystery of Missing Pages Ebook

## Last updated: 2026-05-07

---

## Project Overview

A single-page interactive flipbook ebook (`ebook.html`) built with **turn.js**. Two-page landscape spread (820×472px). 15 spreads total (0–14). Alternates between video pages and quiz interaction pages.

**Ebook title:** "The Mystery of Missing Pages" (also subtitled "Maale & Gopu's Big Adventure")  
**Main file:** `/Users/karan/StorylineSample/story/ebook.html` (~6970 lines)

---

## Directory Structure

```
story/
├── ebook.html              ← ONLY file to edit
├── CONTEXT.md              ← this file
├── audio/
│   ├── Quirky_Podcast_Jingle.mp3  ← background loop music
│   ├── poem1.mp3 … poem7.mp3      ← plays at 72% of each video clip
│   ├── q1.mp3… q7.mp3            ← quiz narration audio
│   └── oops!wrong .mp3            ← NOTE: space before .mp3 in filename
├── video/
│   └── page1-clip.mp4 … page7-clip.mp4   ← one per video spread
└── .vscode/assets/
    ├── q1Mainbg.png   … q7Mainbg.png     ← quiz background (includes character + doors)
    ├── q1Option1.png  … q7Option1.png     ← left thought-bubble image (cloud shape)
    ├── q1Option2.png  … q7Option2.png     ← right thought-bubble image (cloud shape)
    ├── q1CorrectOption.png … q7CorrectOption.png
    ├── q1IncorrectOption.png … q7IncorrectOption.png
    ├── q1wrongbg.png                      ← Q1-only: bg image for wrong state
    └── q1wrongOption.png                  ← Q1-only: NOT used in current code
```

**Important:** `oops!wrong .mp3` has a literal space before `.mp3`. Always reference as `'audio/oops!wrong .mp3'`.

---

## Page Sequence (STORY.pages indices)

| Index | Type     | Content                        | Notes                              |
|-------|----------|--------------------------------|------------------------------------|
| 0     | Video    | `video/page1-clip.mp4`         | poem1.mp3 at 72% of duration       |
| 1     | Quiz     | Q1_HTML                        | q1.mp3 plays on navigation         |
| 2     | Video    | `video/page2-clip.mp4`         | poem2.mp3 at 72% of duration       |
| 3     | Quiz     | Q2_HTML                        | q2.mp3 plays on navigation         |
| 4     | Video    | `video/page3-clip.mp4`         | poem3.mp3 at 72% of duration       |
| 5     | Quiz     | Q3_HTML                        | q3.mp3 plays on navigation         |
| 6     | Video    | `video/page4-clip.mp4`         | poem4.mp3 at 72% of duration       |
| 7     | Quiz     | Q4_HTML                        | q4.mp3 plays on navigation         |
| 8     | Video    | `video/page5-clip.mp4`         | poem5.mp3 at 72% of duration       |
| 9     | Quiz     | Q5_HTML (Rectangle)            | q5.mp3 plays on navigation         |
| 10    | Video    | `video/page6-clip.mp4`         | poem6.mp3 at 72% of duration       |
| 11    | Quiz     | Q6_HTML (Circle)               | q6.mp3 plays on navigation         |
| 12    | Video    | `video/page7-clip.mp4`         | poem7.mp3 at 72% of duration       |
| 13    | Quiz     | Q7_HTML (Square)               | q7.mp3 plays on navigation         |
| 14    | Count    | isCountPage: true              | Star count/completion page          |

turn.js adds 2 cover pages, so turn.js page number = spread index + 2.

---

## Quiz Answer Keys

| Quiz | Question idiom       | Left option (o1)           | Right option (o2)          | Correct |
|------|----------------------|----------------------------|----------------------------|---------|
| Q1   | "break the ice"      | Hammer breaking ice        | Children shaking hands     | RIGHT (o2) |
| Q2   | "hit the nail on the head" | Girl thumbs up        | Person hammering nail      | LEFT (o1) |
| Q3   | "raining cats and dogs" | Cats/dogs falling from sky | Rainy street scene      | LEFT (o1) — wait, needs verification |
| Q4   | "under the weather"  | Sick girl with cup         | Girl standing in rain      | LEFT (o1) |
| Q5   | Rectangle halves     | TBD (assets pending)       | TBD (assets pending)       | LEFT (o1) — swap listeners if needed |
| Q6   | Circle halves        | TBD (assets pending)       | TBD (assets pending)       | LEFT (o1) — swap listeners if needed |
| Q7   | Square halves        | TBD (assets pending)       | TBD (assets pending)       | LEFT (o1) — swap listeners if needed |

*Verify Q3 by checking `o1.addEventListener("click", wrong/correct)` in Q3_HTML script.*
*Q5/Q6/Q7 default to o1=correct. To flip: swap the correct()/wrong() calls on o1/o2 click listeners AND swap the CorrectOption/IncorrectOption src in the correct()/wrong() functions.*

---

## Architecture

### turn.js Flipbook

- `$('#flipbook').turn({...})` at the bottom of `ebook.html`
- Pages injected at startup via `STORY.pages.forEach(...)` using `$('#flipbook').turn('addPage', ...)`
- Each spread is a `.page` div with `data-si="N"` (spread index N)
- Spread size: **820 × 472 px** (full two-page spread as one div)

### Key turn.js Events

```javascript
// Fires when flip starts — use to STOP audio
turning: function(e, page, view) {
  // stop __currentPoemAudio and __currentQuizAudio here
}

// Fires when flip COMPLETES — use to START playback
turned: function(e, page, view) {
  // curSpread = spread index (0-based)
  // play video, trigger poem audio listener, trigger quiz audio
}
```

### Global Variables

| Variable | Purpose |
|---|---|
| `curSpread` | Current spread index (0-based). -1 at start. |
| `window.__currentPoemAudio` | Audio object for currently playing poem. Nulled and paused on `turning`. |
| `window.__currentQuizAudio` | Audio object for currently playing quiz narration. Nulled and paused on `turning`. |
| `STORY` | Config object: `{ bgMusic, title, pages: [...] }` |
| `bgMusic` (element) | `<audio id="bgMusic">` — background loop |

---

## Quiz System Architecture

### HTML Structure (per quiz, e.g. Q2/Q3/Q4 standard pattern)

```html
<div id="q2s" class="quiz-scene is-question" data-state="question">
  <img id="q2bg" class="quiz-bg" src=".vscode/assets/q2Mainbg.png">
  <div id="q2hd" class="quiz-feedback" aria-hidden="true">
    <!-- feedback banner: checkmark + title + copy -->
  </div>
  <img id="q2o1" class="quiz-option" src=".vscode/assets/q2Option1.png">
  <img id="q2o2" class="quiz-option" src=".vscode/assets/q2Option2.png">
  <div id="q2dl" class="quiz-tail" aria-hidden="true"><span></span><span></span></div>
  <div id="q2dr" class="quiz-tail" aria-hidden="true"><span></span><span></span></div>
  <button id="q2rt" class="quiz-retry" type="button">Try Again</button>
  <button id="q2nx" class="quiz-next" type="button">Next</button>
</div>
<script>
  setTimeout(function() {
    // init quiz logic: correct(), wrong(), reset()
  }, 0);
</script>
```

**Q1 difference:** Uses `<div id="q1hd" class="quiz-action-hit">` (invisible hit area for wrong-bg animation) PLUS a separate `<div class="quiz-feedback">`. The wrong state changes `bg.src` to `q1wrongbg.png` (which already has circles drawn in).

### Quiz State Machine

CSS class on `#qNs` (the `.quiz-scene` element):
- `.is-question` — default, options are clickable
- `.is-correct` — correct answer selected, show feedback, show Next button
- `.is-wrong` — wrong answer selected, show retry button

`setState("question"|"correct"|"wrong")` toggles these classes.

### CSS Tail Dots (quiz-tail)

The `.quiz-tail` divs with `<span>` children form thought-bubble connector circles between the character and the cloud options.

**IMPORTANT:** All quiz background images (`q1Mainbg.png` through `q4Mainbg.png`) already have these circles drawn into the image. Therefore ALL CSS tails are permanently hidden:

```css
#q1dl, #q1dr { opacity: 0; }
#q2dl, #q2dr { opacity: 0; }
#q3dl, #q3dr { opacity: 0; }
#q4dl, #q4dr { opacity: 0; }
```

**Never** add `#qNs.is-correct` or `#qNs.is-wrong` overrides to show these tails — it causes double-circles.

### CSS Option Sizes (Question State)

The flipbook spread is 820px wide. Options are positioned as `position: absolute` inside the quiz scene (also 820×472).

```css
/* Q1 — MUST use different CSS sizes to compensate for image padding difference:
   q1Option1.png fills only 72.7% of its canvas (27% transparent padding around cloud)
   q1Option2.png fills 94.4% of its canvas (almost no padding)
   At equal CSS sizes, q1Option2 appears ~30% bigger. Calibrated values make visual clouds equal (~245x190px). */
#q1o1 { left: 20px;  top: 80px;  width: 337px; height: 249px; }
#q1o2 { left: 510px; top: 110px; width: 259px; height: 190px; }

/* Q2, Q3, Q4 — both options equal size */
#q2o1 { left: 25px;  top: 85px;  width: 300px; height: 220px; }
#q2o2 { left: 495px; top: 85px;  width: 300px; height: 220px; }
#q3o1 { left: 25px;  top: 85px;  width: 300px; height: 220px; }
#q3o2 { left: 495px; top: 85px;  width: 300px; height: 220px; }
#q4o1 { left: 25px;  top: 85px;  width: 300px; height: 220px; }
#q4o2 { left: 495px; top: 85px;  width: 300px; height: 220px; }
```

When the correct answer is selected, the correct option gets `quizCorrectPop` animation and grows. When wrong, the selected option gets `quizWrongShake` animation and grows. See CSS `#qNs.is-correct #qNo1/o2` rules (~lines 881–1013).

### CSS Feedback Buttons

```css
/* Next button (blue) — shared */
.quiz-next { ... background: linear-gradient(180deg, #4fc3f7, #1565c0); }

/* Retry button (red) — shared */
.quiz-retry { ... background: linear-gradient(180deg, #f9826c, #e63946); }
```

Buttons are `display: none` by default, shown by state CSS:
```css
#q2s.is-wrong .quiz-retry   { display: block; }
#q2s.is-correct .quiz-next  { display: block; }
#q2s.is-correct .quiz-feedback { display: flex; }
```

---

## Audio System

### Background Music
```javascript
STORY.bgMusic = "audio/Quirky_Podcast_Jingle.mp3";
// Volume 0.35, loop=true. Starts on first user interaction.
```

### Poem Audio (72% of video)
Triggered in `turned` handler. Each video page has a `poemMap`:
```javascript
var poemMap = { 0:'audio/poem1.mp3', 2:'audio/poem2.mp3', 4:'audio/poem3.mp3', 6:'audio/poem4.mp3' };
```
A `timeupdate` listener fires once when `currentTime >= duration * 0.72`.

### Quiz Narration Audio
Triggered in `turned` handler 600ms after navigation:
```javascript
var quizAudioMap = { 1:'audio/q1.mp3', 3:'audio/q2.mp3', 5:'audio/q3.mp3', 7:'audio/q4.mp3' };
```
Also plays on **Retry** click: `rt.addEventListener("click", function() { reset(); setTimeout(playQAudio, 200); })`.

**Does NOT play on initial page build** — `reset()` in each quiz script does NOT call `playQAudio()`. Audio only fires from the `turned` event or retry.

### Wrong Answer Sound
```javascript
new Audio('audio/oops!wrong .mp3')  // note the space in filename
```
Plays immediately on wrong option click. No `window.__currentQuizAudio` override — it's fire-and-forget.

### Correct Answer Sound
WebAudio synth tones (not a file). See `playQuizFeedbackSound('correct')`.

---

## Key CSS Sections (by line range in ebook.html)

| Lines | Content |
|---|---|
| ~821–851 | `.quiz-scene`, `.quiz-bg`, `.quiz-option` base styles |
| ~852–911 | Q1 option positions + is-correct/is-wrong states |
| ~912–960 | `.quiz-tail` base CSS + Q1 tail hidden rule |
| ~961–1060 | Q2 option positions + states + Q2 tail hidden |
| ~1071–1175 | `.quiz-feedback`, `.quiz-action-hit`, `.quiz-next` button |
| ~1179–1260 | `@keyframes quizCorrectPop`, `@keyframes quizWrongShake`, `.quiz-retry` |
| ~1277–1380 | Q3 option positions + states + Q3 tail hidden |
| ~1380–1440 | Q4 option positions + states + Q4 tail hidden |
| ~1441–1530 | Q5 option positions + states + Q5 tail hidden |
| ~1485–1570 | Q6 option positions + states + Q6 tail hidden |
| ~1529–1610 | Q7 option positions + states + Q7 tail hidden |

---

## Key JS Sections (by line range in ebook.html)

| Lines | Content |
|---|---|
| ~5167–5278 | `var Q1_HTML = \`...\`` |
| ~5280–5390 | `var Q2_HTML = \`...\`` |
| ~5391–5501 | `var Q3_HTML = \`...\`` |
| ~5502–5611 | `var Q4_HTML = \`...\`` |
| ~5734–5844 | `var Q5_HTML = \`...\`` (Rectangle) |
| ~5845–5955 | `var Q6_HTML = \`...\`` (Circle) |
| ~5956–6066 | `var Q7_HTML = \`...\`` (Square) |
| ~6068–6160 | `var STORY = { bgMusic, title, pages: [...] }` |
| ~5670–5850 | Page injection loop (`STORY.pages.forEach`) |
| ~6150–6165 | `initMusic()`, `startMusic()` |
| ~6220–6260 | `turning` event handler (stop audio, stop video) |
| ~6261–6300 | `turned` event handler (start video, poem audio, quiz audio, overlay) |

---

## How to Add a New Quiz Page

1. Define `var Q5_HTML = \`...\`` following the Q2/Q3/Q4 pattern (NOT Q1 pattern).
2. Add CSS for `#q5o1`, `#q5o2`, `#q5dl/#q5dr`, `#q5s.is-correct/is-wrong` states.
3. Set `#q5dl, #q5dr { opacity: 0; }` — never show CSS tails.
4. Add `{ image: null, video: null, html: Q5_HTML, dialogues: [] }` to `STORY.pages`.
5. Add corresponding video page before it.
6. Add to `quizAudioMap` in `turned` handler with the new spread index.
7. Add to `poemMap` if the preceding video page has a poem.

---

## Known Design Decisions & Constraints

- **Q1 uses `q1wrongbg.png`** for its wrong state background (image swap), while Q2/Q3/Q4 keep the main bg on wrong state and just animate the option.
- **CSS tails permanently hidden** — all background images have circles baked in. Adding any opacity override causes double circles.
- **Quiz audio fires from `turned`, not from `reset()`** — prevents audio playing at page build time on startup.
- **`oops!wrong .mp3` has a space in the filename** — this is intentional (the actual file on disk has that name).
- **Poem audio uses `_poemPlayed` flag** on the video element to prevent double-firing on `timeupdate`.
- **turn.js page numbering:** internal page numbers are 1-based and offset by 2 (two cover blanks). Spread index = turn.js page - 2. Use `curSpread` variable, not turn.js page number.

---

## How to Update This File

Edit this file (`CONTEXT.md`) whenever:
- A new quiz is added or removed
- Option image assets are replaced (update fill/size notes)
- CSS line ranges shift significantly
- Audio files are renamed or added
- Quiz answer keys change
- Any architectural decision is made that future AI needs to know
