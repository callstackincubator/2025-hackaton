import { getUser, saveVoice } from "@/lib/db/queries";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const formData = await request.formData(); // Extract blobUrl from request body

    const name = formData.get("name");
    const file = formData.get("file");

    if (!name || !file) {
      return NextResponse.json(
        { error: "Missing required fields: name and file" },
        { status: 400 }
      );
    }

    const apiFormData = new FormData();
    apiFormData.append("name", name.toString());
    apiFormData.append("files", file);

    const apiResponse = await fetch("https://api.elevenlabs.io/v1/voices/add", {
      method: "POST",
      headers: {
        "xi-api-key": process.env.ELEVENLABS_API_KEY!,
      },
      body: apiFormData,
    });

    if (!apiResponse.ok) {
      const errorData = await apiResponse.json();
      console.error("ElevenLabs API error:", errorData);
      throw new Error(errorData.message || "Failed to add voice");
    }

    const data = await apiResponse.json();

    saveVoice(data.voice_id);

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: (error as any).message || "Failed to add voice" },
      { status: 500 }
    );
  }
}
