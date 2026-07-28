export async function POST(request) {
  try {
    // 1. รับค่า JSON จาก Next.js Client
    const body = await request.json(); 

    // 2. ส่งต่อไปยัง Laravel เป็น JSON
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/insertCommentsArticle`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify(body),
    });

    const resultText = await res.text();
    let result;

    try {
      result = JSON.parse(resultText);
    } catch {
      result = { message: resultText };
    }

    return Response.json(result, { status: res.status });

  } catch (error) {
    console.error("Comment API error:", error);
    return Response.json(
      { error: "Failed to process comment" },
      { status: 500 }
    );
  }
}