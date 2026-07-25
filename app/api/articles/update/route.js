export async function POST(request) {
  try {
    const body = await request.json();

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/updateArticles`, {
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
    console.error("Add record error:", error);
    return Response.json({ error: "Failed to add record" }, { status: 500 });
  }
}
