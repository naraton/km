"use client";

import {
  HiOutlineBars3,
  HiOutlineMagnifyingGlass,
} from "react-icons/hi2";
import Image from "next/image";
import logo from "../favicon.ico";

export default function LayoutDrawer({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <div className="drawer lg:drawer-open bg-slate-50/50">
      {/* ✅ Checkbox toggle สำหรับเปิด/ปิด Sidebar */}
      <input id="my-drawer" type="checkbox" className="drawer-toggle" />

      {/* ✅ Main content */}
      <div className="drawer-content flex flex-col min-h-screen bg-base-200/50">
        <header
          className="navbar fixed top-0 left-0 w-full z-40 bg-white/85 backdrop-blur-xl border-b border-gray-200/60 transition-all duration-300"
          style={{ boxShadow: "0 4px 30px rgba(0, 0, 0, 0.03)" }}
        >
          {/* ✅ Mobile Header */}
          <div className="flex items-center justify-between p-2 z-15 lg:hidden w-full gap-2">
            <div className="flex items-center shrink-0">
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
              <span className="text-sm font-semibold px-2.5 py-1 rounded-full bg-violet-700 text-white shadow-xs border border-violet-600/30">
                TCH KM Hub
              </span>
            </div>

            {/* ช่องค้นหา + ปุ่มค้นหา (Mobile) */}
            <div className="flex items-center gap-1 w-full max-w-[200px]">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="ค้นหา..."
                  className="w-full pl-9 pr-4 py-2 text-sm bg-slate-100/80 border border-slate-200 rounded-full focus:outline-none focus:bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 text-slate-700 placeholder:text-slate-400 transition-all duration-200"
                />
                <HiOutlineMagnifyingGlass className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-1/2 -translate-y-1/2" />
              </div>

              <button
                type="button"
                className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-violet-600 to-violet-700 hover:from-violet-700 hover:to-violet-800 text-white text-sm font-medium rounded-full shadow-xs hover:shadow-md shadow-violet-500/20 active:scale-[0.98] transition-all duration-200 cursor-pointer"
              >
                <HiOutlineMagnifyingGlass className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* ✅ Desktop Header */}
          <div className="hidden lg:flex items-center justify-between w-full px-2">
            {/* ฝั่งซ้าย: Logo + ชื่อระบบ */}
            <div className="flex items-center gap-2">
              <div className="relative flex items-center justify-center bg-white rounded-xl">
                <Image 
                  src={logo} 
                  alt="TCH KM Logo" 
                  width={30} 
                  height={30} 
                  className="object-contain"
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sky-950 font-black text-xl tracking-tight">
                  ศูนย์รวมองค์ความรู้ ธัญญารักษ์เชียงใหม่
                </span>
                <span className="text-sm font-semibold px-2.5 py-1 rounded-full bg-violet-700 text-white shadow-xs border border-violet-600/30">
                  TCH KM Hub
                </span>
              </div>
            </div>

            {/* ฝั่งขวา: ช่องค้นหา + ปุ่มค้นหา (Desktop) */}
            <div className="flex items-center gap-2">
              <div className="relative w-72">
                <input
                  type="text"
                  placeholder="ค้นหาองค์ความรู้, บทความ..."
                  className="w-full pl-9 pr-4 py-2 text-sm bg-slate-100/80 border border-slate-200 rounded-full focus:outline-none focus:bg-white focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 text-slate-700 placeholder:text-slate-400 transition-all duration-200"
                />
                <HiOutlineMagnifyingGlass className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
              <button
                type="button"
                className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-violet-600 to-violet-700 hover:from-violet-700 hover:to-violet-800 text-white text-sm font-medium rounded-full shadow-xs hover:shadow-md shadow-violet-500/20 active:scale-[0.98] transition-all duration-200 cursor-pointer"
              >
                <HiOutlineMagnifyingGlass className="w-4 h-4" />
                <span>ค้นหา</span>
              </button>
            </div>
          </div>
        </header>

        {/* ✅ ปรับปรุงจุดนี้: เอา padding ด้านข้างออกเพื่อให้ children ขยายชิดขอบจอ 100% */}
        <main className="flex-1 pt-[75px] pb-6 w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
