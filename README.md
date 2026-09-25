# Let's Roam: main hunt screen redesign

Frontend developer project for Let's Roam. A review of the current hunt screen, a redesign, and a working demo.

- **Live demo:** https://lets-roam-hunt.vercel.app
- **Design review (what the screen must say, the principles, old vs new):** https://lets-roam-hunt.vercel.app/review-v3.html
- Earlier versions kept for reference: [v2](https://lets-roam-hunt.vercel.app/review-v2.html) (with the full comparison table)
- **Screen-by-screen comments on the current design (v1):** https://lets-roam-hunt.vercel.app/review.html
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
2. **Check in.** Flat +500. The card stays put: the button pops into a teal "Checked in" with a burst of confetti, the
   points land under it, and a preview of the next stop (photo, name, walk time, address) with an orange "Next stop"
   button appears right there. On the first stop the button reads "Check In & Start Tour". The wording
   (Tour / Hunt / Crawl) follows the event type in the data.
3. **Challenges.** Optional extras that slide up under the stop card as "Pike Place Market Challenges", each with a word label (Trivia, Photo, Fill
   in), points and state. One bottom sheet, never stacked. Multiple choice, a year wheel for year questions, text,
   and photo. One try, then "Next challenge" with a small "Try again" if you want it. A hint costs 25 points. Skip
   goes straight to the next one. Any challenge can be reopened later to try again.
4. **All challenges done.** A teal "All challenges done here · +400 pts" strip at the top of the list. The next-stop
   button is the one already on the stop card, so there is only ever one.
5. **Revisit a stop.** The route bar under "On Stop 2 of 5" is tappable. Tapping a completed stop shows it with a
   "Completed" badge, its challenges still open, and a navy bar plus an orange button that both say "Back to Stop 3",
   so a team that tapped ahead too early (or back by accident) is never lost. Stops ahead are not tappable.
6. **Map.** Route with numbered stops, done / current states and your position. Stylised, not real tiles.
7. **Finish.** Score, stops, challenges, time, team photo and share.

The info sheet (question mark, top right) explains the tour in a paragraph, answers the basic questions (do we have
to do the challenges, the button is greyed out, can we go back, is there a time limit, what if we get lost), lists
how points work, and has the "This stop is closed" and support actions.

## Files

```
index.html        the demo page (phone frame + demo bar)
app.js            the screen: one state object, one render(), named actions
hunt-data.js      hunt content, same shape as the current app's HUNT_DATA
styles.css        design-system tokens and components
review-v3.html    design review: what the screen must say, principles, old vs new
review-v2.html    v2: same, with a full comparison table
review.html       v1: screen-by-screen comments on the current design
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
