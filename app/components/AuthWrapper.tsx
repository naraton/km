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
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const expiresAt = localStorage.getItem("expiresAt");
    const now = Date.now();

    // 1. ตรวจสอบว่า Token หมดอายุแล้วหรือยัง
    const isExpired = expiresAt ? now > parseInt(expiresAt, 10) : false;

    if (isExpired) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("expiresAt");
    }

    const hasValidToken = !!token && !isExpired;

    // 2. เช็คเงื่อนไข Auth & Redirect
    if (requireAuth && !hasValidToken) {
      // ต้องการ Auth แต่ไม่มี Token/หมดอายุ -> ไปหน้า Login
      router.replace("/");
    } else if (!requireAuth && hasValidToken) {
      // อยู่หน้า Login แต่ล็อกอินอยู่แล้ว -> ไปหน้า Home
      router.replace("/home");
    } else {
      // สถานะถูกต้อง อนุญาตให้แสดงผล children ได้
      setIsAuthenticated(true);
    }
  }, [requireAuth, router]);

  // แสดง Loading Screen จนกว่าจะตรวจสอบ Auth เสร็จสิ้น (ยับยั้งการเห็นหน้าเว็บก่อนย้ายหน้า)
  if (isAuthenticated === null) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="flex items-center gap-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-700"></div>
          <p className="text-slate-600 text-base font-medium">กำลังตรวจสอบสิทธิ์...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}