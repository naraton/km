"use client";
import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import {
  HiOutlineMagnifyingGlass,
  HiCog8Tooth,
  HiMiniUserCircle,
  HiOutlineArrowPath,
  HiOutlineArrowRightStartOnRectangle,
  HiOutlineLockClosed,
  HiOutlineIdentification,
  HiXMark,
  HiOutlineKey,
} from "react-icons/hi2";
import { LuNotebookPen } from "react-icons/lu";
import { FaBook } from "react-icons/fa";
import Image from "next/image";
import logo from "../favicon.ico";
import Link from "next/link";

// 1. Types สำหรับ Props ของ AiFillSettings
interface AiFillSettingsProps {
  user: any;
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  handleLogin: (e: React.FormEvent) => Promise<void>;
  Logout: () => void;
  loading: boolean;
  error: string;
  setError: (err: string) => void;
  loginModal: boolean;
  setLoginModal: (open: boolean) => void;
  // เพิ่ม Props สำหรับ Change Password Modal
  changePassModal: boolean;
  setChangePassModal: (open: boolean) => void;
  passData: any;
  setPassData: React.Dispatch<React.SetStateAction<any>>;
  handleChangePassword: (e: React.FormEvent) => Promise<void>;
  passSuccess: string;
}

// 2. คอมโพเนนต์ AiFillSettings
function AiFillSettings({
  user,
  formData,
  setFormData,
  handleLogin,
  Logout,
  loading,
  error,
  setError,
  loginModal,
  setLoginModal,
  changePassModal,
  setChangePassModal,
  passData,
  setPassData,
  handleChangePassword,
  passSuccess,
}: AiFillSettingsProps) {
  return (
    <div className="flex-none flex items-center gap-2 mr-3">
      <div className="dropdown dropdown-end">
        <div
          tabIndex={0}
          role="button"
          className="btn btn-ghost btn-circle avatar bg-gray-100 hover:bg-violet-200"
        >
          <div className="w-8 h-8 flex items-center justify-center rounded-full">
            <HiCog8Tooth className="w-6 h-6 text-violet-700" />
          </div>
        </div>

        <ul
          tabIndex={0}
          className="menu dropdown-content bg-base-100 rounded-box mt-3 w-60 p-3 shadow-2xl z-50 text-sky-900 border border-slate-100"
        >
          {/* ✅ กรณีที่ Login แล้ว */}
          {user ? (
            <>
              <li className="pointer-events-none pb-2">
                <div className="flex items-center gap-2 font-semibold">
                  <HiMiniUserCircle className="w-7 h-7 text-violet-700 flex-shrink-0" />
                  <div className="flex flex-col">
                    <span className="text-sm text-slate-800">
                      {user?.fname || user?.name || "ผู้ใช้งาน"} {user?.lname || ""}
                    </span>
                    <span className="text-xs text-slate-400 font-normal">
                      เข้าสู่ระบบแล้ว
                    </span>
                  </div>
                </div>
              </li>

              <hr className="border-violet-100 my-1" />

              <li>
                <Link
                  href="/articles/create"
                  className="flex items-center gap-2 py-2 w-full text-left"
                >
                  <LuNotebookPen className="w-4 h-4 text-green-500" />
                  <span className="text-green-500">เขียนบทความใหม่</span>
                </Link>
              </li>

              <li>
                <Link
                  href="#"
                  className="flex items-center gap-2 py-2 w-full text-left"
                >
                  <FaBook className="w-4 h-4 text-blue-500" />
                  <span className="text-blue-500">บทความของฉัน</span>
                </Link>
              </li>

              <hr className="border-violet-100 my-1" />

              <li>
                <button
                  type="button"
                  onClick={() => {
                    setError("");
                    setChangePassModal(true);
                  }}
                  className="flex items-center gap-2 py-2 w-full text-left"
                >
                  <HiOutlineArrowPath className="w-4 h-4 text-orange-500" />
                  <span className="text-orange-500">เปลี่ยนรหัสผ่าน</span>
                </button>
              </li>

              <li>
                <button
                  type="button"
                  onClick={Logout}
                  className="flex items-center gap-2 py-2 text-rose-600 hover:bg-rose-50 hover:text-rose-700 w-full text-left"
                >
                  <HiOutlineArrowRightStartOnRectangle className="w-4 h-4" />
                  <span>ออกจากระบบ</span>
                </button>
              </li>
            </>
          ) : (
            /* ❌ กรณีที่ยังไม่ได้ Login */
            <>
              <li className="pointer-events-none pb-1">
                <span className="text-xs text-slate-400">สถานะ: ยังไม่ได้เข้าสู่ระบบ</span>
              </li>
              <hr className="border-slate-100 my-1" />
              <li>
                <button
                  type="button"
                  onClick={() => {
                    setError("");
                    setLoginModal(true);
                  }}
                  className="flex items-center gap-2 py-2 text-violet-700 font-medium hover:bg-violet-50 w-full text-left"
                >
                  <HiOutlineLockClosed className="w-4 h-4 text-violet-700" />
                  <span>เข้าสู่ระบบ (Login)</span>
                </button>
              </li>
            </>
          )}
        </ul>
      </div>
    </div>
  );
}

// 3. Main Component
export default function LayoutDrawer({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  // State สำหรับ Login Modal
  const [loginModal, setLoginModal] = useState(false);
  const [formData, setFormData] = useState({
    id_card: "",
    password: "",
    remember: false,
  });

  // State สำหรับ Change Password Modal
  const [changePassModal, setChangePassModal] = useState(false);
  const [passSuccess, setPassSuccess] = useState("");
  const [passData, setPassData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // โหลดค่า remember me และตรวจสอบสถานะ login
  useEffect(() => {
    const savedIdCard = localStorage.getItem("rememberedIdCard");
    if (savedIdCard) {
      setFormData((prev) => ({ ...prev, id_card: savedIdCard, remember: true }));
    }

    const savedUser = localStorage.getItem("user");
    const expiresAt = localStorage.getItem("expiresAt");

    if (savedUser && expiresAt) {
      if (Date.now() < parseInt(expiresAt)) {
        setUser(JSON.parse(savedUser));
      } else {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("expiresAt");
      }
    }
  }, []);

  // จัดการ Login
  const handleLogin = async (e: React.FormEvent) => {
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

      if (!res.ok) {
        const data = await res.json();
        setError(data.message || "การเข้าสู่ระบบล้มเหลว");
        setLoading(false);
        return;
      }

      const data = await res.json();

      const meRes = await fetch("/api/me", {
        headers: {
          Authorization: `Bearer ${data.token}`,
        },
      });

      if (!meRes.ok) {
        setError("ไม่สามารถดึงข้อมูลผู้ใช้งานได้");
        setLoading(false);
        return;
      }

      const me = await meRes.json();
      const roleNames = me.roles || [];
      const allowedRoles = ["KM"];

      const hasPermission = roleNames.some((role: string) =>
        allowedRoles.includes(role)
      );

      if (!hasPermission) {
        setError("ผู้ใช้นี้ไม่มีสิทธิ์เข้าใช้งานระบบ");
        localStorage.removeItem("token");
        setLoading(false);
        return;
      }

      const expiresAt = Date.now() + 8 * 60 * 60 * 1000;

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("expiresAt", String(expiresAt));

      if (formData.remember) {
        localStorage.setItem("rememberedIdCard", formData.id_card);
      } else {
        localStorage.removeItem("rememberedIdCard");
      }

      setUser(data.user);
      setLoginModal(false);
      router.push("/home");

    } catch (err) {
      console.error("Login Error:", err);
      setError("ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้");
    } finally {
      setLoading(false);
    }
  };

  // จัดการเปลี่ยนรหัสผ่าน
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setPassSuccess("");

    // 1. เช็กว่ารหัสผ่านใหม่ตรงกับยืนยันรหัสผ่านหรือไม่
    if (passData.newPassword !== passData.confirmPassword) {
      setError("รหัสผ่านใหม่และยืนยันรหัสผ่านไม่ตรงกัน");
      return;
    }

    // 2. เช็กความยาวอย่างน้อย 8 ตัวอักษร
    if (passData.newPassword.length < 8) {
      setError("รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 8 ตัวอักษร");
      return;
    }

    // 3. เช็กตัวพิมพ์ใหญ่อย่างน้อย 1 ตัว (A-Z)
    if (!/[A-Z]/.test(passData.newPassword)) {
      setError("รหัสผ่านใหม่ต้องมีตัวพิมพ์ใหญ่ (A-Z) อย่างน้อย 1 ตัว");
      return;
    }

    // 4. เช็กตัวพิมพ์เล็กอย่างน้อย 1 ตัว (a-z)
    if (!/[a-z]/.test(passData.newPassword)) {
      setError("รหัสผ่านใหม่ต้องมีตัวพิมพ์เล็ก (a-z) อย่างน้อย 1 ตัว");
      return;
    }

    // 5. เช็กตัวเลขอย่างน้อย 1 ตัว (0-9)
    if (!/[0-9]/.test(passData.newPassword)) {
      setError("รหัสผ่านใหม่ต้องมีตัวเลข (0-9) อย่างน้อย 1 ตัว");
      return;
    }

    // 6. เช็กอักขระพิเศษอย่างน้อย 1 ตัว
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(passData.newPassword)) {
      setError("รหัสผ่านใหม่ต้องมีอักขระพิเศษ (!@#$%^&*) อย่างน้อย 1 ตัว");
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          old_password: passData.currentPassword,
          new_password: passData.newPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "เปลี่ยนรหัสผ่านไม่สำเร็จ");
        return;
      }

      setPassSuccess("เปลี่ยนรหัสผ่านเรียบร้อยแล้ว!");
      setPassData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      
      // ปิด Modal อัตโนมัติหลังเปลี่ยนสำเร็จ 2 วินาที
      setTimeout(() => {
        setChangePassModal(false);
        setPassSuccess("");
      }, 2000);

    } catch (err) {
      console.error("Change Password Error:", err);
      setError("ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้");
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const Logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("expiresAt");
    localStorage.removeItem("rememberedIdCard");
    setUser(null);
    router.push("/home");
    router.refresh();
  };

  const settingsProps: AiFillSettingsProps = {
    user,
    formData,
    setFormData,
    handleLogin,
    Logout,
    loading,
    error,
    setError,
    loginModal,
    setLoginModal,
    changePassModal,
    setChangePassModal,
    passData,
    setPassData,
    handleChangePassword,
    passSuccess,
  };

  return (
    <div className="drawer lg:drawer-open bg-slate-50/50">
      <input id="my-drawer" type="checkbox" className="drawer-toggle" />

      <div className="drawer-content flex flex-col min-h-screen bg-white/20">
        <header
          className="navbar fixed top-0 left-0 w-full z-40 bg-white/85 backdrop-blur-xl border-b border-gray-200/60 transition-all duration-300"
          style={{ boxShadow: "0 4px 20px rgba(0, 0, 0, 0.2)" }}
        >
          {/* ✅ Mobile Header */}
          <div className="flex items-center justify-between z-15 lg:hidden w-full gap-1">
            <div className="flex items-center shrink-0">
              <div className="relative flex-shrink-0 bg-white rounded-2xl p-1 shadow-lg border border-slate-300">
                <Image 
                  src={logo} 
                  alt="TCH KM Logo" 
                  width={40} 
                  height={40} 
                  className="object-contain"
                />
              </div>

              <div className="flex flex-col justify-center leading-tight">
                <span className="text-xl sm:ps-1 ps-1 font-black tracking-tight text-violet-700">
                  TCH : KM
                </span>
                <span className="text-sm sm:ps-1 ps-1 font-medium text-slate-600 mt-0.5">
                  โรงพยาบาลธัญญารักษ์เชียงใหม่
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1 w-full max-w-[200px]">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="ค้นหา..."
                  className="w-full pl-9 pr-4 py-2 text-sm bg-slate-100/80 border border-slate-200 rounded-full focus:outline-none focus:bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 text-slate-700 placeholder:text-slate-400 transition-all duration-200"
                />
                <HiOutlineMagnifyingGlass className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-1/2 -translate-y-1/2" />
              </div>

              <AiFillSettings {...settingsProps} />
            </div>
          </div>

          {/* ✅ Desktop Header */}
          <div className="hidden lg:flex items-center justify-between w-full px-1">
            <div className="flex items-center gap-2">
              <div className="relative flex-shrink-0 bg-white rounded-2xl p-1 border border-slate-300 shadow-lg">
                <Image 
                  src={logo} 
                  alt="TCH KM Logo" 
                  width={45} 
                  height={45} 
                  className="object-contain"
                />
              </div>

              <div className="flex flex-col justify-center leading-tight">
                <span className="text-xl font-black tracking-tight text-violet-700">
                  ศูนย์รวมองค์ความรู้ (Knowledge Management : KM)
                </span> 
                <span className="text-base font-medium text-slate-600 mt-0.5">
                  โรงพยาบาลธัญญารักษ์เชียงใหม่
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative w-72">
                <input
                  type="text"
                  placeholder="ค้นหาองค์ความรู้, บทความ..."
                  className="w-full pl-9 pr-4 py-2 text-sm bg-slate-100/80 border border-slate-200 rounded-full focus:outline-none focus:bg-white focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 text-slate-700 placeholder:text-slate-400 transition-all duration-200"
                />
                <HiOutlineMagnifyingGlass className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
              
              <AiFillSettings {...settingsProps} />
            </div>
          </div>
        </header>

        <main className="flex-1 pt-[75px] pb-6 w-full">
          {children}

          {/* ---------------------------------------------------- */}
          {/* 🔒 1. Modal สำหรับ Login */}
          {/* ---------------------------------------------------- */}
          {loginModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
              <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative animate-in fade-in zoom-in duration-200">
                <button
                  onClick={() => setLoginModal(false)}
                  className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 cursor-pointer"
                >
                  <HiXMark className="w-5 h-5" />
                </button>

                <div className="text-center mb-6">
                  <div className="w-12 h-12 bg-violet-100 text-violet-700 rounded-full flex items-center justify-center mx-auto mb-3">
                    <HiOutlineLockClosed className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800">เข้าสู่ระบบ TCH KM</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    กรอกเลขบัตรประชาชนและรหัสผ่านเพื่อเข้าใช้งาน
                  </p>
                </div>

                {error && (
                  <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-600 text-xs rounded-xl flex items-center gap-2">
                    <span>⚠️ {error}</span>
                  </div>
                )}

                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      เลขบัตรประจำตัวประชาชน
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={formData.id_card}
                        onChange={(e) =>
                          setFormData((prev: any) => ({ ...prev, id_card: e.target.value }))
                        }
                        placeholder="เลขบัตรประชาชน 13 หลัก"
                        className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 text-slate-800"
                      />
                      <HiOutlineIdentification className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      รหัสผ่าน
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        required
                        value={formData.password}
                        onChange={(e) =>
                          setFormData((prev: any) => ({ ...prev, password: e.target.value }))
                        }
                        placeholder="••••••••"
                        className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 text-slate-800"
                      />
                      <HiOutlineLockClosed className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <label className="flex items-center gap-2 cursor-pointer text-slate-600">
                      <input
                        type="checkbox"
                        checked={formData.remember}
                        onChange={(e) =>
                          setFormData((prev: any) => ({ ...prev, remember: e.target.checked }))
                        }
                        className="rounded border-slate-300 text-violet-600 focus:ring-violet-500"
                      />
                      <span>จดจำบัญชีผู้ใช้</span>
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 bg-violet-600 hover:bg-violet-700 text-white font-medium text-sm rounded-xl shadow-md shadow-violet-200 transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {loading ? (
                      <>
                        <span className="loading loading-spinner loading-xs"></span>
                        <span>กำลังเข้าสู่ระบบ...</span>
                      </>
                    ) : (
                      <span>เข้าสู่ระบบ</span>
                    )}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* ---------------------------------------------------- */}
          {/* 🔑 2. Modal สำหรับเปลี่ยนรหัสผ่าน (Change Password) */}
          {/* ---------------------------------------------------- */}
          {changePassModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
              <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative animate-in fade-in zoom-in duration-200">
                <button
                  onClick={() => setChangePassModal(false)}
                  className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 cursor-pointer"
                >
                  <HiXMark className="w-5 h-5" />
                </button>

                <div className="text-center mb-6">
                  <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-3">
                    <HiOutlineKey className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800">เปลี่ยนรหัสผ่าน</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    กรุณากรอกรหัสผ่านปัจจุบันและรหัสผ่านใหม่ที่คุณต้องการเปลี่ยน
                  </p>
                </div>

                {error && (
                  <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-600 text-xs rounded-xl flex items-center gap-2">
                    <span>⚠️ {error}</span>
                  </div>
                )}

                {passSuccess && (
                  <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-xl flex items-center gap-2">
                    <span>🎉 {passSuccess}</span>
                  </div>
                )}

                <form onSubmit={handleChangePassword} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      รหัสผ่านปัจจุบัน
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        required
                        value={passData.currentPassword}
                        onChange={(e) =>
                          setPassData((prev: any) => ({ ...prev, currentPassword: e.target.value }))
                        }
                        placeholder="••••••••"
                        className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 text-slate-800"
                      />
                      <HiOutlineLockClosed className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      รหัสผ่านใหม่
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        required
                        value={passData.newPassword}
                        onChange={(e) =>
                          setPassData((prev: any) => ({ ...prev, newPassword: e.target.value }))
                        }
                        placeholder="••••••••"
                        className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 text-slate-800"
                      />
                      <HiOutlineKey className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      ยืนยันรหัสผ่านใหม่
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        required
                        value={passData.confirmPassword}
                        onChange={(e) =>
                          setPassData((prev: any) => ({ ...prev, confirmPassword: e.target.value }))
                        }
                        placeholder="••••••••"
                        className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 text-slate-800"
                      />
                      <HiOutlineKey className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-medium text-sm rounded-xl shadow-md shadow-amber-200 transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2 mt-2 cursor-pointer"
                  >
                    {loading ? (
                      <>
                        <span className="loading loading-spinner loading-xs"></span>
                        <span>กำลังบันทึกข้อมูล...</span>
                      </>
                    ) : (
                      <span>อัปเดตรหัสผ่าน</span>
                    )}
                  </button>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}