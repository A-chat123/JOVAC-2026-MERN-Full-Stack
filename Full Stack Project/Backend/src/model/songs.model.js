const mongoose = require("mongoose");
const MOODS = require("../constants/moods");

const songsSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    artist: {
        type: String,
        required: true,
        trim: true
    },
    mood:{
        type: String,
        required: true,
        enum: {
            values: MOODS,
            message: `mood must be one of: ${MOODS.join(", ")}`
        }
    },
    audioFile:{
        type:String,
        required:true
    }
})

const songModel=mongoose.model("songs",songsSchema);
module.exports=songModel