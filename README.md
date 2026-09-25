# Let's Roam: main hunt screen redesign

Frontend developer project for Let's Roam. A review of the current hunt screen, a redesign, and a working demo.

- **Live demo:** https://lets-roam-hunt.vercel.app
- **Annotated review of the current screens:** https://lets-roam-hunt.vercel.app/review.html
- **Written review with reasoning:** [DESIGN_REVIEW.md](./DESIGN_REVIEW.md)
- **AI transcript:** [AI_CONVERSATION_TRANSCRIPT.md](./AI_CONVERSATION_TRANSCRIPT.md)

## Run it

No install, no build step, no server needed.

```
git clone https://github.com/mikeprimak/lets-roam-hunt.git
cd lets-roam-hunt
```

Then either double-click `index.html`, or serve the folder (any static server works):

```
npx serve .
# or
python -m http.server 8000
```

and open http://localhost:8000. `review.html` is the annotated critique of the current design.

Tested in Chrome, Edge and Safari. Best viewed at phone width or in the 430px frame it renders on desktop.

## What the demo does

The redesigned main hunt screen for a five-stop ghost tour. The demo bar above the phone frame has one button that
stands in for the GPS: **Simulate GPS: arrive**. In the app that event comes from the location watcher.

1. **Travel state.** One current-stop card: photo, "Next stop" badge, walk time, one-line lore, Directions and a
   Check in button that is disabled until you arrive, with the reason written under it. "Skip this stop" is always
   there for closed locations.
2. **Check in.** Flat +500, confirmed inline. The challenges for that stop appear under the card with a word label
   (Trivia, Photo, Fill in), points and state.
3. **Challenges.** One bottom sheet, never stacked. Multiple choice, fill-in and photo. Two tries, a hint that costs
   25 points, a free skip, then the answer is revealed and "Next challenge" moves on inside the same sheet.
4. **Stop done.** A celebration card with the points earned, the fox, the next stop and its walk time, and
   "Let's go". This is the transition the current design leaves empty.
5. **Map.** Route with numbered stops, done / current states and your position. Stylised, not real tiles.
6. **Finish.** Score, stops, challenges, time, team photo and share.

The help sheet (question mark, top right) lists how points work in plain language and has the "This stop is closed"
and support actions.

## Files

```
index.html        the demo page (phone frame + demo bar)
app.js            the screen: one state object, one render(), named actions
hunt-data.js      hunt content, same shape as the current app's HUNT_DATA
styles.css        design-system tokens and components
review.html       annotated screenshots of the current design
DESIGN_REVIEW.md  the review, the changes, and what to measure
assets/           fonts, mascot and ghost art, current-design screenshots
```

## How it is built

- **Plain HTML, CSS and JavaScript**, no framework. The task allows any framework; I chose none so the reviewers can
  open the file and so the code shows the design without a build system in the way. Your own demo export takes the
  same approach.
- **State → render.** `app.js` holds one `state` object and a `render()` that rebuilds the screen from it. Every
  user action is a named function in the `A` object. This maps one-to-one onto a React Native screen with
  `useReducer`, which is how I would port it.
- **Data shape.** `hunt-data.js` keeps the current app's `game_v2.locations` / `allChallenges` / `challengeList`
  structure so the screen could read the existing payload. The fields the redesign adds (`walkMinutes`,
  `optional`, `hint`, `accept`, `scoring`) are marked `NEW` in the file.
- **Design system.** Colours, type, radii, shadows and motion are the tokens from the Let's Roam Design System
  (2026 Q3 v2): Plus Jakarta Sans, orange `#E87722`, off-orange `#FDF1E9`, teal `#6AAEAA` for completed states,
  pill buttons, 10px cards, 150ms transitions. Icons are inline Phosphor-style strokes. Mascot art is the Foxtrot
  clipart from the system. No emoji.
- **Accessibility.** Buttons are buttons, the sheet is `role="dialog"`, choices are a radio group, the route bar is a
  `progressbar`, Escape closes the sheet, Enter submits a text answer. Text contrast meets AA on every surface.

## What I would do next

- Real GPS proximity and the "arrived" event, with a manual "I'm here" fallback for bad signal.
- Photo capture and upload with an optimistic +200 and a background retry.
- A/B the "Stop done" card against the current flow behind a flag, measuring the time gap between finishing a
  stop and checking in at the next one. Details in `DESIGN_REVIEW.md`.
- Port the screen to React Native using the same state and actions.

## Assets and credit

Screenshots of the current app, ghost artwork, the Foxtrot mascot and the fonts are Let's Roam's, used here only
for this review. Hunt text is sample content written for the demo.
