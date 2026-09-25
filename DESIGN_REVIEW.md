# Main Hunt Screen Redesign

The purpose of this redesign is to improve completion rate and customer satisfaction rate for Let's Roam tours.

The Main Hunt Screen and its associated user workflow is the core of the app and is the most important to completion
rate and customer satisfaction.

My design philosophy usually centers around **Clarity**. A visual interface that helps the user immediately understand
"What do I do on this screen?" is good UI.

With Clarity in mind I approached the Main Hunt Screen redesign, using things like color, size, location, omission and
other elements to focus the user on their next task: big orange buttons, very clear language, and all secondary info
should be subservient to the main goals visually.

I also adjusted the user workflow, so it is one smooth forward navigation, rather than a hub-and-spoke model.

- Demo: https://lets-roam-hunt.vercel.app
- This review as a page, with the screens side by side: https://lets-roam-hunt.vercel.app/review-v3.html
- Earlier versions of the page, kept so the iteration is visible: [v1](https://lets-roam-hunt.vercel.app/review.html),
  [v2](https://lets-roam-hunt.vercel.app/review-v2.html)

## What the main hunt screen needs to communicate

**Where do we go next?** The name of the next stop, a picture of it, its address, an estimated walk time, walking
directions and a map.

**What do we do when we get there?** The next action, whether it be checking in, enjoying the challenges or
identifying the next location, should be clear and easy to understand.

**Are we on track?** Reassurance that the users are on track and following the tour correctly. Users are less likely
to give up when they feel they are doing it correctly.

## Design philosophy

1. **Clarity First.** A group standing on a pavement should know what to do in one glance. Points, the gamification
   and extras matter, but they must be secondary to clarity of the core flow.
2. **One Next Action.** Every state of the screen has exactly one primary button: Directions, Check in, Submit,
   Next stop.
3. **Use Words.** Labels beat colour codes and icons alone. Plain English beats jargon.
4. **Checking-In Is A Big Win.** Arriving is a core accomplishment for Let's Roamers, so the check-in itself gets the
   celebration: the button pops, confetti, the points land, and "Next stop" appears right there.

## What I saw in the current screens

The Ghost Tour flow (eleven screens) and the exported classic hunt components, judged against the three questions
above.

- **The main screen is a hub, not a flow.** Rank, four header icons, a countdown, a 0% ring, two chips, a four-line
  explainer of how points work, a "Show Ordered Locations" toggle, then a list of identical location cards. Nothing
  says "go here now". The next location is a pop-up sheet you only reach by tapping the right card.
- **Status crowds out the tour.** The top half of the screen is score and progress. The countdown is the loudest
  number and it is unexplained.
- **The instructions are permanent.** "Earn points by: accurate check-ins, finish locations quickly" is read-once
  copy shown on every visit, and it pushes two ideas that work against completion: GPS accuracy and speed.
- **Sheets stack three deep.** Location sheet, check-in result modal, challenge list sheet, challenge modal, each
  with its own close button.
- **Check-in penalises the phone's GPS** ("392 / 400 for Distance") and the moment after a stop only offers "Show
  Challenges", not "where next".
- **Closed locations only get "Let us know".** A locked gate ends the hunt for most groups.
- **Colour as meaning, no legend.** Orange, grey, yellow challenge tiles. Distance as "2.87 mi" in white over a photo.
  Four typefaces, three icon sets, emoji in the score breakdown.

## The redesign, screen by screen

### Starting the tour

- **One main button.** "Check In & Start Tour" takes the user by the hand and says: do this. A single action, in the
  brand orange, with nothing else on the screen competing for it.
- **Tour and team names at the top**, keeping the overall task in focus. Score, time and info are stacked on the
  right so the names always show in full.
- **No loss state.** Users can skip a stop, unskip it, revisit a completed one and retry any challenge. Nothing is
  irreversible, so there is no frustration or sense of failure, and they are free to explore the app.

### After checking in

- **Screen transforms into the checked-in state.** The card stays where it is. The check-in button animates and
  indicates success, and the next stop appears (photo, walk time, address and a big orange button), keeping you
  focused on moving forward.
- **Optional challenges are visually below the mandatory next step.** Visual hierarchy, so the user is clear what's
  really critical.
- **Increased use of clarifying language.** Plain English everywhere, in small cues the user reads without noticing:
  "Completed Stop 3 of 5", "3 optional challenges below", "6 min walk", "Trivia", "Photo", "Fill in". Every state of
  the screen says what it is and what comes next, so it is very hard to be confused.

### En route

- **One flow, not a hub and spokes.** The current app is a list of locations plus a pop-up sheet for whichever one
  you tap. The redesign is a single flow of screens, each with one big action that pulls you through to the next:
  check in, next stop, directions, check in. The next stop is simply the next screen.
- **Directions, then Check in.** Two buttons in the order you need them. Check in unlocks on arrival and says so in
  words.
- **Something preventing check-in?** Eliminate frustrating dead ends with an option to skip (can also be unskipped).

## Decisions made while iterating

The first build was Claude's take on the brief. These are the calls I made on top of it while using the demo, in
the order they came up. Each one is in the app now.

1. Route label reads "On Stop 1 of 5", then "Completed Stop 1 of 5" the moment you check in. No "1 done" counter.
2. Checking in is the reward. The button pops with a burst, like a like button, and the card stays put instead of
   swapping to a different layout. The challenges slide up from below so they read as part of this place.
3. Challenges are optional. After check-in the next-stop button appears right there, with a small photo, name, walk
   time and address of the next location above it, in the brand orange. The "3 optional challenges below" note sits
   under the Checked in button.
4. Wording follows the event type: Tour, Hunt or Crawl. The first stop's button reads "Check In & Start Tour".
5. Answers are type-specific: year questions get a scroll wheel. One try per question, then "Next challenge" with a
   small "Try again" as an option. Skip goes straight to the next challenge. Any challenge can be reopened and
   retried later.
6. Descriptions show four lines before "Read more", and the button only appears when the text is actually clipped.
7. The route bar is tappable. Completed stops can be revisited, with a navy bar and an orange button that both say
   "Back to Stop 3" so nobody gets lost. Skipped stops can be unskipped. Stops ahead can't be tapped.
8. The challenge list is titled after the place ("Pike Place Market Challenges"). When all are done a teal "All
   challenges done here" strip appears; no second next-stop button, and no points total on the strip because it read
   as a bonus.
9. The tour name is the bold line at the top and the team name is under it. Score, time and info stack on the right
   so both names show in full on a phone.
10. The question mark opens a general info sheet: what the tour is, a short FAQ (do we have to do the challenges, the
    button is greyed out, can we go back, is there a time limit, how do points work, what if we get lost), and the
    "This stop is closed" and support actions.
11. Sheets animate only when they open. After that the content fades in and out, slowly enough to feel human, and the
    white card never moves.
12. On a phone the frame fills the viewport exactly, so a bottom sheet is never partly below the screen.

## What I would measure after shipping

Completion rate is the outcome. Leading indicators worth logging so we know *why* it moved:

- Time between finishing a stop and checking in at the next one, per stop.
- Drop-off by stop index. Stop 1 is a clarity problem; stop 3 or 4 is fatigue or closed locations.
- Skips and unskips, per challenge and per stop. A high skip rate on one question is a content fix.
- Info sheet opens per session; should fall.
- A rating prompt on the finish screen, while the fox is still up.

Ship behind a flag to a share of new tours and compare for two weeks.

## How it was built

Plain HTML, CSS and JavaScript, no build step, in Claude Code. I directed; the AI wrote the code and the first draft
of the critique, and I reworked the design and the argument through the iterations above. The full transcript is in
`AI_CONVERSATION_TRANSCRIPT.md`.
