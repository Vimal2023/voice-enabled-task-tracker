import { useState } from "react";

export function VoiceRecorder({ onResult, disabled }) {
  const [recording, setRecording] = useState(false);

  const handleStart = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech Recognition is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-IN";        // Hinglish friendly
    recognition.continuous = false;
    recognition.interimResults = false;

    setRecording(true);
    recognition.start();

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setRecording(false);
      onResult(transcript);            // 🔥 callback to parent
    };

    recognition.onerror = () => setRecording(false);
    recognition.onend = () => setRecording(false);
  };

  const handleClick = () => {
    if (!recording) {
      handleStart();
    } else {
      setRecording(false);
    }
  };

  return (
    <button
      className={`btn ${recording ? "btn-danger" : "btn-primary"}`}
      onClick={handleClick}
      disabled={disabled}
    >
      {recording ? "Listening..." : "🎤 Record Voice"}
    </button>
  );
}
