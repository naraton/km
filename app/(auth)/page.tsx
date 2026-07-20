"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import logo from "../favicon.ico";
import { PiIdentificationCardLight, PiLockKeyLight } from "react-icons/pi";

export default function LoginPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    id_card: "",
    password: "",
    remember: false,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ โหลดค่า remember me จาก localStoragesd
  useEffect(() => {
    const savedIdCard = localStorage.getItem("rememberedIdCard");
    if (savedIdCard) {
      setFormData((prev) => ({
        ...prev,
        id_card: savedIdCard,
        remember: true,
      }));
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_card: formData.id_card,
          password: formData.password,
        }),
      });

      const data = await res.json();

      const meRes = await fetch("/api/me", {
        headers: {
          Authorization: `Bearer ${data.token}`,
        },
      });

      const me = await meRes.json();

      const roleNames = me.roles || [];

      const allowedRoles = ["iStock"];

      const hasRole = roleNames.some((role: string) =>
        allowedRoles.includes(role),
      );

      if (!hasRole) {
        setError("ผู้ใช้นี้ไม่มีสิทธิ์เข้าใช้งานระบบ iStock");
        localStorage.removeItem("token");
        return;
      }

      // เก็บ token + user + expire
      const expiresAt = Date.now() + 8 * 60 * 60 * 1000;

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("expiresAt", expiresAt.toString());
      localStorage.setItem("permissions", JSON.stringify(me.permissions));

      // Remember Me
      if (formData.remember) {
        localStorage.setItem("rememberedIdCard", formData.id_card);
      } else {
        localStorage.removeItem("rememberedIdCard");
      }

      if (roleNames.includes("iStock")) {
        router.push("/iStock-dashboard");
      } else {
        router.push("/no-permission");
      }
    } catch (err) {
      console.error("Login Error:", err);
      setError("ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white/70 backdrop-blur-md border border-slate-200/50 shadow-[0_20px_50px_rgba(8,112,184,0.08)] rounded-3xl p-10 transition-all duration-300">
      {/* Brand Header */}
      <div className="flex flex-col items-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-tr from-sky-100 to-sky-50 rounded-2xl flex items-center justify-center shadow-inner mb-4 border border-sky-100/50">
          <Image
            src={logo}
            alt="Logo"
            width={38}
            height={38}
            className="w-10 h-10 object-contain"
          />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-sky-900">
          iStock
        </h1>
        <p className="text-xs text-slate-400 mt-1.5 font-light">
          ระบบจัดการสต๊อกวัสดุและการเบิกใช้ภายใน IPD
        </p>
      </div>

      {/* ✅ แสดง error ถ้ามี */}
      {error && (
        <div className="flex items-center justify-center gap-2.5 bg-rose-50 border border-rose-100 text-rose-600 px-4 py-3.5 rounded-xl text-sm mb-5 animate-in fade-in slide-in-from-top-2 duration-300">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 shrink-0 text-rose-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <span className="font-medium">{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* ID Card */}
        <div>
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">
            ID Card
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <PiIdentificationCardLight className="w-5 h-5" />
            </div>
            <input
              type="text"
              name="id_card"
              value={formData.id_card}
              onChange={handleChange}
              placeholder="กรอกหมายเลขบัตรประชาชน"
              className="w-full pl-11 pr-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-500/10 transition-all duration-200 outline-none text-sm text-slate-700 placeholder:text-slate-400"
              required
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">
            Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <PiLockKeyLight className="w-5 h-5" />
            </div>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full pl-11 pr-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-500/10 transition-all duration-200 outline-none text-sm text-slate-700 placeholder:text-slate-400"
              required
            />
          </div>
        </div>

        {/* Remember Me + Forgot Password */}
        <div className="flex items-center justify-between pt-1">
          <label className="flex items-center gap-2 cursor-pointer select-none group">
            <input
              type="checkbox"
              name="remember"
              checked={formData.remember}
              onChange={handleChange}
              className="w-4 h-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500/20 focus:ring-offset-0 transition-colors checkbox checkbox-xs checkbox-info"
            />
            <span className="text-xs text-slate-500 group-hover:text-slate-700 transition-colors">
              Remember Me
            </span>
          </label>

          <a
            href="#"
            className="text-xs text-sky-600 hover:text-sky-700 transition-colors tooltip tooltip-left font-medium"
            data-tip="ติดต่อเจ้าหน้าที่ IT (Tel : 402,420)"
          >
            Forgot password ?
          </a>
        </div>

        {/* ปุ่ม Login */}
        <button
          type="submit"
          className="w-full py-3.5 px-4 mt-6 bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white font-medium rounded-xl shadow-md hover:shadow-lg shadow-sky-500/10 hover:shadow-sky-500/20 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-75 disabled:pointer-events-none text-sm cursor-pointer"
          disabled={loading}
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>กำลังเข้าสู่ระบบ...</span>
            </>
          ) : (
            <span>Login</span>
          )}
        </button>
      </form>
    </div>
  );
}
