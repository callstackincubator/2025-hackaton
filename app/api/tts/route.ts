import { getLatestVoice } from "@/lib/db/queries"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { text, voice } = await request.json()
    const latestVoice = await getLatestVoice()
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${latestVoice?.voice_id ?? voice}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "xi-api-key": process.env.ELEVENLABS_API_KEY!,
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_monolingual_v1",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.5,
        },
      }),
    })

    console.log("TTS response", response)

    if (!response.ok) {
      throw new Error("Failed to generate speech")
    }

    const audioBuffer = await response.arrayBuffer()

    return new NextResponse(audioBuffer, {
      headers: {
        "Content-Type": "audio/mpeg",
      },
    })
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Failed to generate speech" }, { status: 500 })
  }
} 