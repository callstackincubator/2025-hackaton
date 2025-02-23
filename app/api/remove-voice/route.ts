import { auth } from "@/app/(auth)/auth";
import { deleteVoicesForUser } from "@/lib/db/queries";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const session = await auth();
    const user_id = session?.user?.id ?? "";
    console.log('user_id', user_id)
    const voice = await deleteVoicesForUser(user_id);
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
