const express = require("express");
const { createSong, allSongs } = require("../controller/songs.controller");
const { upload } = require("../storage/song.storage");

const router = express.Router();

router.post("/song", upload.array("audioFile"), createSong);
router.get("/songs", allSongs);

module.exports = router;
