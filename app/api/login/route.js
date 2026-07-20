import jwt from 'jsonwebtoken';

export async function POST(request) {
  const body = await request.json(); // รับ id_card และ password จาก frontend

  try {
    // 🔹 ส่งข้อมูลไปยัง Laravel API
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id_card: body.id_card,
        password: body.password,
      }),
    });

    const data = await res.json();

    // 🔹 ถ้า login ไม่สำเร็จ (จาก Laravel)
    if (!res.ok) {
      return new Response(
        JSON.stringify({ message: data.message || 'Login failed' }),
        { status: res.status, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 🔹 สร้าง JWT ของฝั่ง Next.js (เพื่อใช้จัดการ session ฝั่ง frontend)
    const token = jwt.sign(
      {
        id: data.user.id,
        id_card: data.user.id_card,
        email: data.user.email,
      },
      process.env.JWT_SECRET, // ตั้งไว้ใน .env.local เช่น JWT_SECRET=mysecret
      { expiresIn: '8h' } // อายุ 8 ชั่วโมง
    );

    // 🔹 ส่ง token + user กลับไปที่ frontend
    return new Response(
      JSON.stringify({
        user: data.user,
        token: data.token, // token ของ Laravel (ถ้ามี)
        //next_token: token,         // token ของ Next.js (JWT)
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (err) {
    console.error('API Error:', err);
    return new Response(
      JSON.stringify({ error: 'Failed to connect to Laravel API' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
