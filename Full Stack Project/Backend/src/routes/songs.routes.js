const express = require("express");
const { createSong, allSongs } = require("../controller/songs.controller");
const { upload } = require("../storage/song.storage");
const adminAuth = require("../middleware/adminAuth");

const router = express.Router();

router.post("/song", adminAuth, upload.array("audioFile"), createSong);
router.get("/songs", allSongs);

module.exports = router;
