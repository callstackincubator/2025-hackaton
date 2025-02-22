"use client"

import * as React from "react"
import { Mic, MicOff } from "lucide-react"
import { Message, CreateMessage, ChatRequestOptions } from "ai"
import { toast } from "sonner"
import {
  LiveConnectionState,
  LiveTranscriptionEvent,
  LiveTranscriptionEvents,
  useDeepgram,
} from "@/app/context/DeepgramContextProvider"
import {
  MicrophoneEvents,
  MicrophoneState,
  useMicrophone,
} from "@/app/context/MicrophoneContextProvider"

export function ListeningMicButton({ append, chatId }: { 
  append: (message: Message | CreateMessage, chatRequestOptions?: ChatRequestOptions) => Promise<string | null | undefined>
  chatId: string 
}) {
  const [isActive, setIsActive] = React.useState(false)
  const [currentPhrase, setCurrentPhrase] = React.useState("")
  const [isSetup, setIsSetup] = React.useState(false)
  const [pendingTranscript, setPendingTranscript] = React.useState("")
  const lastTranscriptTime = React.useRef<number>(Date.now())
  const transcriptTimeoutRef = React.useRef<NodeJS.Timeout>()
  const silenceCheckInterval = React.useRef<NodeJS.Timeout>()
  
  const { connection, connectToDeepgram, connectionState, error } = useDeepgram()
  const { setupMicrophone, microphone, startMicrophone, microphoneState, stopMicrophone } = useMicrophone()

  const sendTranscriptToAI = React.useCallback((text: string) => {
    if (text.trim()) {
      console.log('Sending to AI:', text)
      append({
        id: Date.now().toString(),
        role: 'user',
        content: text.trim()
      })
      setPendingTranscript("")
      if (transcriptTimeoutRef.current) {
        clearTimeout(transcriptTimeoutRef.current)
      }
    }
  }, [append])

  // Check for silence
  const startSilenceDetection = React.useCallback(() => {
    if (silenceCheckInterval.current) {
      clearInterval(silenceCheckInterval.current)
    }

    silenceCheckInterval.current = setInterval(() => {
      const timeSinceLastTranscript = Date.now() - lastTranscriptTime.current
      if (timeSinceLastTranscript > 2000 && pendingTranscript) { // 2 seconds of silence
        console.log('Silence detected, sending transcript')
        sendTranscriptToAI(pendingTranscript)
      }
    }, 500) // Check every 500ms
  }, [pendingTranscript, sendTranscriptToAI])

  const stopSilenceDetection = React.useCallback(() => {
    if (silenceCheckInterval.current) {
      clearInterval(silenceCheckInterval.current)
    }
  }, [])

  React.useEffect(() => {
    if (!isSetup) {
      setupMicrophone()
      setIsSetup(true)
    }
  }, [setupMicrophone, isSetup])

  React.useEffect(() => {
    if (microphoneState === MicrophoneState.Ready && !connection) {
      connectToDeepgram({
        model: "nova-2",
        interim_results: true,
        smart_format: true,
        endpointing: 2500,
        filler_words: true
      })
      toast.success("Microphone connected successfully")
    }
  }, [microphoneState, connectToDeepgram, connection])

  const onTranscript = React.useCallback((data: LiveTranscriptionEvent) => {
    const { is_final: isFinal } = data
    const transcript = data.channel.alternatives[0].transcript
    console.log('Transcript:', transcript)
    if (transcript) {
      setCurrentPhrase(transcript)
      lastTranscriptTime.current = Date.now()
      
      if (isFinal) {
        console.log('Final transcript:', transcript)
        setPendingTranscript(prev => {
          const newTranscript = prev ? `${prev} ${transcript}` : transcript
          return newTranscript
        })
      }
    }
  }, [])

  const safeStartMicrophone = async () => {
    try {
      if (microphone && microphone.state !== 'recording') {
        await startMicrophone()
      }
    } catch (error) {
      console.error('Error starting microphone:', error)
      toast.error("Failed to start microphone", {
        description: "Please check your microphone permissions and try again."
      })
    }
  }

  React.useEffect(() => {
    if (!microphone || !connection || !isActive) {
      stopSilenceDetection()
      if (!isActive && pendingTranscript) {
        sendTranscriptToAI(pendingTranscript)
      }
      return
    }

    const onData = (e: BlobEvent) => {
      if (e.data.size > 0) {
        connection?.send(e.data)
      }
    }

    if (connectionState === LiveConnectionState.OPEN) {
      connection.addListener(LiveTranscriptionEvents.Transcript, onTranscript)
      microphone.addEventListener(MicrophoneEvents.DataAvailable, onData)
      safeStartMicrophone()
      startSilenceDetection()
    }

    return () => {
      connection?.removeListener(LiveTranscriptionEvents.Transcript, onTranscript)
      microphone?.removeEventListener(MicrophoneEvents.DataAvailable, onData)
      if (!isActive && microphone?.state === 'recording') {
        stopMicrophone()
      }
      stopSilenceDetection()
    }
  }, [connection, microphone, connectionState, isActive, sendTranscriptToAI, pendingTranscript, onTranscript, stopMicrophone, safeStartMicrophone, startSilenceDetection, stopSilenceDetection])

  const toggleListening = React.useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    setIsActive(prev => {
      if (!prev) {
        if (microphone?.state !== 'recording') {
          startMicrophone()
          toast.success("Listening...", {
            description: "Speak clearly into your microphone"
          })
        }
      } else {
        if (microphone?.state === 'recording') {
          stopMicrophone()
          // Immediately send any pending transcript when stopping
          if (pendingTranscript) {
            sendTranscriptToAI(pendingTranscript)
          }
          toast.info("Stopped listening")
        }
      }
      return !prev
    })
  }, [startMicrophone, stopMicrophone, microphone, pendingTranscript, sendTranscriptToAI])

  const isDisabled = React.useMemo(() => {
    return connectionState !== LiveConnectionState.OPEN || 
           microphoneState === MicrophoneState.NotSetup
  }, [connectionState, microphoneState])

  React.useEffect(() => {
    if (error) {
      console.error('Deepgram error:', error)
      toast.error("Connection Error", {
        description: "Failed to connect to speech service. Please try again."
      })
    }
  }, [error])

  React.useEffect(() => {
    return () => {
      // Cleanup on unmount
      stopSilenceDetection()
      if (transcriptTimeoutRef.current) {
        clearTimeout(transcriptTimeoutRef.current)
      }
    }
  }, [stopSilenceDetection])

  return (
    <button
      className={`
        relative w-20 h-20 rounded-full transition-all duration-500 ease-in-out
        ${isActive ? "bg-red-500 text-white scale-110 shadow-lg" : "bg-white text-gray-600 hover:bg-gray-100"}
        hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-50
        border border-gray-300
      `}
      onClick={toggleListening}
      disabled={isDisabled}
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
      <span className="sr-only">{isActive ? "Deactivate" : "Activate"} microphone</span>
    </button>
  )
}

