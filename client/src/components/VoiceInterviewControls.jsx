import { useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";

const getSpeechRecognition = () => {
  if (typeof window === "undefined") {
    return null;
  }

  return window.SpeechRecognition || window.webkitSpeechRecognition || null;
};

const VoiceInterviewControls = ({ questionText, disabled = false, onTranscript }) => {
  const recognitionRef = useRef(null);
  const [autoRead, setAutoRead] = useState(false);
  const [listening, setListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState("");

  const speechSupported = typeof window !== "undefined" && "speechSynthesis" in window;
  const recognitionSupported = useMemo(() => Boolean(getSpeechRecognition()), []);

  const stopSpeaking = () => {
    if (speechSupported) {
      window.speechSynthesis.cancel();
    }
  };

  const speakQuestion = () => {
    if (!speechSupported) {
      toast.error("Text-to-speech is not supported in this browser");
      return;
    }

    if (!questionText) {
      return;
    }

    stopSpeaking();
    const utterance = new SpeechSynthesisUtterance(questionText);
    utterance.rate = 0.95;
    utterance.pitch = 1;
    window.speechSynthesis.speak(utterance);
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setListening(false);
    setInterimTranscript("");
  };

  const startListening = () => {
    const Recognition = getSpeechRecognition();

    if (!Recognition) {
      toast.error("Voice-to-text is not supported in this browser");
      return;
    }

    if (disabled) {
      return;
    }

    const recognition = new Recognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onstart = () => {
      setListening(true);
      setInterimTranscript("");
      toast.success("Listening for your answer");
    };

    recognition.onerror = (event) => {
      setListening(false);
      setInterimTranscript("");
      toast.error(event.error === "not-allowed" ? "Microphone permission was denied" : "Could not capture voice input");
    };

    recognition.onend = () => {
      setListening(false);
      setInterimTranscript("");
    };

    recognition.onresult = (event) => {
      let finalText = "";
      let interimText = "";

      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const transcript = event.results[index][0].transcript;

        if (event.results[index].isFinal) {
          finalText += transcript;
        } else {
          interimText += transcript;
        }
      }

      if (finalText.trim()) {
        onTranscript(finalText.trim());
      }

      setInterimTranscript(interimText.trim());
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  useEffect(() => {
    if (autoRead && questionText) {
      speakQuestion();
    }

    return () => {
      stopSpeaking();
    };
  }, [autoRead, questionText]);

  useEffect(
    () => () => {
      recognitionRef.current?.abort();
      stopSpeaking();
    },
    []
  );

  return (
    <section className="panel p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-bold text-ink">Voice interview tools</p>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            Listen to the question aloud, then dictate your answer into the response box.
          </p>
        </div>
        <label className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-slate-300 text-brand focus:ring-brand"
            checked={autoRead}
            onChange={(event) => setAutoRead(event.target.checked)}
            disabled={!speechSupported}
          />
          Auto-read questions
        </label>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <button type="button" className="secondary-button min-h-10" onClick={speakQuestion} disabled={!speechSupported}>
          Speak Question
        </button>
        <button type="button" className="secondary-button min-h-10" onClick={stopSpeaking} disabled={!speechSupported}>
          Stop Voice
        </button>
        <button
          type="button"
          className={listening ? "danger-button min-h-10" : "primary-button min-h-10"}
          onClick={listening ? stopListening : startListening}
          disabled={!recognitionSupported || disabled}
        >
          {listening ? "Stop Dictation" : "Start Dictation"}
        </button>
      </div>

      {(!speechSupported || !recognitionSupported) && (
        <p className="mt-3 text-xs leading-5 text-amber-700">
          Voice features depend on browser support. Chrome and Edge usually support dictation best.
        </p>
      )}

      {interimTranscript && (
        <p className="mt-3 rounded-xl bg-blue-50 px-3 py-2 text-sm leading-6 text-brand">
          Listening: {interimTranscript}
        </p>
      )}
    </section>
  );
};

export default VoiceInterviewControls;
