// Hunt content. Same shape as the current app's HUNT_DATA (game_v2.locations /
// allChallenges / challengeList) so this screen could read the existing payload.
// Fields added for the redesign are marked "NEW".
window.HUNT_DATA = {
  group: {
    info: {
      groupId: "offline-demo",
      teamName: "The Roaming Crew",
      huntType: "ghostTour",
      score: 0,
      groupPhoto: "./assets/img/team-photo.webp",
      huntStarted: true,
      huntIntroDone: true
    }
  },
  game_v2: {
    huntName: "Seattle Ghost Tour",
    timerStart: 1,
    timerLimitMinutes: 90,          // 0 = untimed. The redesign hides the clock when untimed.
    locationList: ["pike", "moore", "butterworth", "postalley", "underground"],
    locations: {
      pike: {
        locationId: "pike",
        name: "Pike Place Market",
        address: "85 Pike St, Seattle",
        lat: 47.6097, long: -122.3422,
        walkMinutes: 0, walkMiles: 0,                     // NEW: from the previous stop
        description: "Where the tour starts. The market has been open since 1907 and, some say, never fully closes: keep an eye out for a small woman in a bonnet who is not part of the tour.",
        photo: "./assets/img/stop-photo.jpg",
        points: 500,
        challengeList: ["pike-bell", "pike-photo", "pike-year"]
      },
      moore: {
        locationId: "moore",
        name: "Moore Theatre",
        address: "1932 2nd Ave, Seattle",
        lat: 47.6116, long: -122.3405,
        walkMinutes: 6, walkMiles: 0.3,
        description: "This vintage theatre stands as a monument to applause that never quite fades. Not all of the audience goes home.",
        photo: "./assets/img/stop-photo.jpg",
        points: 500,
        challengeList: ["moore-event", "moore-year", "moore-pose", "moore-contribute"]
      },
      butterworth: {
        locationId: "butterworth",
        name: "Butterworth Building",
        address: "1921 1st Ave, Seattle",
        lat: 47.6106, long: -122.3417,
        walkMinutes: 4, walkMiles: 0.2,
        description: "The city's oldest mortuary. Whispers linger over creaking brick as the air shivers with forgotten farewells.",
        photo: "./assets/img/stop-photo.jpg",
        points: 500,
        challengeList: ["bw-floors", "bw-elevator", "bw-photo"]
      },
      postalley: {
        locationId: "postalley",
        name: "Post Alley",
        address: "Post Alley at Stewart St, Seattle",
        lat: 47.6100, long: -122.3410,
        walkMinutes: 5, walkMiles: 0.25,
        description: "A narrow lane behind the market with a gum wall, a pub built into an old mortuary, and a barman who says the glasses move on their own.",
        photo: "./assets/img/stop-photo.jpg",
        points: 500,
        challengeList: ["pa-gum", "pa-pub", "pa-photo"]
      },
      underground: {
        locationId: "underground",
        name: "Pioneer Square",
        address: "Yesler Way & 1st Ave, Seattle",
        lat: 47.6019, long: -122.3340,
        walkMinutes: 12, walkMiles: 0.6,
        description: "Below the sidewalks is the original street level, sealed after the Great Fire of 1889. The tour ends where the old city was buried.",
        photo: "./assets/img/stop-photo.jpg",
        points: 500,
        challengeList: ["ps-fire", "ps-totem", "ps-teamphoto"]
      }
    },
    allChallenges: {
      // Pike Place Market
      "pike-bell": {
        challengeId: "pike-bell", locationId: "pike", type: "multiple_choice", name: "The Market Bell",
        question: "What rings out across the market every morning to open trading?",
        answers: ["A brass bell", "A fish horn", "A steam whistle"], correctAnswer: "A brass bell",
        hint: "It hangs by the main arcade entrance.", points: 100
      },
      "pike-photo": {
        challengeId: "pike-photo", locationId: "pike", type: "photo", name: "Under the Clock",
        question: "Take a team photo under the Public Market clock, everyone looking as haunted as possible.",
        points: 200
      },
      "pike-year": {
        challengeId: "pike-year", locationId: "pike", type: "text", name: "Opening Day",
        question: "Pike Place Market first opened in ____. Guess the year.",
        correctAnswer: "1907", hint: "It is older than the theatre at the next stop.", points: 100
      },
      // Moore Theatre
      "moore-event": {
        challengeId: "moore-event", locationId: "moore", type: "text", name: "Unfinished Business",
        question: "Not a show, nor a play, but an act done with spirits for those passed away. What event, left unfinished, stirred the uncanny here to stay?",
        correctAnswer: "seance", accept: ["seance", "séance", "a seance"], hint: "The answer is one word.", points: 100
      },
      "moore-year": {
        challengeId: "moore-year", locationId: "moore", type: "multiple_choice", name: "Opening Night",
        question: "This haunted theatre first opened its doors in which year?",
        answers: ["1907", "1919", "1928"], correctAnswer: "1907", hint: "Same year as the market.", points: 100
      },
      "moore-pose": {
        challengeId: "moore-pose", locationId: "moore", type: "photo", name: "Ghostly Applause",
        question: "Form a dramatic group pose in front of the marquee as if you are actors bowing to an invisible, ghostly audience.",
        points: 200
      },
      "moore-contribute": {
        challengeId: "moore-contribute", locationId: "moore", type: "photo", name: "Bonus: Fresh Photo", optional: true,   // NEW: optional
        question: "Help future hunters: take a clear photo of the theatre entrance from across the street.",
        points: 500
      },
      // Butterworth
      "bw-floors": {
        challengeId: "bw-floors", locationId: "butterworth", type: "multiple_choice", name: "Count the Floors",
        question: "How many floors does the Butterworth Building have?",
        answers: ["Three", "Five", "Seven"], correctAnswer: "Five", hint: "Count the rows of windows.", points: 100
      },
      "bw-elevator": {
        challengeId: "bw-elevator", locationId: "butterworth", type: "multiple_choice", name: "First of Its Kind",
        question: "The building had the first of these on the West Coast. What was it?",
        answers: ["An elevator", "A telephone", "A neon sign"], correctAnswer: "An elevator", hint: "It carried more than the living.", points: 100
      },
      "bw-photo": {
        challengeId: "bw-photo", locationId: "butterworth", type: "photo", name: "Last Goodbye",
        question: "Photo challenge: one team member waves a solemn farewell at the old front doors.",
        points: 200
      },
      // Post Alley
      "pa-gum": {
        challengeId: "pa-gum", locationId: "postalley", type: "text", name: "Sticky Situation",
        question: "The Gum Wall was declared a tourist attraction in ____. Guess the year.",
        correctAnswer: "1999", hint: "Just before the millennium.", points: 100
      },
      "pa-pub": {
        challengeId: "pa-pub", locationId: "postalley", type: "multiple_choice", name: "Pub With a Past",
        question: "Kells Irish Pub occupies the ground floor of which former business?",
        answers: ["A bank", "A mortuary", "A theatre"], correctAnswer: "A mortuary", hint: "You were just there.", points: 100
      },
      "pa-photo": {
        challengeId: "pa-photo", locationId: "postalley", type: "photo", name: "Alley Cats",
        question: "Photo: the whole team squeezed into the narrowest part of the alley.",
        points: 200
      },
      // Pioneer Square
      "ps-fire": {
        challengeId: "ps-fire", locationId: "underground", type: "multiple_choice", name: "The Great Fire",
        question: "What started the fire that burned the original city in 1889?",
        answers: ["A glue pot", "A lightning strike", "A gas lamp"], correctAnswer: "A glue pot", hint: "A cabinet maker had a bad day.", points: 100
      },
      "ps-totem": {
        challengeId: "ps-totem", locationId: "underground", type: "text", name: "Tall Tale",
        question: "The totem pole in the square was stolen from a village in what is now ____ (state).",
        correctAnswer: "alaska", hint: "North.", points: 100
      },
      "ps-teamphoto": {
        challengeId: "ps-teamphoto", locationId: "underground", type: "photo", name: "Survivors",
        question: "Final photo: the team celebrating that you made it out of the underground.",
        points: 200
      }
    }
  },
  // NEW: plain-language scoring rules shown in the help sheet. One source of truth
  // for the copy and the numbers.
  scoring: {
    checkIn: 500,
    hintCost: 25,
    triesPerQuestion: 2,
    rules: [
      ["Check in at a stop", "+500"],
      ["Trivia or fill-in question", "+100"],
      ["Photo challenge", "+200"],
      ["Bonus photo (optional)", "+500"],
      ["Use a hint", "-25"],
      ["Skip a challenge", "0, no penalty"],
      ["Skip a closed stop", "check-in points kept"]
    ]
  }
};
