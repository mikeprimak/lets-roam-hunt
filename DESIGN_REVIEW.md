# Design review: the current main hunt screen

Screens reviewed: the Ghost Tour app flow (11 screens) and the `Lets-Roam-Hunt-Demo` export of the classic hunt
components. The annotated version of this review is `review.html` (open it in a browser, or see the live link in
the README).

The brief says completion rate and satisfaction have dropped. Everything below is judged against three questions
a team on a walking tour asks over and over: **Where do we go? What do we do here? How are we doing?** The
current screen answers the third question loudly and the first two quietly.

## The main hunt screen (screen 4)

**1. There is no "next action".** The screen is a dashboard: rank, points, a 0% ring, a "500 pts" chip, a "Map" chip,
a four-item explainer of how points work, a toggle, then a list of locations that all look the same. Nothing says
"go here now". A group standing on a pavement has to work out for themselves which card to tap. That is the
first place people stall, and stalling on stop 1 is how a hunt gets abandoned.

**2. The top half is spent on status, not on the tour.** Rank, four header icons, the ghost progress line, the timer,
the progress ring and the two chips take roughly 45% of the viewport before the first piece of hunt content. The
ring reads "0% Complete" at the exact moment we want people to feel that this will be easy and fun.

**3. The countdown timer is the most prominent number on the screen (88:09).** It is not explained. What happens at
zero? Is it a deadline or a bonus? Time pressure with no context makes people anxious, and anxious groups quit
rather than "lose". The ghost-on-a-dotted-line beside it has no labels, so it is decoration.

**4. The "how points work" text is permanent UI.** "Complete Challenges Below & Earn Points By: Complete More
Challenges, Accurate Check-Ins, Fun Accurate Photos, Finish Locations Quickly" is instructional copy that should be
read once. Here it sits between the header and the content on every visit. It also introduces two ideas that
hurt completion: check-in accuracy (which is GPS, not skill) and speed (which punishes the groups that are enjoying
the tour).

**5. "Show Ordered Locations" implies the list is unordered.** A tour has an order. Making the route an opt-in
toggle invites people to wander to the nearest pin, which breaks the story a ghost tour is telling and makes the
distance numbers meaningless.

**6. Location cards are identical.** Photo, name, "Complete 5 challenges here", "0/5". No current/next/done state,
no walking time, no sense that one of these is where you are standing. The distance is overlaid on the photo in
white text ("2.87 mi away") with poor contrast, in miles to two decimals, which is not how people walk. "6 min walk"
is.

**7. The header has four unlabeled icons plus an unlabeled "≡" tab hanging off the right edge.** On a phone, with a
group, in the dark, on a ghost tour, every unlabeled control is a support ticket.

**8. Points are big and meaningless.** 500, 892, 1,800, 2,300, 3,182. There is no scale to judge them against and
"Rank: Top 50%" appears with 0 points. Numbers that cannot be interpreted cannot motivate.

## Location detail, check-in and challenges (screens 5 to 11)

**9. Sheets are stacked three deep.** Location sheet, then a check-in result modal on top of it, then the challenge
list sheet, then a challenge modal over that (screen 9 shows a modal over a sheet over a dimmed screen). Each layer
has its own close "X". It is easy to close the wrong one and lose your place. The main screen should be the place
you always come back to, with at most one sheet over it.

**10. Check-in penalises the player for the phone's GPS.** "392 / 400 for Distance" (screen 7). The team did the
right thing, walked to the stop and pressed the button, and lost points for something they cannot control. It
reads as unfair, and unfair is the fastest route to a bad review.

**11. The moment after a stop is the biggest drop-off risk, and the screen does nothing with it.** "Location
Complete!" (screen 11) shows a score breakdown and a paragraph of lore, then a button that says "Show Challenges".
The natural next thought is "where next, how far?" and it is not there. Completion is a chain of five or six of
these transitions. Every one that is not explicit is a place to leave.

**12. Closed locations only get "Let us know".** A locked gate at stop 3 currently ends the hunt for most groups.
There is no "skip this stop, keep your points, here is the next one".

**13. Challenge tiles use colour as meaning without a legend.** Orange, grey, yellow, orange again (screen 8). Is it
type? Difficulty? Points? The label should be a word: Trivia, Photo, Fill in.

**14. Copy talks like a scoreboard, not a guide.** "Earn More Points by Finishing Challenges Faster!", "Legacy Ghost
Capture", "You checked in 0 min 16 secs ago", "Location Score Breakdown". The brand voice in the design system is
warm and direct ("Let's Go!", "Yes it is!"). The tour copy itself is lovely; the UI copy around it is not.

**15. Brand consistency.** Four typefaces (Circular, Jakarta, Alternate Gothic, Inter), three icon sets
(FontAwesome, Simple Line Icons, emoji) and emoji in the score breakdown. The design system says one typeface,
one icon style, no emoji. This is not just tidiness: mixed systems read as "unfinished", which lowers trust and
satisfaction scores.

**16. Small things that add up.** The magnifier glyph renders as "Q" in "Q2.88 mi away". A dashed "------" answer
mask with no explanation. The hint ("The answer is 1 word") appears below the submit button. Grey 12px text on
the check-in result.

## What the redesign does about it

| Problem | Change |
| --- | --- |
| No next action (1, 5, 6) | One **current stop card** fills the first screen: photo, "Next stop" / "You're here" badge, walk time, one primary button. Stops are in tour order. A five-segment route bar replaces the ring, ghost line and toggle. |
| Status crowding the content (2, 7, 8) | Header is one row: team, score pill, time pill, help. No rank, no icon strip, no side tab. Score is still there, just not the hero. |
| Timer anxiety (3) | Time shows as "1h 28m", turns red under 10 minutes, and is hidden entirely for untimed hunts (`timerLimitMinutes: 0`). No speed bonus. |
| Permanent instructions (4, 14) | Points rules move to a **help sheet** (one tap, always available) written as a plain list. The screen itself explains what to do next in one line under the button: "Check in to unlock 3 challenges and earn +500 pts". |
| Stacked sheets (9) | Exactly **one sheet layer**. Challenges open in a bottom sheet over the main screen; the result shows inside the same sheet; "Next challenge" advances without closing. Closing always returns to the main screen. |
| GPS penalty (10) | Check-in is a flat +500 once you are within range. The button is disabled with a plain reason until then, and enables itself on arrival. |
| The gap between stops (11) | When the last required challenge is done, a **"Stop done!" card** appears at the top with points earned, the fox, the **next stop with its walk time**, and "Let's go". This is the single change I would expect to move completion the most. |
| Closed locations (12) | "Closed or can't get there? Skip this stop" on every stop, with a confirmation that says what you keep and what is next. Skipping a challenge is free too, so a stuck question never blocks a group. |
| Colour as meaning (13) | Each challenge row has a word label (Trivia, Photo, Fill in), the question preview, the points and a done / skipped state. |
| Brand (15, 16) | Plus Jakarta Sans only, design-system orange / cream / teal, pill buttons, 10px cards, 150ms transitions, Phosphor-style stroke icons, the Foxtrot mascot for celebrations, no emoji. |

## What I would measure after shipping

Completion rate is the outcome. These are the leading indicators I would put in PostHog (or the existing analytics)
so we know *why* it moved:

- `stop_completed` → `next_checkin` **time gap**, per stop. If the "Stop done" card works, this gap shrinks and fewer
  sessions end between stops.
- **Drop-off by stop index.** Today, if most abandons happen at stop 1, the problem is clarity; if at stop 3 or 4, it
  is fatigue or closed locations.
- `challenge_skipped` and `stop_skipped` with reason. Skips are cheap for us and save the session; a high skip rate on
  one question is a content bug we can fix in the data.
- `help_opened` per session. Should fall as the screen explains itself.
- Time-to-first-check-in from hunt start.
- Star rating prompt at the finish screen, so satisfaction is captured while the fox is still on screen.

Ship it behind a flag to a percentage of new hunts and compare against the current screen for two weeks.
