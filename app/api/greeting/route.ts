import { NextResponse } from "next/server"
import { auth } from "@/app/(auth)/auth"
import { getMemories } from "@/lib/db/queries"
import { generateText } from "ai"
import { myProvider } from "@/lib/ai/models"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const memories = await getMemories({ user_id: session.user.id })
    
    const { text } = await generateText({
      model: myProvider.languageModel('default'),
      prompt: `You are a friendly AI assistant. Create a warm, personal greeting for the user based on their memories. Make it feel natural and conversational. Here are the user's memories for context: ${memories.map(memory => memory.content).join(', ')} Very short and concise. e.g. "Hey! How are you? Make it one sentence.`,
    })

    return NextResponse.json({ greeting: text })
  } catch (error) {
    console.error("Error generating greeting:", error)
    return NextResponse.json({ error: "Failed to generate greeting" }, { status: 500 })
  }
} 