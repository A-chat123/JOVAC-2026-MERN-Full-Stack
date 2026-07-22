const { saveFile } = require("../storage/song.storage");
const songModel = require("../model/songs.model");

const createSong = async (req, res) => {
    try {
        const { title, artist, mood } = req.body;
        const files = req.files;

        if (!title || !artist || !mood || !files || files.length === 0) {
            return res.status(400).json({
                message: "title, artist, mood and at least one audioFile are required"
            });
        }

        const created = [];
        for (const file of files) {
            const audioFile = await saveFile(file);
            const song = await songModel.create({ title, artist, mood, audioFile });
            created.push(song);
        }

        res.status(201).json({
            message: "Song Created",
            songs: created
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to create song", error: err.message });
    }
};

const allSongs = async (req, res) => {
    try {
        const all = await songModel.find().sort({ _id: -1 });
        res.json({
            message: "All Songs Fetched",
            all
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to fetch songs", error: err.message });
    }
};

module.exports = { createSong, allSongs };
