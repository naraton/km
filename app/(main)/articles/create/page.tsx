"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function CreateArticlePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State ให้ตรงกับ Columns ใน Database
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    description: "",
    content: "",
    coverImage: "",
    categoryId: "1", // ค่าเริ่มต้น เช่น 1=โรคที่มีผลกระทบสูง
    userId: "1", // ID ผู้ใช้งานปัจจุบัน ( mock ไว้ก่อน )
    isPublished: 1, // 1 = เผยแพร่ทันที, 0 = ฉบับร่าง
  });

  // สร้าง Slug อัตโนมัติจาก Title
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    const generatedSlug = title
      .trim()
      .toLowerCase()
      .replace(/[^a-zA-Z0-9ก-๙\s-]/g, "") // ตัดอักขระพิเศษ
      .replace(/\s+/g, "-"); // เปลี่ยนช่องว่างเป็น -

    setFormData((prev) => ({
      ...prev,
      title,
      slug: generatedSlug,
    }));
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ส่งข้อมูลเข้า API Route
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/articles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        alert("บันทึกบทความเรียบร้อยแล้ว!");
        router.push("/"); // บันทึกเสร็จให้กลับไปหน้าแรก
        router.refresh();
      } else {
        const errorData = await res.json();
        alert(`เกิดข้อผิดพลาด: ${errorData.message || "ไม่สามารถบันทึกได้"}`);
      }
    } catch (error) {
      console.error(error);
      alert("เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header / Navigation */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-purple-800 transition-colors bg-white px-4 py-2 rounded-full shadow-xs border border-slate-200"
          >
            ← ย้อนกลับหน้าหลัก
          </Link>
          <span className="text-xs font-bold px-3 py-1.5 text-sm font-semibold transition-colors bg-white px-4 py-2 rounded-full shadow-xs border border-slate-200 text-purple-800">
            TCH KM HUB - ARTICLE CREATOR
          </span>
        </div>

        {/* Main Card Container */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-xs border border-slate-200">
          <div className="mb-8 pb-4 border-b border-slate-100">
            <h1 className="text-2xl font-bold text-slate-900">
              สร้างบทความ / องค์ความรู้ใหม่
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              กรอกข้อมูลเพื่อบันทึกเข้าคลังความรู้ขององค์กร
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 1. Category & Status (2 Columns) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="relative">
                <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
                  หมวดหมู่ความรู้ (categoryId) <span className="text-red-500">*</span>
                </label>

                {/* DaisyUI Dropdown Container */}
                <div className="dropdown w-full">
                  {/* ปุ่มกดเปิด Dropdown ( trigger ) */}
                  <div
                    tabIndex={0}
                    role="button"
                    className="w-full p-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between font-medium text-slate-800 hover:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all cursor-pointer"
                  >
                    <span>
                      {formData.categoryId === "1" && "คลังข้อมูลโรคที่มีผลกระทบสูง"}
                      {formData.categoryId === "2" && "คลังข้อมูลการวิจัย"}
                      {formData.categoryId === "3" && "คลังข้อมูลนวัตกรรม"}
                      {formData.categoryId === "4" && "คลังข้อมูลความรู้ด้านสุขภาพ"}
                      {!formData.categoryId && "เลือกหมวดหมู่..."}
                    </span>
                    {/* ไอคอนลูกศรลง */}
                    <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>

                  {/* เมนูตัวเลือก ( Custom Styled Option List ) */}
                  <ul
                    tabIndex={0}
                    className="dropdown-content menu bg-white rounded-2xl w-full p-2 shadow-lg border border-purple-100 text-slate-700 mt-1 font-medium text-xs z-[100] space-y-1 border-1 border-violet-300"
                  >
                    <li className="menu-title px-1 py-1">
                      <div className="px-2 py-1 border-b border-slate-100 w-full">
                        <p className="text-[10px] font-bold text-purple-600 uppercase tracking-wider">
                          เลือกหมวดหมู่
                        </p>
                      </div>
                    </li>

                    <li>
                      <button
                        type="button"
                        onClick={() => {
                          handleChange({ target: { name: "categoryId", value: "1" } } as any);
                          (document.activeElement as HTMLElement)?.blur(); // ปิด dropdown หลังกด
                        }}
                        className={`px-3 py-2.5 rounded-xl transition-all ${
                          formData.categoryId === "1"
                            ? "bg-purple-600 text-white font-semibold"
                            : "hover:bg-purple-50 hover:text-purple-700"
                        }`}
                      >
                        คลังข้อมูลโรคที่มีผลกระทบสูง
                      </button>
                    </li>

                    <li>
                      <button
                        type="button"
                        onClick={() => {
                          handleChange({ target: { name: "categoryId", value: "2" } } as any);
                          (document.activeElement as HTMLElement)?.blur();
                        }}
                        className={`px-3 py-2.5 rounded-xl transition-all ${
                          formData.categoryId === "2"
                            ? "bg-purple-600 text-white font-semibold"
                            : "hover:bg-purple-50 hover:text-purple-700"
                        }`}
                      >
                        คลังข้อมูลการวิจัย
                      </button>
                    </li>

                    <li>
                      <button
                        type="button"
                        onClick={() => {
                          handleChange({ target: { name: "categoryId", value: "3" } } as any);
                          (document.activeElement as HTMLElement)?.blur();
                        }}
                        className={`px-3 py-2.5 rounded-xl transition-all ${
                          formData.categoryId === "3"
                            ? "bg-purple-600 text-white font-semibold"
                            : "hover:bg-purple-50 hover:text-purple-700"
                        }`}
                      >
                        คลังข้อมูลนวัตกรรม
                      </button>
                    </li>

                    <li>
                      <button
                        type="button"
                        onClick={() => {
                          handleChange({ target: { name: "categoryId", value: "4" } } as any);
                          (document.activeElement as HTMLElement)?.blur();
                        }}
                        className={`px-3 py-2.5 rounded-xl transition-all ${
                          formData.categoryId === "4"
                            ? "bg-purple-600 text-white font-semibold"
                            : "hover:bg-purple-50 hover:text-purple-700"
                        }`}
                      >
                        คลังข้อมูลความรู้ด้านสุขภาพ
                      </button>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="relative">
                <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
                  สถานะการเผยแพร่ (isPublished)
                </label>

                {/* DaisyUI Dropdown Container */}
                <div className="dropdown w-full">
                  {/* ปุ่มกดเปิด Dropdown ( Trigger ) */}
                  <div
                    tabIndex={0}
                    role="button"
                    className="w-full p-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between font-medium text-slate-800 hover:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      {/* แสดง Badge สีสถานะให้ดูง่ายขึ้น */}
                      <span
                        className={`w-2 h-2 rounded-full ${
                          formData.isPublished === 1 ? "bg-emerald-500" : "bg-amber-500"
                        }`}
                      />
                      {formData.isPublished === 1 ? "เผยแพร่ทันที (Public)" : "บันทึกเป็นฉบับร่าง (Draft)"}
                    </span>
                    {/* ไอคอนลูกศรลง */}
                    <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>

                  {/* เมนูตัวเลือก Custom Styled */}
                  <ul
                    tabIndex={0}
                    className="dropdown-content menu bg-white rounded-2xl w-full p-2 shadow-lg border border-purple-100 text-slate-700 mt-1 font-medium text-xs z-[100] space-y-1 border-1 border-violet-300"
                  >
                    <li className="menu-title px-1 py-1">
                      <div className="px-2 py-1 border-b border-slate-100 w-full">
                        <p className="text-[10px] font-bold text-purple-600 uppercase tracking-wider">
                          เลือกสถานะ
                        </p>
                      </div>
                    </li>

                    {/* ตัวเลือก 1: เผยแพร่ทันที */}
                    <li>
                      <button
                        type="button"
                        onClick={() => {
                          setFormData((prev: any) => ({ ...prev, isPublished: 1 }));
                          (document.activeElement as HTMLElement)?.blur();
                        }}
                        className={`px-3 py-2.5 rounded-xl transition-all flex items-center justify-between ${
                          formData.isPublished === 1
                            ? "bg-emerald-600 text-white font-semibold"
                            : "hover:bg-emerald-50 hover:text-emerald-700"
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              formData.isPublished === 1 ? "bg-white" : "bg-emerald-500"
                            }`}
                          />
                          เผยแพร่ทันที (Public)
                        </span>
                      </button>
                    </li>

                    {/* ตัวเลือก 0: ฉบับร่าง */}
                    <li>
                      <button
                        type="button"
                        onClick={() => {
                          setFormData((prev: any) => ({ ...prev, isPublished: 0 }));
                          (document.activeElement as HTMLElement)?.blur();
                        }}
                        className={`px-3 py-2.5 rounded-xl transition-all flex items-center justify-between ${
                          formData.isPublished === 0
                            ? "bg-amber-500 text-white font-semibold"
                            : "hover:bg-amber-50 hover:text-amber-700"
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              formData.isPublished === 0 ? "bg-white" : "bg-amber-500"
                            }`}
                          />
                          บันทึกเป็นฉบับร่าง (Draft)
                        </span>
                      </button>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* 2. Title & Slug */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
                  หัวข้อบทความ (title) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  placeholder="เช่น มะเร็งปากมดลูก : โรคร้ายที่ป้องกันได้"
                  value={formData.title}
                  onChange={handleTitleChange}
                  required
                  className="w-full p-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-purple-500 focus:bg-white text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Slug URL (slug)
                </label>
                <input
                  type="text"
                  name="slug"
                  placeholder="cervical-cancer-prevention"
                  value={formData.slug}
                  disabled
                  onChange={handleChange}
                  className="w-full p-2 text-xs bg-slate-100 border border-slate-200 rounded-lg text-slate-500 font-mono focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  * จะถูกสร้างให้อัตโนมัติ หรือปรับแต่งเองสำหรับใช้ใน URL
                  (ต้องไม่ซ้ำกัน)
                </p>
              </div>
            </div>

            {/* 3. Description */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
                คำอธิบายสั้น / เรื่องย่อ (description){" "}
                <span className="text-red-500">*</span>
              </label>
              <textarea
                name="description"
                rows={2}
                placeholder="สรุปเนื้อหาสั้นๆ 2-3 บรรทัด สำหรับแสดงการ์ดหน้าแรก..."
                value={formData.description}
                onChange={handleChange}
                required
                className="w-full p-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-purple-500 focus:bg-white text-slate-800"
              />
            </div>

            {/* 4. Cover Image URL */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
                URL รูปภาพปก (coverImage)
              </label>
              <input
                type="url"
                name="coverImage"
                placeholder="https://example.com/image.jpg"
                value={formData.coverImage}
                onChange={handleChange}
                className="w-full p-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-purple-500 focus:bg-white text-slate-800"
              />
            </div>

            {/* 5. Full Content */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
                เนื้อหาฉบับเต็ม (content){" "}
                <span className="text-red-500">*</span>
              </label>
              <textarea
                name="content"
                rows={10}
                placeholder="พิมพ์เนื้อหาบทความละเอียดที่นี่ (รองรับ HTML แท็ก หรือข้อความธรรมดา)..."
                value={formData.content}
                onChange={handleChange}
                required
                className="w-full p-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-purple-500 focus:bg-white text-slate-800 font-mono"
              />
            </div>

            {/* Submit Buttons */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <Link
                href="/"
                className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
              >
                ยกเลิก
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-purple-700 hover:bg-purple-800 text-white font-semibold text-sm rounded-full shadow-xs transition-all disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? "กำลังบันทึก..." : "บันทึกบทความ"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
