import { getLatestVoice } from "@/lib/db/queries";
import { auth } from "@/app/(auth)/auth";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await auth();
    const user_id = session?.user?.id ?? "";
    const voice = await getLatestVoice(user_id);
    console.log('voice', voice)
    if (!voice) {
      return NextResponse.json(
        { error: "No voice found" },
        { status: 404 }
      );
    }
    console.log(voice)
    return NextResponse.json(voice, { status: 200 });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: (error as any).message || "Failed to add voice" },
      { status: 500 }
    );
  }
}
