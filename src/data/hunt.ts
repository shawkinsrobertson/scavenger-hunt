export interface Location {
  lat: number;
  lng: number;
}

export interface HuntStop {
  id: string;
  /** Clue hints shown at different distances */
  clues: {
    far: string;    // > 500m
    medium: string; // 100–500m
    near: string;   // < 100m
  };
  /** Shown once the user is within `arrivalRadius` meters */
  arrivalMessage: string;
  /** What the user is confirming they picked up */
  confirmLabel: string;
  /** Message shown after confirmation, before navigating to next stop */
  confirmedMessage: string;
  location: Location;
  /** Meters — default 30 */
  arrivalRadius?: number;
}

export interface Hunt {
  title: string;
  welcomeMessage: string;
  celebrationMessage: string;
  stops: HuntStop[];
}

// ─── Edit this to configure your hunt ──────────────────────────────────────

export const hunt: Hunt = {
  title: "Welcome, Julie",
  welcomeMessage:
    "to your very own birthday scavenger hunt! 🎉\n\nYou'll visit a few special spots to collect your surprises. Follow the clues at each step — your phone's GPS will guide you.\n\nWhen you're ready, head out to find your first stop!",
  celebrationMessage:
    "🎉 Happy Birthday! 🎂\n\nYou found everything! Hope today is as wonderful as you are. Enjoy your treats — you've earned them! 🥳",
  stops: [
    {
      id: "stop-1",
      location: { lat: 47.78214937388619, lng: -122.36755760481087 }, // ← home coords  for testing app
      clues: {
        far: "Your first surprise is hiding somewhere you love to grab a coffee. Head that direction!",
        medium: "Getting warmer! Think of the place with the green awning you pass most mornings.",
        near: "Almost there — look for the spot near the entrance.",
      },
      arrivalMessage: "You made it! 🎁 Look for a small package waiting for you near the door.",
      confirmLabel: "I picked up my treat!",
      confirmedMessage: "Woohoo! 🎊 On to the next one…",
      arrivalRadius: 40,
    },
    {
      id: "stop-2",
      location: { lat: 37.7751, lng: -122.4183 }, // ← replace with real coords
      clues: {
        far: "Next up: somewhere green and peaceful where you like to sit and read.",
        medium: "You're close to the park. Head toward the main bench area.",
        near: "Look around — your next surprise is very close by.",
      },
      arrivalMessage: "Found it! 🌿 Check under the bench for your next gift.",
      confirmLabel: "Got it!",
      confirmedMessage: "One more to go! 🎈",
      arrivalRadius: 30,
    },
    {
      id: "stop-3",
      location: { lat: 47.81063329568221, lng: -122.37444287197067 }, // ← stillhouse coffee coords
      clues: {
        far: "Last stop — think of the place that smells like fresh bread and good things.",
        medium: "Almost there! The bakery should be coming into view.",
        near: "Right around the corner now!",
      },
      arrivalMessage: "You made it to the last stop! 🥐 Ask inside for a special order under your name.",
      confirmLabel: "I got my final surprise!",
      confirmedMessage: "That's everything! 🎂 Time to celebrate!",
      arrivalRadius: 35,
    },
  ],
};
