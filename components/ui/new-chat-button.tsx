"use client";
import * as React from "react";
import { MicOff } from "lucide-react";
import { Message, CreateMessage, ChatRequestOptions } from "ai";

export function ListeningMicButton({
  append,
  chatId,
}: {
  append: (
    message: Message | CreateMessage,
    chatRequestOptions?: ChatRequestOptions
  ) => Promise<string | null | undefined>;
  chatId: string;
}) {
  const [isActive, setIsActive] = React.useState(false);
  const transcript = useSpeechToText(isActive, setIsActive);

  React.useEffect(() => {
    if (isActive && transcript) {
      append({ content: transcript, role: "user" });
    }
  }, [transcript, isActive]);

  return (
    <button
      className={`
        relative w-20 h-20 rounded-full transition-all duration-500 ease-in-out
        ${
          isActive
            ? "bg-red-500 text-white scale-110 shadow-lg"
            : "bg-white text-gray-600 hover:bg-gray-100"
        }
        hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-50
        border border-gray-300
      `}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsActive(!isActive);
      }}
    >
      {!isActive && (
        <div className="absolute inset-0 flex items-center justify-center">
          <MicOff className="w-10 h-10" />
        </div>
      )}
      {isActive && (
        <>
          <div className="absolute inset-0 rounded-full animate-ping-slow opacity-30 bg-red-300" />
          <div className="absolute inset-[-10px] rounded-full border-4 border-red-500 opacity-30 animate-ping-slow" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-8 flex justify-around items-end">
              {[1, 2, 3, 4, 5].map((i) => (
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
  const [transcript, setTranscript] = React.useState<string>("");

  React.useEffect(() => {
    if (!isActive) {
      setTranscript("");
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

    // breaks Safari
    // recognition.onend = () => {
    //   console.log("Speech recognition ended");
    //   setActive(false);
    // };

    recognition.onresult = (event: any) => {
      let finalTranscript = "";
      let isFinal = false;
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        finalTranscript += event.results[i][0].transcript;
        isFinal = event.results[i].isFinal;
      }
      if (isFinal) {
        setTranscript(finalTranscript);
      }
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

  return transcript;
};
