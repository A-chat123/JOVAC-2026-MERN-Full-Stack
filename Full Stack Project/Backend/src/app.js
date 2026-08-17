const express = require("express");
const cors = require("cors");
const path = require("path");
const songRouter = require("./routes/songs.routes");

const app = express();

// FRONTEND_URL can be a single origin or a comma-separated list
// (e.g. "http://localhost:5173,https://myapp.vercel.app")
const allowedOrigins = (process.env.FRONTEND_URL || "http://localhost:5173")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        // Allow non-browser requests (no Origin header, e.g. curl/Postman)
        if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        callback(new Error(`CORS: origin "${origin}" is not allowed`));
    }
}));
app.use(express.json());

// Serves locally-uploaded audio files (used when ImageKit is not configured)
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

app.get("/", (req, res) => {
    res.json({ status: "ok", message: "Moody Player API is running" });
});

app.use("/app", songRouter);

// 404 handler
app.use((req, res) => {
    res.status(404).json({ message: "Route not found" });
});

// Central error handler (e.g. multer file-size errors, JSON parse errors)
app.use((err, req, res, next) => {
    console.error(err);
    res.status(err.status || 500).json({ message: err.message || "Something went wrong" });
});

module.exports = app;
