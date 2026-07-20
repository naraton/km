"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AuthWrapper({
  children,
  requireAuth = true,
}: {
  children: React.ReactNode;
  requireAuth?: boolean;
}) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const token = localStorage.getItem("token");
    const expiresAt = localStorage.getItem("expiresAt");
    const hasToken = !!token;

    // ถ้ายังไม่ login
    if (requireAuth && !hasToken) {
      router.push("/");
      return;
    }

    // ถ้ามี token แต่หมดอายุแล้ว
    if (expiresAt && Date.now() > parseInt(expiresAt, 10)) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("expiresAt");
      //alert('Session หมดอายุแล้ว กรุณาเข้าสู่ระบบใหม่อีกครั้ง');
      router.push("/");

      return;
    }

    // ถ้าอยู่หน้า login แต่มี token
    if (!requireAuth && hasToken) {
      router.push("/km-dashboard");
      return;
    }

    // (optional) แสดงเวลาที่เหลือ
    if (expiresAt) {
      const remaining = (parseInt(expiresAt, 10) - Date.now()) / 3600000;
      //console.log(`⏰ Token จะหมดอายุในอีก ${remaining.toFixed(2)} ชั่วโมง`);
    }
  }, [requireAuth, router]);

  if (!mounted) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-600"></div>
        <p className="text-gray-600 text-lg ms-2"> Loading...</p>
      </div>
    );
  }

  return <>{children}</>;
}
