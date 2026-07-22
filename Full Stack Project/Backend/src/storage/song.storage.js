const path = require("path");
const fs = require("fs");
const multer = require("multer");
const mongoose = require("mongoose");

// If ImageKit credentials are provided in .env, files are uploaded to ImageKit (cloud).
// Otherwise (default), files are stored locally in Backend/uploads and served statically.
const useImageKit = Boolean(
    process.env.IMAGEKIT_PUBLIC_KEY &&
    process.env.IMAGEKIT_PRIVATE_KEY &&
    process.env.IMAGEKIT_URL_ENDPOINT
);

const uploadsDir = path.join(__dirname, "..", "..", "uploads");
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// ImageKit needs the raw file buffer, local storage can stream straight to disk.
const multerStorage = useImageKit
    ? multer.memoryStorage()
    : multer.diskStorage({
        destination: (req, file, cb) => cb(null, uploadsDir),
        filename: (req, file, cb) => {
            const uniqueName = `${new mongoose.Types.ObjectId().toString()}${path.extname(file.originalname)}`;
            cb(null, uniqueName);
        }
    });

const upload = multer({
    storage: multerStorage,
    limits: {
        files: 20,
        fileSize: 20 * 1024 * 1024 // 20MB per file
    }
});

let imagekit = null;
if (useImageKit) {
    const ImageKit = require("imagekit");
    imagekit = new ImageKit({
        publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
        privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
        urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT
    });
}

// Persists an already-multer-processed file and returns a publicly reachable URL.
async function saveFile(file) {
    if (useImageKit) {
        const result = await imagekit.upload({
            file: file.buffer,
            folder: "moody-player-songs",
            fileName: `${new mongoose.Types.ObjectId().toString()}${path.extname(file.originalname)}`
        });
        return result.url;
    }

    // Local disk: multer already wrote the file to /uploads, just build its URL.
    const base = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 8000}`;
    return `${base}/uploads/${file.filename}`;
}

module.exports = { upload, saveFile, useImageKit };
