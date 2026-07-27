import React from "react";
import Link from "next/link";
import ArticleForm from "@/app/components/Articles/AritclesForm";

export default function CreateArticlePage() {
  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header / Navigation */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/home"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-purple-800 transition-colors bg-white px-4 py-2 rounded-full shadow-lg border border-slate-200"
          >
            ← ย้อนกลับหน้าหลัก
          </Link>
          <span className="text-sm font-bold px-3 py-1.5 transition-colors bg-white rounded-full shadow-lg border border-slate-200 text-purple-800">
            TCH KM - ARTICLE CREATOR
          </span>
        </div>

        {/* Main Card Container */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-lg border border-slate-200">
          <div className="mb-8 pb-4 border-b border-slate-100">
            <h1 className="text-2xl font-bold text-violet-900">
              สร้างบทความ / องค์ความรู้ใหม่
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              กรอกข้อมูลเพื่อบันทึกเข้าคลังความรู้ขององค์กร
            </p>
          </div>

          {/* เรียกใช้งาน Component ArticleForm ตรงนี้ */}
          <ArticleForm mode={'create'}/>
        </div>
      </div>
    </div>
  );
}