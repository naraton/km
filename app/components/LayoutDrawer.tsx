"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import {
  FcSurvey,
  FcStatistics,
  FcTodoList,
  FcFilingCabinet,
  FcPackage,
} from "react-icons/fc";
import {
  HiOutlineBars3,
  HiCog8Tooth,
  HiMiniUserCircle,
  HiOutlineArrowPath,
  HiOutlineArrowRightStartOnRectangle,
} from "react-icons/hi2";
import logo from "../favicon.ico";
import Image from "next/image";
import { getUser, hasPermission } from "@/app/lib/auth";

export default function LayoutDrawer({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  //get user data from local storage---------------------------------------
  useEffect(() => {
    const user = getUser();
    const isUserAdmin = hasPermission("Admin");

    if (user) {
      setUser(user);
    }
    setIsAdmin(isUserAdmin);
  }, []);
  //-----------------------------------------------------------------------

  //Change Password Modal--------------------------------------------------
  const [openChangePassModal, setOpenChangePassModal] = useState(false);
  const [loadingSubmitChangePass, setLoadingSubmitChangePass] = useState(false);
  const [alert, setAlert] = useState({
    show: false,
    message: "",
    type_bg: "",
    text_coler: "",
  });

  const handleSubmitChangePassword = async (
    e: React.FormEvent<HTMLFormElement>,
  ) => {
    e.preventDefault();
    const form = e.currentTarget;
    const old_password = (
      form.querySelector("#OldPassword") as HTMLInputElement
    ).value;
    const new_password = (
      form.querySelector("#NewPassword") as HTMLInputElement
    ).value;
    const confirm_password = (
      form.querySelector("#ConfirmPassword") as HTMLInputElement
    ).value;

    if (new_password !== confirm_password) {
      setAlert({
        show: true,
        message: "รหัสผ่านใหม่ไม่ตรงกัน",
        type_bg: "bg-red-500/10",
        text_coler: "text-red-600",
      });
      return;
    }

    if (new_password === old_password) {
      setAlert({
        show: true,
        message: "รหัสผ่านใหม่ต้องไม่เหมือนรหัสผ่านเดิม",
        type_bg: "bg-red-500/10",
        text_coler: "text-red-600",
      });
      return;
    }

    if (new_password.length < 8 || new_password.length > 16) {
      setAlert({
        show: true,
        message: "รหัสผ่านใหม่ต้องมีความยาวไม่ต่ำกว่า 8 ตัวอักษร",
        type_bg: "bg-red-500/10",
        text_coler: "text-red-600",
      });
      return;
    }

    setLoadingSubmitChangePass(true);

    try {
      const res = await fetch("/api/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ old_password, new_password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setAlert({
          show: true,
          message: data.message,
          type_bg: "bg-red-500/10",
          text_coler: "text-red-600",
        });

        return;
      } else {
        setAlert({
          show: true,
          message: data.message,
          type_bg: "bg-green-500/10",
          text_coler: "text-green-600",
        });

        setTimeout(() => {
          setLoadingSubmitChangePass(false);
          setOpenChangePassModal(false);
          form.reset();
          clearAlert();
          Logout();
        }, 3000);
      }
    } catch (error) {}
  };
  //-----------------------------------------------------------------------

  //Clear Alert Function---------------------------------------------------
  const clearAlert = () => {
    setAlert({
      show: false,
      message: "",
      type_bg: "",
      text_coler: "",
    });
  };
  //-----------------------------------------------------------------------

  //Logout function--------------------------------------------------------
  const Logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("expiresAt");
    localStorage.removeItem("rememberedIdCard");
    window.location.href = "/";
  };
  //-----------------------------------------------------------------------

  return (
    <div className="drawer lg:drawer-open bg-slate-50/50">
      {/* ✅ Checkbox toggle สำหรับเปิด/ปิด Sidebar */}
      <input id="my-drawer" type="checkbox" className="drawer-toggle" />

      {/* ✅ Main content */}
      <div className="drawer-content flex flex-col min-h-screen">
        <header
          className="navbar fixed top-0 left-0 w-full z-40 bg-white/85 backdrop-blur-xl border-b border-gray-200/60 transition-all duration-300"
          style={{ boxShadow: "0 4px 30px rgba(0, 0, 0, 0.03)" }}
        >
          {/* ✅ sidebar only mobile */}
          <div className="flex items-center justify-start p-2 z-15 lg:hidden w-full">
            <label
              htmlFor="my-drawer"
              aria-label="open sidebar"
              className="btn btn-ghost btn-square rounded-xl hover:bg-gray-100 transition-colors"
            >
              <HiOutlineBars3
                className="w-6 h-6 text-sky-900"
                strokeWidth={2.5}
              />
            </label>
            <span className="bg-gradient-to-r from-sky-600 to-sky-900 bg-clip-text text-sky-900 font-extrabold text-lg ml-2 tracking-tight">
              iStock
            </span>
          </div>

          <div className="hidden lg:flex items-center justify-between w-full px-8 ps-[300px]">
            <span className="text-sky-900 font-black text-xl ml-1">
              ระบบจัดการพัสดุภายในหน่วยงาน
            </span>
          </div>

          <div className="flex-none flex items-center gap-2 mr-3">
            <div className="dropdown dropdown-end">
              <div
                tabIndex={0}
                role="button"
                className="btn btn-ghost btn-circle avatar"
              >
                <div className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100">
                  <HiCog8Tooth className="w-8 h-8 text-sky-900" />
                </div>
              </div>

              <ul
                tabIndex={0}
                className="menu dropdown-content bg-base-100 rounded-box mt-3 w-52 p-2 shadow text-sky-900"
              >
                {/* User Info */}
                <li className="pointer-events-none">
                  <div className="flex items-center font-semibold">
                    <HiMiniUserCircle className="w-6 h-6 text-sky-900" />
                    <span className="text-base">
                      {user?.fname} {user?.lname}
                    </span>
                  </div>
                </li>

                <hr className="border-sky-600/30" />

                <li className="mt-2">
                  <Link
                    href="#"
                    onClick={() => setOpenChangePassModal(true)}
                    className="flex items-center gap-2"
                  >
                    <HiOutlineArrowPath className="w-4 h-4 text-sky-900" />
                    <span>Change Password</span>
                  </Link>
                </li>

                <li>
                  <Link
                    href="#"
                    className="flex items-center gap-2"
                    onClick={Logout}
                  >
                    <HiOutlineArrowRightStartOnRectangle className="w-4 h-4 text-sky-900" />
                    <span>Logout</span>
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </header>

        {openChangePassModal && (
          <dialog
            id="followModal"
            className="modal modal-open z-100 bg-slate-900/40 backdrop-blur-xs"
          >
            <div className="modal-box w-11/12 max-w-md bg-white border border-slate-200/50 shadow-2xl rounded-3xl p-8">
              <form onSubmit={handleSubmitChangePassword}>
                <button
                  type="button"
                  className="btn btn-sm btn-circle btn-ghost absolute right-4 top-4 text-slate-400 hover:text-slate-600 transition-colors"
                  onClick={() => setOpenChangePassModal(false)}
                >
                  ✕
                </button>

                <h3 className="text-lg font-bold text-sky-900 mb-6">
                  Change Password
                </h3>

                <div className="grid grid-cols-1 gap-4 text-sm py-2">
                  <div>
                    <label
                      htmlFor="OldPassword"
                      className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block"
                    >
                      Old Password
                    </label>
                    <input
                      id="OldPassword"
                      type="password"
                      placeholder="กรอกรหัสผ่านปัจจุบัน"
                      className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-500/10 transition-all duration-200 outline-none text-sm text-slate-700 placeholder:text-slate-400"
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="NewPassword"
                      className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block"
                    >
                      New Password
                    </label>
                    <input
                      id="NewPassword"
                      type="password"
                      placeholder="กรอกรหัสผ่านใหม่"
                      className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-500/10 transition-all duration-200 outline-none text-sm text-slate-700 placeholder:text-slate-400"
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="ConfirmPassword"
                      className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block"
                    >
                      Confirm Password
                    </label>
                    <input
                      id="ConfirmPassword"
                      type="password"
                      placeholder="ยืนยันรหัสผ่านใหม่"
                      className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-500/10 transition-all duration-200 outline-none text-sm text-slate-700 placeholder:text-slate-400"
                      required
                    />
                  </div>
                </div>

                {/* Alert */}
                {alert.show && (
                  <div
                    role="alert"
                    className={`alert ${alert.type_bg} ${alert.text_coler} p-4 rounded-xl shadow mt-3 flex items-center justify-center space-x-2 text-center`}
                  >
                    <span>{alert.message}</span>
                  </div>
                )}

                <div className="flex justify-end items-center gap-3 mt-8">
                  <button
                    className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-medium rounded-xl active:scale-[0.98] transition-all duration-200 text-sm cursor-pointer"
                    type="button"
                    onClick={() => (
                      setOpenChangePassModal(false),
                      clearAlert()
                    )}
                  >
                    ยกเลิก
                  </button>

                  <button
                    className="px-5 py-2.5 bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white font-medium rounded-xl shadow-md hover:shadow-lg shadow-sky-500/10 hover:shadow-sky-500/20 active:scale-[0.98] transition-all duration-200 text-sm cursor-pointer"
                    type="submit"
                  >
                    {loadingSubmitChangePass ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>กำลังบันทึก...</span>
                      </div>
                    ) : (
                      "บันทึก"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </dialog>
        )}

        {/* ✅ เนื้อหาด้านใน เว้น padding-top ให้ไม่โดน header ทับ */}
        <main className="flex-1 pt-[75px] pb-6 px-1 md:px-2 lg:px-3 w-full mx-auto">
          {children}
        </main>
      </div>

      {/* ✅ Sidebar */}
      <div className="drawer-side z-50">
        <label
          htmlFor="my-drawer"
          aria-label="close sidebar"
          className="drawer-overlay backdrop-blur-sm bg-gray-900/10"
        ></label>
        <ul className="menu bg-white/95 backdrop-blur-xl text-gray-700 min-h-full w-[280px] p-4 pt-6 gap-2 border-r border-gray-200/50 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
          {/* Logo */}
          <div className="flex items-center justify-center gap-1 mb-3 pb-6 border-b border-gray-100/80 px-2">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center">
              <Image src={logo} alt="logo" width={60} height={60} />
            </div>
            <div className="flex flex-col">
              <span className="text-sky-900 font-extrabold text-2xl leading-none tracking-tight mb-1">
                iStock
              </span>
              <span className="text-sky-800 font-black text-xs tracking-widest uppercase">
                System
              </span>
            </div>
          </div>

          <div className="px-3 mb-0 text-xs font-bold text-gray-400 uppercase tracking-widest">
            Main Menu
          </div>

          {/* Dashboard */}
          <li>
            <Link
              href="/iStock-dashboard"
              className={`flex items-center gap-3 py-3.5 px-4 rounded-xl transition-all duration-300 mt-2 ${
                pathname === "/iStock-dashboard"
                  ? "bg-gradient-to-r from-sky-500 to-indigo-500 text-white shadow-lg shadow-indigo-200/50 font-bold"
                  : "hover:bg-slate-50 text-gray-700 font-semibold group"
              }`}
            >
              <div
                className={`p-1.5 rounded-lg transition-colors shadow-sm ${
                  pathname === "/iStock-dashboard"
                    ? "bg-white/20"
                    : "bg-sky-50 group-hover:bg-sky-100"
                }`}
              >
                <FcStatistics className="w-5 h-5 drop-shadow-sm" />
              </div>
              Dashboard
            </Link>
          </li>

          {/*รายการพัสดุ*/}
          {isAdmin && (
            <li>
              <Link
                href="/items"
                className={`flex items-center gap-3 py-3.5 px-4 rounded-xl transition-all duration-300 ${
                  pathname === "/items"
                    ? "bg-gradient-to-r from-sky-500 to-indigo-500 text-white shadow-lg shadow-indigo-200/50 font-bold"
                    : "hover:bg-slate-50 text-gray-700 font-semibold group"
                }`}
              >
                <div
                  className={`p-1.5 rounded-lg transition-colors shadow-sm ${
                    pathname === "/items"
                      ? "bg-white/20"
                      : "bg-emerald-50 group-hover:bg-emerald-100"
                  }`}
                >
                  <FcSurvey className="w-5 h-5 drop-shadow-sm" />
                </div>
                รายการพัสดุ
              </Link>
            </li>
          )}

          {/*รับพัสดุ*/}
          <li>
            <Link
              href="/receive"
              className={`flex items-center gap-3 py-3.5 px-4 rounded-xl transition-all duration-300 ${
                pathname === "/receive"
                  ? "bg-gradient-to-r from-sky-500 to-indigo-500 text-white shadow-lg shadow-indigo-200/50 font-bold"
                  : "hover:bg-slate-50 text-gray-700 font-semibold group"
              }`}
            >
              <div
                className={`p-1.5 rounded-lg transition-colors shadow-sm ${
                  pathname === "/receive"
                    ? "bg-white/20"
                    : "bg-blue-50 group-hover:bg-blue-100"
                }`}
              >
                <FcFilingCabinet className="w-5 h-5 drop-shadow-sm" />
              </div>
              รับพัสดุ
            </Link>
          </li>

          {/*เบิกพัสดุ*/}
          <li>
            <Link
              href="/issue"
              className={`flex items-center gap-3 py-3.5 px-4 rounded-xl transition-all duration-300 ${
                pathname === "/issue"
                  ? "bg-gradient-to-r from-sky-500 to-indigo-500 text-white shadow-lg shadow-indigo-200/50 font-bold"
                  : "hover:bg-slate-50 text-gray-700 font-semibold group"
              }`}
            >
              <div
                className={`p-1.5 rounded-lg transition-colors shadow-sm ${
                  pathname === "/issue"
                    ? "bg-white/20"
                    : "bg-orange-50 group-hover:bg-orange-100"
                }`}
              >
                <FcTodoList className="w-5 h-5 drop-shadow-sm" />
              </div>
              เบิกจ่ายพัสดุ
            </Link>
          </li>

          {/*ยอดคงเหลือในสต็อก*/}
          <li>
            <Link
              href="/stockbalance"
              className={`flex items-center gap-3 py-3.5 px-4 rounded-xl transition-all duration-300 ${
                pathname === "/stockbalance"
                  ? "bg-gradient-to-r from-sky-500 to-indigo-500 text-white shadow-lg shadow-indigo-200/50 font-bold"
                  : "hover:bg-slate-50 text-gray-700 font-semibold group"
              }`}
            >
              <div
                className={`p-1.5 rounded-lg transition-colors shadow-sm ${
                  pathname === "/stockbalance"
                    ? "bg-white/20"
                    : "bg-green-50 group-hover:bg-green-100"
                }`}
              >
                <FcPackage className="w-5 h-5 drop-shadow-sm" />
              </div>
              ยอดคงเหลือในสต็อก
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
}
