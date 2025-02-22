"use client";
import * as React from "react";
import { MicOff } from "lucide-react";
import { Message, CreateMessage, ChatRequestOptions } from "ai";

export function ListeningMicButton({
  append,
}: {
  append: (
    message: Message | CreateMessage,
    chatRequestOptions?: ChatRequestOptions
  ) => Promise<string | null | undefined>;
}) {
  const [isActive, setIsActive] = React.useState(false);
  const { transcript, isFinal } = useSpeechToText(isActive, setIsActive);
  const lastWord = transcript.split(" ")[transcript.split(" ").length - 1];

  React.useEffect(() => {
    if (isActive && isFinal && transcript) {
      append({ content: transcript, role: "user" });
    }
  }, [isActive, isFinal, transcript]);

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
          <div className="absolute inset-0 rounded-full animate-ping-slow opacity-30 bg-purple-300" />
          <div className="absolute inset-[-10px] rounded-full border-4 border-violet-500 opacity-30 animate-ping-slow" />
          <div
            className="absolute inset-0 rounded-full animate-gradient bg-gradient-to-r from-blue-500 via-blue-500 to-indigo-500 opacity-50"
            style={{ backgroundSize: "200%" }}
          ></div>
          <div
            className="absolute inset-1 rounded-full animate-gradient bg-gradient-to-r blur-lg from-blue-500 via-blue-500 to-indigo-500"
            style={{ backgroundSize: "200%" }}
          ></div>
          <div
            className="absolute inset-0 rounded-full animate-gradient bg-gradient-to-r from-indigo-500 via-green-500 to-violet-500 opacity-50 rotate-180"
            style={{ backgroundSize: "300%" }}
          ></div>
          <div
            className="absolute inset-0 rounded-full animate-gradient bg-gradient-to-r from-teal-500 via-blue-500 to-cyan-500 opacity-50 rotate-90"
            style={{ backgroundSize: "100%" }}
          ></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-8 flex justify-around items-end">
              <div className="absolute w-8 h-8 bg-white rounded-full blur-lg" />
              <div className="absolute w-8 h-8 bg-white rounded-full opacity-70 blur-lg" />
            </div>
          </div>
          <div
            className="absolute top-[-55px] left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-teal-500 via-blue-500 to-violet-500 text-white p-1 rounded"
            style={{ backgroundSize: "300%" }}
          >
            {!isFinal ? lastWord : ""}
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
