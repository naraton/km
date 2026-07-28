import { NextResponse } from "next/server";

export async function POST(request, { params }) {
  try {
    const { id } = await params; // รับ id จาก URL /api/articles/123/view

    // ส่งต่อไปยัง Backend Laravel
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/viewArticles`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id: id }), // ส่ง id ไปให้ Laravel
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
    console.error("Update view error:", error);
    return NextResponse.json(
      { error: "Failed to update view count" },
      { status: 500 }
    );
  }
}