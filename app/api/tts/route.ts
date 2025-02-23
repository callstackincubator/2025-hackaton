import { getLatestVoice } from "@/lib/db/queries";
import { auth } from "@/app/(auth)/auth";
import { NextResponse } from "next/server";
const https = require("https");

export async function POST(request: Request) {
  try {
    const { text, voice } = await request.json();
    const session = await auth();
    const user_id = session?.user?.id ?? "";
    const latestVoice = await getLatestVoice(user_id);

    const options = {
      hostname: "api.elevenlabs.io",
      path: `/v1/text-to-speech/${latestVoice?.voice_id ?? voice}/stream`,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "xi-api-key": process.env.ELEVENLABS_API_KEY!,
      },
    };

    const requestBody = JSON.stringify({
      text,
      model_id: "eleven_monolingual_v1",
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.5,
      },
    });

    const stream = new ReadableStream({
      async start(controller) {
        const req = https.request(options, (res: any) => {
          if (res.statusCode !== 200) {
            controller.error(new Error("Failed to generate speech"));
            return;
          }

          res.on("data", (chunk: any) => {
            controller.enqueue(chunk);
          });

          res.on("end", () => {
            controller.close();
          });
        });

        req.on("error", (e: any) => {
          controller.error(e);
        });

        req.write(requestBody);
        req.end();
      },
    });

    return new NextResponse(stream, {
      headers: {
        "Content-Type": "audio/mpeg",
      },
    });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Failed to generate speech" },
      { status: 500 }
    );
  }
}
