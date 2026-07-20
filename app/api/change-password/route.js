export async function POST(request) {
  try {
    const token = request.headers.get("authorization");
    const body = await request.json();

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token,
      },
      body: JSON.stringify(body),
    });

    const text = await res.text();
    let data;
    try { data = JSON.parse(text) } catch { data = { message: text } }

    return Response.json(data, { status: res.status });

  } catch (err) {
    return Response.json({ message: 'Server error' }, { status: 500 });
  }
}
