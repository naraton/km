export async function POST(request) {
  try {
    const body = await request.json();

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cancelIssue`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    let data;
    const text = await res.text();
    try {
      data = JSON.parse(text);
    } catch {
      data = { message: text || "No JSON response" };
    }

    return Response.json(data, { status: res.status });
  } catch (error) {
    console.error("Insert issue error:", error);
    return Response.json({ error: "Failed to insert issue" }, { status: 500 });
  }
}
