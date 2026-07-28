export async function POST(request) {
  try {
    const formData = await request.formData();  // ❗ ดึง FormData

    // ส่งต่อไป Laravel แบบ FormData ไม่ต้อง set headers
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/updateArticle`, {
      method: "POST",
      body: formData,
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
    console.error("Upload error:", error);
    return Response.json(
      { error: "Failed to upload" },
      { status: 500 }
    );
  }
}
