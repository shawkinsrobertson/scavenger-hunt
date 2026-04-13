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
    "to your birthday scavenger hunt! \n\n Follow the clues and your trusty compass and embark on a treasure-filled adventure.",
  celebrationMessage:
    " Happy birthday, my love! The hunt is over, but the day is just beginning. I'll see you on the Kingston shore.",
  stops: [
    {
      id: "stop-1",
      location: { lat: 47.78434001539218, lng: -122.37309446653053 }, // ← cherry tree at Hickman Park  
      clues: {
        far: "Your adventure begins close to home. Seek out a place of open ground and old growth.",
        medium: "You are close. Among all, one stands apart.",
        near: "The old cherry tree is within reach. Look deeply for what she carries.",
      },
      arrivalMessage: "Well found. Keep the mug close. Do not open the envelope until you are safely at your next stop.",
      confirmLabel: "I have found the treasure.",
      confirmedMessage: "A keen eye and a brave heart. The hunt is off to a great start!",
      arrivalRadius: 40,
    },
    {
      id: "stop-2",
      location: { lat: 47.81022358987489, lng: -122.37540156130295 }, // ← crumpet shop for bkfst and tea
      clues: {
        far: "Ride north. Your destination you have passed more mornings than you can count.",
        medium: "Continue west at the library.",
        near: "The savory aromas tempt you to a door tucked away from the street.",
      },
      arrivalMessage: "Give them your name — something is waiting for you behind the counter. Open your letter when you are ready.",
      confirmLabel: "Treasure in hand.",
      confirmedMessage: "A hearty breakfast for an intrepid adventurer!",
      arrivalRadius: 30,
    },
    {
      id: "stop-3",
      location: { lat: 47.81309511190101, lng: -122.38424472655709 }, // ← edmonds to kingston ferry terminal
      clues: {
        far: "Inside the envelope you will find passage across the water. Make your way on foot.",
        medium: "Salt in the air now. The sound of the water is close. You are nearly there.",
        near: "The terminal is ahead. Board when you are ready.",
      },
      arrivalMessage: "Cross the water. Someone is waiting on the other side.",
      confirmLabel: "From land to see, the treasure is with me.",
      confirmedMessage: "Welcome aboard!",
      arrivalRadius: 35,
    },
  ],
};
