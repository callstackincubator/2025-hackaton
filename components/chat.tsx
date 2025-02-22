"use client";

import type { Attachment, Message } from "ai";
import { useChat } from "@ai-sdk/react";
import { useEffect, useState, useRef } from "react";
import useSWR, { useSWRConfig } from "swr";
import React from "react";
import Image from "next/image";

import { ChatHeader } from "@/components/chat-header";
import type { Vote } from "@/lib/db/schema";
import { fetcher, generateUUID } from "@/lib/utils";

import { Artifact } from "./artifact";
import { MultimodalInput } from "./multimodal-input";
import { Messages } from "./messages";
import { VisibilityType } from "./visibility-selector";
import { useArtifactSelector } from "@/hooks/use-artifact";
import { toast } from "sonner";
import { ListeningMicButton } from "./ui/new-chat-button";
import JourneyButton from "./ui/start-chat";

export function Chat({
  id,
  initialMessages,
  selectedChatModel,
  selectedVisibilityType,
  isReadonly,
}: {
  id: string;
  initialMessages: Array<Message>;
  selectedChatModel: string;
  selectedVisibilityType: VisibilityType;
  isReadonly: boolean;
}) {
  const { mutate } = useSWRConfig();
  const audioRef = useRef<HTMLAudioElement>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const initialLoadRef = useRef<boolean>(true);

  useEffect(() => {
    const fetchGreeting = async () => {
      if (initialLoadRef.current && messages.length === 0) {
        initialLoadRef.current = false
        try {
          const response = await fetch('/api/greeting')
          if (!response.ok) throw new Error('Failed to fetch greeting')
          
          const data = await response.json()

          const audioResponse = await fetch('/api/tts', {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ text: data.greeting, voice: "21m00Tcm4TlvDq8ikWAM" }), // TODO: make this dynamic, replace with the voice of the user
          });
          // call tts
          const audioBlob = await audioResponse.blob();
          const url = URL.createObjectURL(audioBlob);
          setAudioUrl(url);
          
          // Play audio immediately
          if (audioRef.current) {
            audioRef.current.src = url;
          }
        } catch (error) {
          console.error('Error fetching greeting:', error)
          toast.error('Failed to generate greeting')
        }
      }
    }

    fetchGreeting()
  }, [])

  const {
    messages,
    setMessages,
    handleSubmit,
    input,
    setInput,
    append,
    status,
    stop,
    reload,
  } = useChat({
    id,
    body: { id, selectedChatModel: selectedChatModel },
    initialMessages,
    experimental_throttle: 100,
    sendExtraMessageFields: true,
    generateId: generateUUID,
    onFinish: async (message) => {
      mutate("/api/history");
      const response = await fetch("/api/tts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: message.content, voice: "21m00Tcm4TlvDq8ikWAM" }), // TODO: make this dynamic, replace with the voice of the user
      });
      
      if (!response.ok) {
        console.error(response);
        toast.error("Failed to generate speech");
        return;
      }

      const audioBlob = await response.blob();
      const url = URL.createObjectURL(audioBlob);
      setAudioUrl(url);
      
      // Play audio immediately
      if (audioRef.current) {
        audioRef.current.src = url;
        audioRef.current.play().catch(e => {
          console.error("Audio playback failed:", e);
          toast.error("Failed to play audio");
        });
      }
    },
    onError: (error) => {
      toast.error("An error occurred, please try again!");
    },
  });

  const { data: votes } = useSWR<Array<Vote>>(
    `/api/vote?chatId=${id}`,
    fetcher
  );

  const [attachments, setAttachments] = useState<Array<Attachment>>([]);
  const isArtifactVisible = useArtifactSelector((state) => state.isVisible);
  const isLoading = status === "streaming";

  // Cleanup audio URL when component unmounts
  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  const [showJourney, setShowJourney] = useState(messages.length === 0);

  return (
    <>
      <div className="flex flex-col min-w-0 h-dvh bg-background">
        
        <ChatHeader
          chatId={id}
          selectedModelId={selectedChatModel}
          selectedVisibilityType={selectedVisibilityType}
          isReadonly={isReadonly}
        />

        <audio 
          ref={audioRef} 
          className="hidden" // Hide the audio element but keep it in the DOM
          onError={() => toast.error("Audio playback failed")}
        />

        <div className="flex flex-col h-full">
          {showJourney ? (
          <div className="flex flex-col justify-center items-center h-full">
            <Image src="/logo_landing.png" alt="Logo" width={200} height={200} />
            <JourneyButton text="Press to start!" onClick={() => {
              if (audioRef.current) {
                audioRef.current.play().catch(e => {
                  console.error("Audio playback failed:", e);
                  toast.error("Failed to play audio");
                });
              }
              setTimeout(() => {
                setShowJourney(false);
              }, audioRef.current?.duration || 0);
            }}/>
          </div>
          ) : (
            <>
          {messages.length > 0 ? (
            <>
              <Messages
                chatId={id}
                isLoading={isLoading}
                votes={votes}
                messages={messages}
                setMessages={setMessages}
                reload={reload}
                isReadonly={isReadonly}
                isArtifactVisible={isArtifactVisible}
              />
              <div className="flex justify-center items-center mt-4 mb-4">
                <ListeningMicButton append={append} />
              </div>
            </>
          ) : (
            <div className="flex justify-center items-center h-full">
              <ListeningMicButton append={append} />
            </div>
          )}
        <form className="flex mx-auto px-4 bg-background pb-4 md:pb-6 gap-2 w-full md:max-w-3xl">
          {!isReadonly && (
            <MultimodalInput
              chatId={id}
              input={input}
              setInput={setInput}
              handleSubmit={handleSubmit}
              isLoading={isLoading}
              stop={stop}
              attachments={attachments}
              setAttachments={setAttachments}
              messages={messages}
              setMessages={setMessages}
              append={append}
            />
          )}
        </form>
          </>
          )}
        </div>

      </div>

      <Artifact
        chatId={id}
        input={input}
        setInput={setInput}
        handleSubmit={handleSubmit}
        isLoading={isLoading}
        stop={stop}
        attachments={attachments}
        setAttachments={setAttachments}
        append={append}
        messages={messages}
        setMessages={setMessages}
        reload={reload}
        votes={votes}
        isReadonly={isReadonly}
      />
    </>
  );
}


