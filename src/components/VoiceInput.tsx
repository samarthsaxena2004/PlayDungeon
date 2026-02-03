"use client";
import SpeechRecognition, {
  useSpeechRecognition
} from "react-speech-recognition";

export default function VoiceInput({
  onCommand
}: { onCommand: (t: string) => void }) {

  const { transcript, listening, resetTranscript } =
    useSpeechRecognition();

  return (
    <div className="border-2 p-3 mt-4">
      <button
        onClick={() =>
          SpeechRecognition.startListening()
        }
        className="mr-2"
      >
        🎙 {listening ? "Listening..." : "Speak"}
      </button>

      {transcript && (
        <div
          className="mt-2 cursor-pointer"
          onClick={() => {
            onCommand(transcript);
            resetTranscript();
          }}
        >
          → {transcript}
        </div>
      )}
    </div>
  );
}
