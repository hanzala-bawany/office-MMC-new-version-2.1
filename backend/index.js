const express = require("express");
require("./database.js");
const cors = require("cors");
const path = require("path");
const { baseDir } = require("./paths.js");
const dotenv = require("dotenv")
dotenv.config({ path: path.join(baseDir, ".env"), quiet: true });
const http = require("http");
const { Server } = require("socket.io");
// Routes
const authRoutes = require("./routes/authRoutes.js");
const facultyRoutes = require("./routes/facultyRoutes.js");
const screen2ImagesRoutes = require("./routes/screen2ImagesRoutes.js");
const screen3ImagesRoutes = require("./routes/screen3ImagesRoutes.js");
const screen4ImagesRoutes = require("./routes/screen4ImagesRoutes.js");
const screen1ImagesRoutes = require("./routes/screen1ImagesRoutes.js");
const doctorRoutes = require("./routes/doctorRoutes.js");
const screenRoutes = require("./routes/screenRoutes.js");
const headlineRoutes = require("./routes/headlinesRoutes.js");
const opdRoutes = require("./routes/opd.Routes.js");
const poolPromise = require("./database.js");
const voiceRoutes = require("./routes/voiceRoutes.js")
const pronounceRoutes = require("./routes/pronounceRoutes");
const patientLoginRoutes = require("./routes/patientLogin.Routes.js")
const displayScreenRoutes = require("./routes/screenDisplayRoutes.js");
const consultantRoutes = require("./routes/consultantRoutes");
const consultantFacultyRoutes = require("./routes/consultantFacultyRoutes");
const { initSocket } = require("./utills/socket.js");
const receptionistRoutes = require("./routes/receptionistRoutes.js");
const partialPaymentRoutes = require("./routes/partialpayment.js");
const { startOpdWatcher } = require("./utills/opdPatientsWatcher.js");
const routes = require("./routes/index.js");



const app = express();
const PORT = 3000;

// 👇 HTTP server
const server = http.createServer(app);

// 👇 Socket serveror ye mera index.js e
const io = initSocket(server);;
app.set("io", io);

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: "*",
    credentials: true,
  }),
);

// Default route
app.get("/", (req, res) => {
  res.send("Hello Server Response he.");
});

// Routes
app.use("/assets", express.static(path.join(baseDir, "assets")));
app.use("/api/auth", authRoutes);
app.use("/api/faculty", facultyRoutes);
app.use("/api/screen2images", screen2ImagesRoutes);
app.use("/api/screen3images", screen3ImagesRoutes);
app.use("/api/screen4images", screen4ImagesRoutes);
app.use("/api/screen1images", screen1ImagesRoutes);
app.use("/api/doctor", doctorRoutes);
app.use("/api/screen", screenRoutes);
app.use("/api/headline", headlineRoutes);
app.use("/api/opd", opdRoutes);
app.use("/api/voice", voiceRoutes);
app.use("/api/pronounce", pronounceRoutes);
app.use("/api/patient", patientLoginRoutes);
app.use("/api/admin", displayScreenRoutes);
app.use("/api/consultants", consultantRoutes);
app.use("/api/consultant", consultantFacultyRoutes);
app.use("/api/receptionist", receptionistRoutes);
app.use("/api/partialPayment", partialPaymentRoutes);
app.use("/api", routes);





// ✅ Server Start
server.listen(PORT, async () => {
  await startOpdWatcher(io);
  console.log(`🚀 Server running on ${PORT}`);
});

module.exports = app;










