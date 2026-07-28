import { NextResponse } from "next/server";

export async function POST(request, { params }) {
  try {
    const { id } = await params;
    const { userId } = await request.json(); // รับ userId จาก Frontend

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/toggleLike`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        articleId: id,
        userId: userId,
      }),
    });

    const resultText = await res.text();
    let result;

    try {
      result = JSON.parse(resultText);
    } catch {
      result = { message: resultText };
    }

    return NextResponse.json(result, { status: res.status });
  } catch (error) {
    console.error("Toggle like error:", error);
    return NextResponse.json(
      { error: "Failed to toggle like status" },
      { status: 500 }
    );
  }
}