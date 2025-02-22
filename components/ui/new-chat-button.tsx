"use client";
import * as React from "react";
import { MicOff } from "lucide-react";
import { Message, CreateMessage, ChatRequestOptions } from "ai";

export function ListeningMicButton({
  append,
  onStart,
}: {
  append: (
    message: Message | CreateMessage,
    chatRequestOptions?: ChatRequestOptions
  ) => Promise<string | null | undefined>;
  onStart?: () => void;
}) {
  const [isActive, setIsActive] = React.useState(false);
  const [isActuallyListening, setIsActuallyListening] = React.useState(false);
  const hasStartedRef = React.useRef(false);
  const { transcript, isFinal } = useSpeechToText(isActuallyListening, setIsActuallyListening);
  const lastWord = transcript.split(" ")[transcript.split(" ").length - 1];

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const newIsActive = !isActive;
    setIsActive(newIsActive);

    if (newIsActive) {
      if (!hasStartedRef.current && onStart) {
        hasStartedRef.current = true;
        // Start visual feedback immediately
        await onStart();
        // Start actual listening after onStart (audio playback) completes
        setIsActuallyListening(true);
      } else {
        setIsActuallyListening(true);
      }
    } else {
      setIsActuallyListening(false);
    }
  };

  React.useEffect(() => {
    if (isActuallyListening && isFinal && transcript) {
      append({ content: transcript, role: "user" });
    }
  }, [isActuallyListening, isFinal, transcript, append]);

  return (
    <button
      className={`
        relative w-20 h-20 rounded-full transition-all duration-500 ease-in-out
        ${
          isActive
            ? "bg-violet-500 text-white scale-110 shadow-lg"
            : "bg-white text-gray-600 hover:bg-gray-100"
        }
        hover:scale-105 focus:outline-none focus:ring-2 focus:ring-violet-400 focus:ring-opacity-50
      `}
      onClick={handleClick}
    >
      {!isActive && (
        <div className="absolute inset-0 flex items-center justify-center">
          <MicOff className="w-10 h-10" />
        </div>
      )}
      {isActive && (
        <>
          <div className="absolute inset-0 rounded-full animate-ping bg-violet-400 opacity-20" />
          <div className="flex justify-center items-center gap-1 mt-1">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="w-1.5 bg-white rounded-full animate-equalizer"
                style={{
                  height: `${Math.random() * 100}%`,
                  animationDelay: `${i * 0.2}s`,
                }}
              />
            ))}
          </div>
        </>
      )}
      <span className="sr-only">
        {isActive ? "Deactivate" : "Activate"} microphone
      </span>
    </button>
  );
}

/**
 *
 * Returns the ready to use transcript once it's considered final. Otherwise, it returns empty string.
 */
const useSpeechToText = (isActive: boolean, setActive: Function) => {
  const [result, setResult] = React.useState<{
    transcript: string;
    isFinal: boolean;
  }>({
    transcript: "",
    isFinal: false,
  });

  React.useEffect(() => {
    if (!isActive) {
      setResult({ transcript: "", isFinal: false });
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onstart = () => {
      console.log("Speech recognition started");
    };

    recognition.onerror = (event: Event) => {
      console.error("Speech recognition error:", event);
      setActive(false);
    };

    recognition.onend = () => {
      console.log("Speech recognition ended");
    };

    recognition.onresult = (event: any) => {
      let transcript = "";
      let isFinal = false;
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        transcript += event.results[i][0].transcript;
        isFinal = event.results[i].isFinal;
      }
      setResult({ transcript, isFinal });
    };

    recognition.start();

    return () => {
      recognition.stop();
      recognition.onstart = null;
      recognition.onerror = null;
      recognition.onend = null;
      recognition.onresult = null;
    };
  }, [isActive, setActive]);

  return result;
};
