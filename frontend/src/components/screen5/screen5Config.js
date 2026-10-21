// Shared config for Screen5 (colors, grid, static data for right panel)

// Left table column layout - header and every row use the same value
export const GRID_COLS = "1.05fr 3.3fr 1.5fr 1.45fr";

// Room badge colors (picked by room number so the same room always has the same color)
export const ROOM_COLORS = [
  ["#16a34a", "#15803d"],  // green
  ["#2563eb", "#1d4ed8"],  // blue
  ["#C2410C", "#061A33"],  // red 
  
//   ["#7c3aed", "#6d28d9"],
//   ["#0d9488", "#0f766e"],
];
export const NO_ROOM_COLORS = ["#334155", "#1e293b"];

// Status labels - change text here only
export const STATUS = {
  calling: "CALLING",     // voice is announcing right now (highlight)
  called: "Now Serving",       // token assigned, not announcing right now
  empty: "No Patient Yet",
  info: "INFO",           // announcement row (GENDER === "message")
};

// ---------- STATIC DATA (replace with API later) ----------
export const MEDICAL_ASSISTANT_STATIC = [
  { id: 1, patient: "Sara Khan", token: "V 006", assistant: "2" },
  { id: 2, patient: "Bilal Ahmed", token: "V 014", assistant: "3" },
  { id: 3, patient: "Ayesha Farooq", token: "V 016", assistant: "4" },
];

export const SKIPPED_STATIC = [
  { id: 1, patient: "8", token: "V 012", doctor: "Dr. Majid Khan", room: "2" },
  { id: 2, patient: "2", token: "V 014", doctor: "Dr. Moin Agahi", room: "3" },
  { id: 3, patient: "4", token: "V 016", doctor: "Dr. Tanzeem", room: "2" },
  { id: 4, patient: "2", token: "V 021", doctor: "Dr. Rashid Mehmood", room: "3" },
  { id: 5, patient: "5", token: "V 023", doctor: "Dr. Zahid Qadri", room: "1" },
];