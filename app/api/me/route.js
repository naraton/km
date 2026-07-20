export async function GET(request) {
  try {
    const token = request.headers.get("authorization");

    if (!token) {
      return Response.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/me`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: token,
        },
        cache: "no-store",
      }
    );

    const data = await res.json();
    return Response.json(data, { status: res.status });

  } catch (err) {
    console.error(err);
    return Response.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}
