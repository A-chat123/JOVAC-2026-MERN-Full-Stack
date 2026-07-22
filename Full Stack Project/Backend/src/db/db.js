const mongoose = require("mongoose");

async function connectDB() {
    // Falls back to a local MongoDB instance if MONGODB_URL isn't set in .env
    const uri = process.env.MONGODB_URL || "mongodb://127.0.0.1:27017/moody_player";

    try {
        await mongoose.connect(uri);
        console.log(`✅ Connected to MongoDB -> ${mongoose.connection.name}`);
    } catch (err) {
        console.error("❌ MongoDB connection failed:", err.message);
        console.error(
            "   Make sure MongoDB is running locally, or set MONGODB_URL in Backend/.env to a valid MongoDB Atlas connection string."
        );
        process.exit(1);
    }

    mongoose.connection.on("disconnected", () => {
        console.warn("⚠️  MongoDB disconnected");
    });
}

module.exports = connectDB;
