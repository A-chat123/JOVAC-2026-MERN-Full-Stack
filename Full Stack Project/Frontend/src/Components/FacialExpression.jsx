import React, { useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";
import { motion } from "framer-motion";
import { Pause, Play } from "lucide-react";
import { MOODS } from "../constants/moods";

export default function FacialExpression() {
  const videoRef = useRef();
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [expression, setExpression] = useState("Not detected");
  const [songs, setSongs] = useState([]);
  const [cameraError, setCameraError] = useState(null);
  const [noFaceDetected, setNoFaceDetected] = useState(false);

  // Reads VITE_API_URL from Frontend/.env — change it there if your backend runs elsewhere
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

  async function fetchSongs() {
    try {
      const data = await fetch(`${API_URL}/app/songs`);
      const data1 = await data.json();
      setSongs(data1.all || []);
    } catch (err) {
      console.error("Failed to fetch songs:", err);
    }
  }

  useEffect(() => {
    fetchSongs();
  }, []);

  const filterSongs = songs.filter((el) => el.mood === expression);

  useEffect(() => {
    const loadModels = async () => {
      const MODEL_URL = "/models";
      await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
      await faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL);
      setModelsLoaded(true);
      startVideo();
    };
    const startVideo = () => {
      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then((stream) => {
          if (videoRef.current) videoRef.current.srcObject = stream;
        })
        .catch((err) => {
          console.error("Camera access failed:", err);
          setCameraError(
            err.name === "NotAllowedError"
              ? "Camera permission denied. Please allow camera access and reload the page."
              : "Could not access the camera. Make sure a camera is connected and not in use by another app."
          );
        });
    };
    loadModels();
  }, []);

  // face-api.js can detect more expressions than we have moods for
  // (fearful, disgusted, surprised). Map those to the closest mood we
  // actually have songs for, instead of silently returning an empty list.
  const EXPRESSION_TO_MOOD = {
    fearful: "sad",
    disgusted: "angry",
    surprised: "happy"
  };

  const handleClick = async () => {
    if (!modelsLoaded) return;
    const detection = await faceapi
      .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
      .withFaceExpressions();

    if (!detection) {
      setNoFaceDetected(true);
      return;
    }

    setNoFaceDetected(false);
    const sorted = Object.entries(detection.expressions).sort(
      (a, b) => b[1] - a[1]
    );
    const topExpression = sorted[0][0];
    const mappedMood = MOODS.includes(topExpression)
      ? topExpression
      : EXPRESSION_TO_MOOD[topExpression] || "neutral";
    setExpression(mappedMood);
  };

  // ---- SINGLE audio element ke liye ----
  const audioRef = useRef(null);
  const [currentId, setCurrentId] = useState(null); // kaunsa song load hai
  const [isPlaying, setIsPlaying] = useState(false); // audio events se sync

  const handlePlay = (song) => {
    const audio = audioRef.current;
    if (!audio) return;

    if (currentId === song._id) {
      // same song → toggle
      if (audio.paused) audio.play().catch(() => {});
      else audio.pause();
    } else {
      // dusra song → src switch phir play
      audio.src = song.audioFile;
      setCurrentId(song._id);
      audio.play().catch(() => {});
    }
  };

  return (
    <div className="min-h-screen bg-[#faf9ff] px-10 py-6">
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-lg font-semibold mb-8 flex items-center gap-2"
      >
        🎧 Moody Player
      </motion.header>

      <div className="flex gap-12 items-center">
        {cameraError ? (
          <div className="w-[320px] h-[240px] rounded-xl bg-red-50 border border-red-200 flex items-center justify-center text-center text-sm text-red-600 p-4">
            {cameraError}
          </div>
        ) : (
          <motion.video
            ref={videoRef}
            autoPlay
            muted
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="w-[320px] h-[240px] rounded-xl object-cover shadow-md"
          />
        )}

        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-md"
        >
          <h2 className="text-2xl font-bold mb-2">Live Mood Detection</h2>
          <p className="text-gray-600 mb-4">
            Your current mood is being analyzed in real-time. Enjoy music
            tailored to your feelings.
          </p>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleClick}
            disabled={!modelsLoaded || !!cameraError}
            className="bg-purple-600 text-white px-6 py-2 rounded-full shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {modelsLoaded ? "Start Listening" : "Loading models…"}
          </motion.button>

          <p className="mt-3 text-sm text-gray-700">
            <span className="font-semibold">Detected Mood:</span> {expression}
          </p>
          {noFaceDetected && (
            <p className="mt-1 text-sm text-red-600">
              No face detected — make sure your face is visible and try again.
            </p>
          )}
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-12 max-w-3xl"
      >
        <h3 className="text-xl font-semibold mb-4">Recommended Tracks</h3>

        {filterSongs.length === 0 && (
          <p className="text-sm text-gray-500 mb-4">
            {songs.length === 0
              ? "No songs available yet — ask an admin to upload some at /wp-admin."
              : `No songs tagged "${expression}" yet. Try detecting your mood again or ask an admin to add more songs.`}
          </p>
        )}

        <div className="space-y-3">
          {filterSongs.map((song) => {
            const playingThis = currentId === song._id && isPlaying;
            return (
              <motion.div
                key={song._id}
                whileHover={{ scale: 1.02 }}
                className="flex items-center justify-between bg-white px-4 py-3 rounded-lg shadow-sm"
              >
                <div>
                  <p className="font-medium">{song.title}</p>
                  <p className="text-sm text-gray-500">{song.artist}</p>
                </div>

                <motion.button
                  onClick={() => handlePlay(song)}
                  whileTap={{ scale: 0.9 }}
                  whileHover={{ scale: 1.1 }}
                  className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center text-white shadow-lg"
                >
                  {playingThis ? <Pause size={28} /> : <Play size={28} />}
                </motion.button>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Ek hi audio — loop ke BAHAR */}
      <audio
        ref={audioRef}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
      />
    </div>
  );
}