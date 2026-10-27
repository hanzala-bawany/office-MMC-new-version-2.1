// Vitals station (Python FastAPI server: `python -m api`).
// Use the IP of the PC that has the scale / camera attached, NOT "localhost",
// because Medical Assistants open the React app from other PCs too.
export const STATION_URL = "http://192.168.100.18:8000"; // <-- change XX to the station PC's IP

// Only if the server was started with API_KEY=... (leave "" otherwise).
export const STATION_API_KEY = "";
