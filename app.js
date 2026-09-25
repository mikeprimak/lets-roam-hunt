/* Let's Roam - main hunt screen redesign (demo).
   Plain JS, no build step. One state object, one render() call. The structure maps
   1:1 to how this would be written as a React Native screen: state -> view, with
   every user action being a named reducer below. */
(function () {
  "use strict";

  const DATA = window.HUNT_DATA;
  const G = DATA.game_v2;
  const SCORING = DATA.scoring;
  const STOPS = G.locationList.map((id) => G.locations[id]);
  const IS_TIMED = G.timerLimitMinutes > 0;
  const EVENT = { ghostTour: "Tour", scavaHunt: "Hunt", barCrawl: "Crawl" }[DATA.group.info.huntType] || "Hunt";
  const event = EVENT.toLowerCase();

  // ---------- state ----------
  const initial = () => ({
    stopIdx: 0,
    arrived: true,            // the tour starts at stop 1, so the team is "here" already
    checkedIn: {},            // locationId -> true
    stopStatus: {},           // locationId -> "done" | "skipped"
    results: {},              // challengeId -> { status, points, tries, hint }
    score: 0,
    timeLeft: G.timerLimitMinutes * 60,
    sheet: null,              // { type: "challenge"|"help"|"skipStop", ... }
    view: "hunt",             // "hunt" | "map"
    huntDone: false,
    toast: null,
    loreOpen: false,
    anim: null,               // one-shot animation flag, consumed by the next render
    viewIdx: null             // stop shown on screen when revisiting a completed one; null = the active stop
  });
  let state = initial();

  // ---------- helpers ----------
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const fmtPts = (n) => n.toLocaleString("en-US");
  const fmtTime = (s) => {
    const m = Math.max(0, Math.floor(s / 60));
    return m >= 60 ? `${Math.floor(m / 60)}h ${String(m % 60).padStart(2, "0")}m` : `${m} min`;
  };
  const kindLabel = { multiple_choice: "Trivia", text: "Fill in", photo: "Photo" };
  const kindIcon = { multiple_choice: "question", text: "pencil", photo: "camera" };
  const currentStop = () => STOPS[state.stopIdx];
  const shownIdx = () => (state.viewIdx == null ? state.stopIdx : state.viewIdx);
  const shownStop = () => STOPS[shownIdx()];
  const isRevisit = () => state.viewIdx != null && state.viewIdx !== state.stopIdx;
  const nextIdxAfter = (i) => { for (let k = i + 1; k < STOPS.length; k++) if (!state.stopStatus[STOPS[k].locationId]) return k; return -1; };
  const nextStop = () => { const k = nextIdxAfter(state.stopIdx); return k < 0 ? null : STOPS[k]; };
  const challengesOf = (stop) => stop.challengeList.map((id) => G.allChallenges[id]);
  const resolved = (id) => !!state.results[id];
  const stopResolved = (stop) => challengesOf(stop).filter((c) => !c.optional).every((c) => resolved(c.challengeId));
  const stopPoints = (stop) => (state.checkedIn[stop.locationId] ? SCORING.checkIn : 0) + challengesOf(stop).reduce((n, c) => n + ((state.results[c.challengeId] || {}).points || 0), 0);
  const normalize = (s) => String(s || "").trim().toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/^(a|an|the)\s+/, "");

  // ---------- icons (inline SVG, Phosphor-style strokes, currentColor) ----------
  const I = {
    pin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s7-6.1 7-12a7 7 0 1 0-14 0c0 5.9 7 12 7 12z"/><circle cx="12" cy="10" r="2.5"/></svg>',
    walk: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="13" cy="4" r="1.6"/><path d="M10 21l2-6-2.5-2 1-5 3 .5 2 3 2 1M9 13l-2 3-2 5M12.5 15l3 6"/></svg>',
    clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
    bolt: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M13 2L4 14h6l-1 8 9-12h-6l1-8z"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
    x: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    chevron: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg>',
    arrow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
    nav: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 3L3 10.5l8 2.5 2.5 8L21 3z"/></svg>',
    question: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.4-1 1-1 1.7"/><circle cx="12" cy="17" r=".6" fill="currentColor"/></svg>',
    pencil: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h4l10.5-10.5a2.1 2.1 0 0 0-3-3L5 17v3zM13.5 8.5l3 3"/></svg>',
    camera: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/></svg>',
    bulb: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18h6M10 21h4M8 13a5 5 0 1 1 8 0c-.8.9-1 1.6-1 3H9c0-1.4-.2-2.1-1-3z"/></svg>',
    help: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.4-1 1-1 1.7"/><circle cx="12" cy="17" r=".6" fill="currentColor"/></svg>',
    flag: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 21V4h11l-1.5 4L16 12H5"/></svg>',
    star: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3l-5.9 3.3 1.3-6.6L2.5 9.4l6.6-.8z"/></svg>',
    map: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2zM9 4v14M15 6v14"/></svg>',
    share: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12M7 8l5-5 5 5M5 14v6h14v-6"/></svg>'
  };

  // ---------- actions (reducers) ----------
  const A = {
    checkIn() {
      const stop = currentStop();
      if (!state.arrived || state.checkedIn[stop.locationId]) return;
      state.checkedIn[stop.locationId] = true;
      state.score += SCORING.checkIn;
      state.anim = "checkin";
      bumpScore();
    },
    openChallenge(id) {
      const r = state.results[id];
      state.sheet = { type: "challenge", id, selected: null, input: "", hint: !!(r && r.hint), feedback: null, photo: false, tries: r ? r.tries : 0 };
      if (r && r.status === "correct") {
        const c = G.allChallenges[id];
        if (c.type === "multiple_choice") state.sheet.selected = c.answers.indexOf(c.correctAnswer);
        if (c.type === "photo") state.sheet.photo = true;
        state.sheet.feedback = { kind: "ok", points: r.points, text: "Already done." };
      } else if (r) {
        delete state.results[id];   // wrong or skipped: open it fresh to try again
      }
    },
    closeSheet() { if (state.sheet && state.sheet.type === "challenge" && stopResolved(shownStop())) state.anim = "stopdone"; state.sheet = null; },
    select(i) { if (state.sheet && !state.sheet.feedback) state.sheet.selected = i; },
    useHint() {
      const s = state.sheet; if (!s || s.hint || s.feedback) return;
      s.hint = true;
    },
    takePhoto() { if (state.sheet) state.sheet.photo = true; },
    submit() {
      const s = state.sheet; if (!s || s.feedback) return;
      const c = G.allChallenges[s.id];
      const hintCost = s.hint ? SCORING.hintCost : 0;
      let ok = false;
      if (c.type === "multiple_choice") {
        if (s.selected == null) return;
        ok = c.answers[s.selected] === c.correctAnswer;
      } else if (c.type === "text") {
        const wheel = document.getElementById("wheel");
        if (wheel) s.input = String(Number(wheel.dataset.y0) + Math.round(wheel.scrollTop / 44));
        const val = c.answerType === "year" ? String(s.input || "") : normalize(document.getElementById("answer") ? document.getElementById("answer").value : s.input);
        s.input = val;
        if (!val) return;
        const accept = (c.accept || [c.correctAnswer]).map(normalize);
        ok = accept.includes(val);
      } else if (c.type === "photo") {
        if (!s.photo) return;
        ok = true;
      }
      if (ok) {
        const points = Math.max(0, c.points - hintCost);
        state.results[s.id] = { status: "correct", points, tries: s.tries + 1, hint: s.hint };
        state.score += points;
        s.feedback = { kind: "ok", points, text: c.type === "photo" ? "Photo saved. Nice one." : pick(["Correct!", "Nailed it!", "Spot on!"]) };
        bumpScore();
      } else {
        s.tries += 1;
        state.results[s.id] = { status: "wrong", points: 0, tries: s.tries, hint: s.hint };
        s.feedback = { kind: "bad", points: 0, text: "Not quite." };
      }
    },
    retry() { const s = state.sheet; if (s) { delete state.results[s.id]; s.feedback = null; s.selected = null; } },
    skipChallenge() {
      const s = state.sheet; if (!s) return;
      state.results[s.id] = { status: "skipped", points: 0, tries: s.tries, hint: s.hint };
      A.nextChallenge();
    },
    nextChallenge() {
      const stop = shownStop();
      if (stopResolved(stop)) state.anim = "stopdone";
      const next = challengesOf(stop).find((c) => !resolved(c.challengeId) && !c.optional) || challengesOf(stop).find((c) => !resolved(c.challengeId));
      if (next) A.openChallenge(next.challengeId); else state.sheet = null;
    },
    finishStop() {
      const stop = currentStop();
      state.stopStatus[stop.locationId] = "done";
      A.advance();
    },
    openHelp() { state.sheet = { type: "help" }; },
    openSkipStop() { state.sheet = { type: "skipStop" }; },
    skipStop() {
      const stop = currentStop();
      state.stopStatus[stop.locationId] = state.checkedIn[stop.locationId] ? "done" : "skipped";
      state.sheet = null;
      toast(`Skipped ${stop.name}`, "flag");
      A.advance();
    },
    viewStop(i) {
      i = Number(i);
      if (i > state.stopIdx && !state.stopStatus[STOPS[i].locationId]) { toast(`Check in at ${currentStop().name} first`, "pin"); return; }
      state.viewIdx = i === state.stopIdx && !state.huntDone ? null : i;
      state.loreOpen = false;
    },
    backToCurrent() { state.viewIdx = null; state.loreOpen = false; },
    unskipStop() {
      const i = shownIdx(); const stop = STOPS[i];
      if (state.stopStatus[stop.locationId] !== "skipped") return;
      delete state.stopStatus[stop.locationId];
      state.stopIdx = i; state.viewIdx = null; state.arrived = false; state.huntDone = false; state.loreOpen = false;
      toast(`Back on Stop ${i + 1}: ${stop.name}`, "pin");
    },
    advance() {
      state.loreOpen = false;
      state.viewIdx = null;
      const k = nextIdxAfter(state.stopIdx);
      if (k < 0) { state.huntDone = true; return; }
      state.stopIdx = k;
      state.arrived = false;
    },
    showMap() { state.view = "map"; },
    showHunt() { state.view = "hunt"; },
    toggleLore() { state.loreOpen = !state.loreOpen; },
    directions() { toast("Would open Apple or Google Maps", "nav"); },
    support() { toast("Would open support chat", "help"); },
    share() { toast("Would open the share sheet", "share"); },
    // demo-only: simulate the GPS proximity event
    simulateArrive() {
      if (state.huntDone) return;
      if (state.arrived) { toast("You are already at this stop", "pin"); return; }
      state.arrived = true;
      toast(`You have arrived at ${currentStop().name}`, "pin");
    },
    reset() { state = initial(); }
  };

  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
  let toastTimer = null;
  function toast(text, icon) {
    state.toast = { text, icon };
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { state.toast = null; render(); }, 2200);
  }
  let bump = false;
  function bumpScore() { bump = true; setTimeout(() => { bump = false; }, 600); }

  // ---------- views ----------
  function viewTopbar() {
    const team = DATA.group.info;
    return `
      <header class="topbar">
        <div class="team">
          <img src="${team.groupPhoto}" alt="">
          <div><div class="name">${esc(G.huntName)}</div><div class="hunt">Team ${esc(team.teamName)}</div></div>
        </div>
        <div class="stats">
          <div class="row"><span class="pill score ${bump ? "bump" : ""}" aria-label="Team score">${I.bolt}<span id="score">${fmtPts(state.score)}</span></span><button class="pill icon-only" data-action="openHelp" aria-label="Info and help">${I.help}</button></div>
          ${IS_TIMED ? `<div class="row"><span class="pill time ${state.timeLeft < 600 ? "low" : ""}" aria-label="Time left">${I.clock}<span id="time">${fmtTime(state.timeLeft)}</span></span></div>` : ""}
        </div>
      </header>`;
  }

  function viewRoute() {
    const doneCount = STOPS.filter((s) => state.stopStatus[s.locationId]).length;
    return `
      <div class="route">
        <div class="label"><span><b>${isRevisit() ? "Viewing Stop" : state.huntDone ? "Completed all" : state.checkedIn[currentStop().locationId] ? "Completed Stop" : "On Stop"} ${shownIdx() + 1} of ${STOPS.length}</b></span></div>
        <div class="steps" role="tablist" aria-label="Stops">
          ${STOPS.map((s, i) => {
            const st = state.stopStatus[s.locationId];
            const cls = st === "done" ? "done" : st === "skipped" ? "skipped" : i === state.stopIdx && !state.huntDone ? "current" : "";
            const reachable = i <= state.stopIdx || !!st;
            return `<button class="step ${cls} ${i === shownIdx() ? "shown" : ""} ${reachable ? "tappable" : ""}" data-action="viewStop" data-i="${i}" role="tab" aria-selected="${i === shownIdx()}" aria-label="Stop ${i + 1}: ${esc(s.name)}${st ? ", " + st : ""}"></button>`;
          }).join("")}
        </div>
      </div>`;
  }

  function viewStopCard(stop, anim) {
    const checked = !!state.checkedIn[stop.locationId];
    const revisit = isRevisit();
    const skipped = state.stopStatus[stop.locationId] === "skipped";
    const walk = stop.walkMinutes > 0 ? `${I.walk}${stop.walkMinutes} min walk<span class="dot"></span>${stop.walkMiles} mi` : `${I.pin}Starting point`;
    const required = challengesOf(stop).filter((c) => !c.optional).length;
    const burst = anim === "checkin" ? `<span class="burst" aria-hidden="true">${Array.from({ length: 14 }, (_, i) => `<i style="--a:${Math.round(i * (360 / 14))}deg;--d:${44 + (i % 3) * 14}px;--c:${["#E87722", "#FDD264", "#6AAEAA"][i % 3]}"></i>`).join("")}</span>` : "";
    let button, note;
    if (revisit) {
      const back = state.huntDone ? "Back to results" : `Back to Stop ${state.stopIdx + 1}: ${esc(currentStop().name)}`;
      button = checked ? `<button class="btn checked" disabled>${I.check}Checked in</button>` : `<button class="btn secondary" data-action="unskipStop">${I.flag}Unskip this stop</button>`;
      note = `<p class="cta-note">${checked ? `<b class="earned-note">+${SCORING.checkIn} pts</b> · the ${required} challenges below are still open` : "You skipped this stop. Unskip it to come back and check in here."}</p>
          <div class="btn-row"><button class="btn primary" data-action="backToCurrent">${back}${I.arrow}</button></div>`;
    } else if (checked) {
      const next = nextStop();
      button = `<button class="btn checked ${anim === "checkin" ? "pop" : ""}" disabled>${I.check}Checked in${burst}</button>`;
      note = `<p class="cta-note"><b class="earned-note ${anim === "checkin" ? "rise" : ""}">+${SCORING.checkIn} pts</b> · ${required} optional challenges below</p>
          <div class="next-block ${anim === "checkin" ? "rise-in" : ""}">
            ${next ? `<div class="next-stop"><img src="${next.photo}" alt=""><div><div class="k">Next stop</div><div class="n">${esc(next.name)}</div><div class="w">${next.walkMinutes} min walk · ${esc(next.address)}</div></div></div>` : ""}
            <div class="btn-row"><button class="btn primary" data-action="finishStop">${next ? `Next stop: ${esc(next.name)}` : `Finish ${EVENT}`}${I.arrow}</button></div>
          </div>`;
    } else {
      button = `<button class="btn primary" data-action="checkIn" ${state.arrived ? "" : "disabled"}>${I.check}${state.stopIdx === 0 ? `Check In &amp; Start ${EVENT}` : "Check in"}</button>`;
      note = `<p class="cta-note">${state.arrived ? `Check in to earn +${SCORING.checkIn} pts and see the challenges here` : "Check in turns on when you are within 50 m of the stop."}</p>
          <p class="cta-note"><button class="linkbtn" data-action="openSkipStop">Closed or can't get there? Skip this stop</button></p>`;
    }
    return `
      <section class="card">
        <div class="stop-photo">
          <img src="${stop.photo}" alt="">
          <div class="shade"></div>
          <span class="badge ${revisit ? (skipped ? "next" : "done") : state.arrived ? "" : "next"}">${revisit ? (skipped ? "Skipped" : "Completed") : state.arrived ? "You're here" : "Next stop"}</span>
          <h2>${esc(stop.name)}</h2>
        </div>
        <div class="card-body">
          <div class="meta"><span>${walk}</span><span class="dot"></span><span>${I.pin}${esc(stop.address)}</span></div>
          <p class="lore ${state.loreOpen ? "" : "clamp"}">${esc(stop.description)}</p>
          <button class="linkbtn" data-action="toggleLore">${state.loreOpen ? "Less" : "Read more"}</button>
          <div class="btn-row">
            ${state.arrived || checked || revisit ? "" : `<button class="btn secondary" data-action="showMap">${I.nav}Directions</button>`}
            ${button}
          </div>
          ${note}
        </div>
      </section>`;
  }

  function viewTravel(stop, anim) { return viewStopCard(stop, anim); }

  function viewChallengeRow(c) {
    const r = state.results[c.challengeId];
    const cls = r ? (r.status === "skipped" || r.status === "wrong" ? "skipped" : "done") : "";
    const pts = r ? (r.status === "correct" ? `+${r.points}` : r.status === "wrong" ? "0" : "Skipped") : `${c.points} pts`;
    return `
      <button class="challenge ${cls} ${c.optional ? "optional" : ""}" data-action="openChallenge" data-id="${c.challengeId}">
        <span class="tile">${r && r.status === "correct" ? I.check : I[kindIcon[c.type]]}</span>
        <span class="text">
          <span class="kind">${c.optional ? "Optional bonus" : kindLabel[c.type]}</span>
          <span class="title">${esc(c.name)}</span>
          <span class="snippet">${esc(c.question)}</span>
        </span>
        <span class="pts">${pts}</span>
        <span class="chev">${I.chevron}</span>
      </button>`;
  }

  function viewAtStop(stop, anim) {
    const list = challengesOf(stop);
    const required = list.filter((c) => !c.optional);
    const doneCount = required.filter((c) => resolved(c.challengeId)).length;
    const complete = stopResolved(stop);
    return `
      ${viewStopCard(stop, anim)}
      <div class="challenges ${anim === "checkin" ? "slide-in" : ""}">
        <div class="section-head"><h3>${esc(stop.name)} Challenges</h3><span class="count">${doneCount} of ${required.length} done</span></div>
        ${complete ? `<div class="strip teal all-done">${I.check}<span>All challenges done here</span></div>` : ""}
        ${list.map(viewChallengeRow).join("")}
        <div class="spacer-bottom"></div>
      </div>`;
  }

  function viewStopComplete(stop) {
    const next = nextStop();
    const earned = stopPoints(stop);
    return `
      <section class="card">
        <div class="celebrate">
          <img src="./assets/img/fox-celebrating.png" alt="">
          <h2>${esc(stop.name)} done!</h2>
          <p class="earned">Your team earned <b>+${fmtPts(earned)}</b> here</p>
          ${next ? `
            <div class="next-stop">
              <img src="${next.photo}" alt="">
              <div><div class="k">Next stop</div><div class="n">${esc(next.name)}</div><div class="w">${next.walkMinutes} min walk · ${next.walkMiles} mi</div></div>
            </div>
            <div class="btn-row"><button class="btn primary" data-action="finishStop">Let's go${I.arrow}</button></div>`
            : `<div class="btn-row"><button class="btn primary" data-action="finishStop">Finish the ${event}${I.arrow}</button></div>`}
        </div>
      </section>`;
  }

  function viewHuntDone() {
    const correct = Object.values(state.results).filter((r) => r.status === "correct").length;
    const total = Object.keys(G.allChallenges).filter((id) => !G.allChallenges[id].optional).length;
    const used = G.timerLimitMinutes * 60 - state.timeLeft;
    return `
      <section class="card">
        <div class="celebrate">
          <img src="./assets/img/fox-star.png" alt="">
          <h2>${EVENT} complete!</h2>
          <p class="earned">Final score <b>${fmtPts(state.score)}</b></p>
          <div class="summary">
            <div><b>${STOPS.filter((s) => state.stopStatus[s.locationId] === "done").length}/${STOPS.length}</b><span>Stops</span></div>
            <div><b>${correct}/${total}</b><span>Challenges</span></div>
            <div><b>${IS_TIMED ? fmtTime(used) : "-"}</b><span>Time</span></div>
          </div>
          <div class="btn-row"><button class="btn primary" data-action="share">${I.camera}Team photo</button><button class="btn secondary" data-action="share">${I.share}Share</button></div>
        </div>
      </section>
      <div class="spacer-bottom"></div>`;
  }

  function viewRevisitBar() {
    if (!isRevisit()) return "";
    const st = state.stopStatus[shownStop().locationId];
    const back = state.huntDone ? "Back to results" : `Back to Stop ${state.stopIdx + 1}`;
    return `<div class="revisit-bar">${I.flag}<span>You're looking at a ${st === "skipped" ? "skipped" : "completed"} stop</span><button class="btn sm" data-action="backToCurrent">${back}${I.arrow}</button></div>`;
  }

  function viewHunt(anim) {
    const stop = shownStop();
    let body;
    if (state.huntDone && !isRevisit()) body = viewHuntDone();
    else if (state.checkedIn[stop.locationId]) body = viewAtStop(stop, anim);
    else body = viewTravel(stop, anim);
    return `${viewTopbar()}<main class="screen">${viewRoute()}${viewRevisitBar()}${body}</main>`;
  }

  // ---------- sheets ----------
  function viewChallengeSheet(s) {
    const c = G.allChallenges[s.id];
    const stop = shownStop();
    const list = challengesOf(stop).filter((x) => !x.optional);
    const idx = list.findIndex((x) => x.challengeId === s.id);
    const fb = s.feedback;
    const locked = !!fb;
    let control = "";
    if (c.type === "multiple_choice") {
      control = `<div class="choices" role="radiogroup">${c.answers.map((a, i) => {
        let cls = s.selected === i ? "selected" : "";
        if (locked) { if (a === c.correctAnswer) cls = "correct"; else if (s.selected === i) cls = "wrong"; }
        return `<button class="choice ${cls}" role="radio" aria-checked="${s.selected === i}" data-action="select" data-i="${i}" ${locked ? "disabled" : ""}><span class="radio"></span>${esc(a)}</button>`;
      }).join("")}</div>`;
    } else if (c.type === "text" && c.answerType === "year") {
      const [y0, y1] = SCORING.yearRange;
      const years = []; for (let y = y0; y <= y1; y++) years.push(y);
      control = `<div class="wheel-wrap ${fb && fb.kind === "bad" ? "wrong" : ""}"><div class="wheel-band"></div><div class="wheel" id="wheel" data-y0="${y0}" ${locked ? 'data-locked="1"' : ""} tabindex="0" aria-label="Pick a year">${years.map((y) => `<div class="${String(y) === String(s.input) ? "on" : ""}">${y}</div>`).join("")}</div></div>`;
    } else if (c.type === "text") {
      control = `<input id="answer" class="textinput ${fb && fb.kind === "bad" ? "wrong" : ""}" type="text" autocomplete="off" placeholder="Type your answer" value="${esc(s.input)}" ${locked ? "disabled" : ""} enterkeyhint="done">`;
    } else {
      control = s.photo
        ? `<div class="photo-preview"><img src="./assets/img/team-photo.webp" alt="Your photo"></div>`
        : `<button class="photo-drop" data-action="takePhoto"><img src="./assets/img/ghosts-camera.png" alt="">Open camera</button>`;
    }
    let feedback = "";
    if (fb) {
      const cls = fb.kind === "ok" ? "ok" : fb.kind === "bad" ? "bad" : "neutral";
      const icon = fb.kind === "ok" ? I.check : fb.kind === "skipped" ? I.flag : I.x;
      feedback = `<div class="feedback ${cls}" role="status">${icon}<span>${esc(fb.text)}</span>${fb.points != null ? `<span class="pts">${fb.points > 0 ? "+" : ""}${fb.points}</span>` : ""}</div>`;
    }
    const hasNext = list.some((x) => !resolved(x.challengeId));
    let actions = "";
    if (!fb) {
      actions = `<button class="btn primary" data-action="submit">${c.type === "photo" ? "Submit photo" : "Submit answer"}</button>
        <div class="helper">
          ${c.hint && !s.hint ? `<button class="linkbtn" data-action="useHint">${I.bulb.replace("<svg", '<svg style="width:16px;height:16px;vertical-align:-3px"')} Use a hint (−${SCORING.hintCost} pts)</button>` : "<span></span>"}
          <button class="linkbtn" data-action="skipChallenge">Skip this one</button>
        </div>`;
    } else {
      actions = (hasNext
        ? `<button class="btn primary" data-action="nextChallenge">Next challenge${I.arrow}</button>`
        : `<button class="btn primary" data-action="closeSheet">Done</button>`)
        + (fb.kind === "bad" ? `<div class="helper" style="justify-content:center"><button class="btn ghost sm" data-action="retry">Try again</button></div>` : "");
    }
    return `
      <div class="sheet-head">
        <span class="kind">${c.optional ? "Optional bonus" : kindLabel[c.type]}<b>${c.points} pts</b></span>
        ${idx >= 0 ? `<span class="q-progress">${idx + 1} / ${list.length}</span>` : ""}
        <button class="iconbtn" data-action="closeSheet" aria-label="Close">${I.x}</button>
      </div>
      <div class="sheet-body">
        <h2>${esc(c.question)}</h2>
        ${control}
        ${s.hint && c.hint ? `<div class="hintbox">Hint: ${esc(c.hint)}</div>` : ""}
        ${feedback}
        <div class="actions">${actions}</div>
      </div>`;
  }

  const FAQ = () => [
    [`How does a Let's Roam ${event} work?`, `Your team walks a route of ${STOPS.length} stops in order. At each one you check in on this screen, read the story, and try the challenges if you like. When you're ready, tap Next stop and the app walks you to the next one.`],
    ["Do we have to do the challenges?", "No. Checking in is what moves you forward. Challenges are extra points and extra fun. Skip any, come back to any, nothing you skip costs points."],
    ["The Check in button is greyed out.", "It turns on by itself when your phone is within about 50 m of the stop. Walk a little closer or wait a few seconds for the GPS. If a place is closed or you can't reach it, use \"This stop is closed\" below and you keep your points."],
    ["Can we go back to an earlier stop?", "Yes. Tap any completed stop in the bar under the title. You'll see a \"Back to Stop\" button to return to where you left off."],
    ["Is there a time limit?", IS_TIMED ? `This ${event} has ${G.timerLimitMinutes} minutes. The clock at the top shows what's left and turns red in the last ten. Running out just ends the ${event}; you keep everything you earned.` : `No. Take as long as you like.`],
    ["How do points work?", `<ul class="rules">${SCORING.rules.map(([k, v]) => `<li><span>${esc(k)}</span><b class="${v.startsWith("-") || v.startsWith("0") ? "neg" : ""}">${esc(v)}</b></li>`).join("")}</ul>`],
    ["What if we get lost?", "Tap Directions on the stop card for a map of the whole route, or open it in your phone's Maps app."],
    ["Something is wrong with the app.", "Use Chat with support below. A real person answers during tour hours."]
  ];
  function viewHelpSheet() {
    return `
      <div class="sheet-head"><span class="kind">Info &amp; help</span><button class="iconbtn" data-action="closeSheet" aria-label="Close">${I.x}</button></div>
      <div class="sheet-body">
        <h2 style="margin-top:0">${esc(G.huntName)}</h2>
        <p class="lore" style="margin-top:0">${STOPS.length} stops · about ${STOPS.reduce((n, x) => n + x.walkMinutes, 0)} min of walking${IS_TIMED ? ` · ${G.timerLimitMinutes} min limit` : ""}. Check in at each stop, enjoy the story, do the challenges you like, and tap Next stop.</p>
        <h3 class="sheet-h3">Questions</h3>
        <div class="faq">${FAQ().map(([qq, aa]) => `<details><summary>${esc(qq)}<span class="chev">${I.chevron}</span></summary>${aa.startsWith("<ul") ? aa : `<p>${aa}</p>`}</details>`).join("")}</div>
        <div class="help-actions">
          <button class="btn secondary" data-action="openSkipStop">${I.flag}This stop is closed</button>
          <button class="btn ghost" data-action="support">${I.help}Chat with support</button>
        </div>
      </div>`;
  }

  function viewSkipStopSheet() {
    const stop = currentStop(); const next = nextStop();
    return `
      <div class="sheet-head"><span class="kind">Skip this stop</span><button class="iconbtn" data-action="closeSheet" aria-label="Close">${I.x}</button></div>
      <div class="sheet-body">
        <h2>Skip ${esc(stop.name)}?</h2>
        <p class="lore" style="margin-top:0">You keep every point you have earned. ${next ? `The next stop is <b>${esc(next.name)}</b>, ${next.walkMinutes} min away.` : `This is the last stop, so skipping it ends the ${event}.`}</p>
        <div class="actions">
          <button class="btn dark" data-action="skipStop">${I.flag}Skip and move on</button>
          <button class="btn ghost" data-action="closeSheet">Keep going here</button>
        </div>
      </div>`;
  }

  let sheetWasOpen = false;
  function viewSheet() {
    const s = state.sheet;
    const wasOpen = sheetWasOpen; sheetWasOpen = !!s;
    if (!s) return "";
    const inner = s.type === "challenge" ? viewChallengeSheet(s) : s.type === "help" ? viewHelpSheet() : viewSkipStopSheet();
    const still = wasOpen ? "still" : "";
    return `<div class="scrim ${still}" data-action="closeSheet"></div><div class="sheet ${still}" role="dialog" aria-modal="true"><div class="grab"></div><div class="sheet-inner ${wasOpen ? "swap" : ""}">${inner}</div></div>`;
  }

  // ---------- map ----------
  const PINS = [[70, 300], [190, 200], [150, 330], [110, 420], [330, 480]]; // stylised, not geo-accurate
  function viewMap() {
    const cur = state.stopIdx;
    const stop = currentStop();
    const path = PINS.map((p, i) => `${i ? "L" : "M"}${p[0]} ${p[1]}`).join(" ");
    const you = state.arrived ? PINS[cur] : (PINS[cur - 1] || [40, 360]);
    const blocks = [];
    for (let y = 40; y < 800; y += 90) for (let x = -20; x < 460; x += 100) blocks.push(`<rect x="${x + 8}" y="${y + 8}" width="84" height="74" rx="6" fill="#E3E6DE"/>`);
    return `
      <div class="mapview">
        <div class="map-top"><button class="pill" data-action="showHunt">${I.arrow.replace("<svg", '<svg style="transform:rotate(180deg)"')}Back to hunt</button><span class="spacer" style="flex:1"></span><span class="pill">${I.map}Offline map</span></div>
        <svg class="map" viewBox="0 0 430 800" preserveAspectRatio="xMidYMid slice" aria-label="Map of the route">
          <rect width="430" height="800" fill="#EEF0EA"/>
          ${blocks.join("")}
          <path d="M-20 120 Q 200 100 460 140" stroke="#C9D6E8" stroke-width="26" fill="none"/>
          <path d="${path}" stroke="#fff" stroke-width="8" fill="none" stroke-linejoin="round"/>
          <path d="${path}" stroke="#E87722" stroke-width="4" fill="none" stroke-dasharray="1 9" stroke-linecap="round" stroke-linejoin="round"/>
          <g class="you" style="transform-box:fill-box"><circle cx="${you[0]}" cy="${you[1]}" r="18" fill="#53A6C4"/></g>
          <circle cx="${you[0]}" cy="${you[1]}" r="8" fill="#53A6C4" stroke="#fff" stroke-width="3"/>
          ${PINS.map((p, i) => {
            const st = state.stopStatus[STOPS[i].locationId];
            const fill = st ? "#6AAEAA" : i === cur ? "#E87722" : "#2D2D2D";
            const r = i === cur ? 16 : 13;
            return `<g><circle cx="${p[0]}" cy="${p[1]}" r="${r}" fill="${fill}" stroke="#fff" stroke-width="3"/><text class="pin-label" x="${p[0]}" y="${p[1] + 4}" text-anchor="middle">${st === "done" ? "✓" : i + 1}</text></g>`;
          }).join("")}
        </svg>
        <div class="map-card">
          <div class="meta" style="margin-bottom:2px"><span>Stop ${cur + 1} of ${STOPS.length}</span></div>
          <h3>${esc(stop.name)}</h3>
          <div class="meta"><span>${I.walk}${stop.walkMinutes} min walk</span><span class="dot"></span><span>${esc(stop.address)}</span></div>
          <div class="btn-row"><button class="btn secondary" data-action="directions">${I.nav}Open in Maps</button><button class="btn primary" data-action="showHunt">Back to hunt</button></div>
        </div>
      </div>`;
  }

  function viewToast() {
    if (!state.toast) return "";
    return `<div class="toast" role="status">${I[state.toast.icon] || ""}${esc(state.toast.text)}</div>`;
  }

  // ---------- render ----------
  const root = document.getElementById("app");
  function render() {
    const scrollEl = root.querySelector(".screen");
    const scrollTop = scrollEl ? scrollEl.scrollTop : 0;
    const anim = state.anim; state.anim = null;
    root.innerHTML = viewHunt(anim) + (state.view === "map" ? viewMap() : "") + viewSheet() + viewToast();
    const s2 = root.querySelector(".screen"); if (s2) s2.scrollTop = scrollTop;
    if (anim === "checkin") setTimeout(() => { const el = root.querySelector(".challenges"); if (el) el.scrollIntoView({ behavior: "smooth", block: "start" }); }, 900);
    if (anim === "stopdone") setTimeout(() => { const el = root.querySelector(".all-done"); if (el) el.scrollIntoView({ behavior: "smooth", block: "center" }); }, 150);
    const input = root.querySelector("#answer"); if (input && !input.disabled && state.sheet && !state.sheet.feedback) input.focus({ preventScroll: true });
    fitReadMore();
    const wheel = root.querySelector("#wheel");
    if (wheel) {
      const y0 = Number(wheel.dataset.y0); const h = 44;
      const st = state.sheet;
      const start = Number(st.input) || 1900;
      wheel.scrollTop = (start - y0) * h;
      if (!st.input) st.input = String(start);
      const cur = wheel.children[start - y0]; if (cur) cur.classList.add("on");
      if (!wheel.dataset.locked) {
        let t = null;
        wheel.addEventListener("scroll", () => {
          const idx = Math.round(wheel.scrollTop / h);
          const y = y0 + idx;
          if (String(y) !== st.input) { st.input = String(y); wheel.querySelectorAll(".on").forEach((el) => el.classList.remove("on")); const el = wheel.children[idx]; if (el) el.classList.add("on"); }
        }, { passive: true });
      }
    }
    updateDemoBar();
  }

  // "Read more" only when the description is actually clipped
  function fitReadMore() {
    root.querySelectorAll(".lore.clamp").forEach((el) => {
      const btn = el.nextElementSibling;
      if (btn && btn.dataset.action === "toggleLore") btn.hidden = el.scrollHeight <= el.clientHeight + 1;
    });
  }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitReadMore);

  root.addEventListener("click", (e) => {
    const el = e.target.closest("[data-action]");
    if (!el || el.disabled) return;
    const fn = A[el.dataset.action];
    if (!fn) return;
    fn(el.dataset.id != null ? el.dataset.id : el.dataset.i != null ? Number(el.dataset.i) : undefined);
    render();
  });
  root.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && e.target.id === "answer") { A.submit(); render(); }
    if (e.key === "Escape" && state.sheet) { A.closeSheet(); render(); }
  });

  // timer: update the pill in place, no full re-render
  if (IS_TIMED) setInterval(() => {
    if (state.huntDone || state.timeLeft <= 0) return;
    state.timeLeft -= 1;
    const t = document.getElementById("time");
    if (t) { t.textContent = fmtTime(state.timeLeft); t.parentElement.classList.toggle("low", state.timeLeft < 600); }
  }, 1000);

  // ---------- demo bar (outside the phone) ----------
  const demoArrive = document.getElementById("demo-arrive");
  const demoReset = document.getElementById("demo-reset");
  function updateDemoBar() {
    if (!demoArrive) return;
    demoArrive.disabled = state.arrived || state.huntDone;
    demoArrive.textContent = state.huntDone ? "Hunt finished" : state.arrived ? `At ${currentStop().name}` : `Simulate GPS: arrive at ${currentStop().name}`;
  }
  if (demoArrive) demoArrive.addEventListener("click", () => { A.simulateArrive(); render(); });
  if (demoReset) demoReset.addEventListener("click", () => { A.reset(); render(); });

  render();
})();
