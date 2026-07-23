"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import RichTextEditor from "../RichTextEditor";

// 1. เพิ่ม Type สำหรับ Props
interface ArticleFormProps {
  mode: "create" | "edit" | string;
  articleId?: string; // จำเป็นเมื่อ mode เป็น 'edit'
  initialData?: any;  // ข้อมูลเดิมสำหรับเติมใส่ช่องกรอกตอน Edit
}

export default function ArticleForm({
  mode,
  articleId,
  initialData,
}: ArticleFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    tag: "",
    description: "",
    mission: "",
    workGroup: "",
    job: "",
    owner: "",
    implementation: "",
    content: "",
    attachment: "",
    categoryId: "",
    userId: "1",
    isPublished: 1,
  });

  // สถานะไฟล์ที่อัปโหลด
  const [selectedFile, setSelectedFile] = useState<{
    name: string;
    size: string;
    type: string;
    dataUrl: string;
  } | null>(null);

  // 2. เติมข้อมูลเดิมเข้า Form เมื่ออยู่ในโหมด Edit
  useEffect(() => {
    if (mode === "edit" && initialData) {
      setFormData({
        title: initialData.title || "",
        tag: initialData.tag || "",
        description: initialData.description || "",
        mission: initialData.mission || "",
        workGroup: initialData.workGroup || "",
        job: initialData.job || "",
        owner: initialData.owner || "",
        implementation: initialData.implementation || "",
        content: initialData.content || "",
        attachment: initialData.attachment || "",
        categoryId: String(initialData.categoryId || ""),
        userId: String(initialData.userId || "1"),
        isPublished: initialData.isPublished ?? 1,
      });

      // ถ้ามีรูปเดิมแสดงพรีวิว
      if (initialData.attachment) {
        setSelectedFile({
          name: "รูปภาพเดิมที่อัปโหลดไว้",
          size: "-",
          type: "image/*",
          dataUrl: initialData.attachment,
        });
      }
    }
  }, [mode, initialData]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ฟังก์ชันแปลงไฟล์เป็น Base64
  const processFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("รองรับเฉพาะไฟล์รูปภาพ (PNG, JPG, WebP ฯลฯ) เท่านั้นครับ");
      return;
    }

    if (file.size > 1 * 1024 * 1024) {
      alert("ขนาดไฟล์ต้องไม่เกิน 1MB ครับ");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;

      setSelectedFile({
        name: file.name,
        size: (file.size / (1024 * 1024)).toFixed(2) + " MB",
        type: file.type,
        dataUrl: result,
      });

      setFormData((prev) => ({
        ...prev,
        attachment: result,
      }));
    };
    reader.readAsDataURL(file);
  };

  // Drag & Drop Handlers
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setFormData((prev) => ({ ...prev, attachment: "" }));
  };

  // 3. ปรับ Logic ส่งข้อมูลตาม mode
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const isEdit = mode === "edit";
    const endpoint = isEdit ? `/api/articles/${articleId}` : "/api/articles";
    const method = isEdit ? "PUT" : "POST";

    try {
      const res = await fetch(endpoint, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        alert(
          isEdit
            ? "อัปเดตบทความเรียบร้อยแล้ว!"
            : "บันทึกบทความเรียบร้อยแล้ว!"
        );
        router.push("/");
        router.refresh();
      } else {
        const errorData = await res.json();
        alert(`เกิดข้อผิดพลาด: ${errorData.message || "ไม่สามารถดำเนินการได้"}`);
      }
    } catch (error) {
      console.error(error);
      alert("เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 1. Category & Status */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Category Dropdown */}
        <div className="relative">
          <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
            หมวดหมู่ความรู้ (categoryId) <span className="text-red-500">*</span>
          </label>
          <div className="dropdown w-full">
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
              <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
            <ul
              tabIndex={0}
              className="dropdown-content menu bg-white rounded-2xl w-full p-2 shadow-lg border border-purple-100 text-slate-700 mt-1 font-medium text-xs z-[100] space-y-1"
            >
              <li className="menu-title px-1 py-1">
                <div className="px-2 py-1 border-b border-slate-100 w-full">
                  <p className="text-[10px] font-bold text-purple-600 uppercase tracking-wider">
                    เลือกหมวดหมู่
                  </p>
                </div>
              </li>
              {[
                { id: "1", label: "คลังข้อมูลโรคที่มีผลกระทบสูง" },
                { id: "2", label: "คลังข้อมูลการวิจัย" },
                { id: "3", label: "คลังข้อมูลนวัตกรรม" },
                { id: "4", label: "คลังข้อมูลความรู้ด้านสุขภาพ" },
              ].map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => {
                      handleChange({ target: { name: "categoryId", value: item.id } } as any);
                      (document.activeElement as HTMLElement)?.blur();
                    }}
                    className={`px-3 py-2.5 rounded-xl transition-all ${
                      formData.categoryId === item.id
                        ? "bg-purple-600 text-white font-semibold"
                        : "hover:bg-purple-50 hover:text-purple-700"
                    }`}
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Status Dropdown */}
        <div className="relative">
          <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
            สถานะการเผยแพร่ (isPublished)
          </label>
          <div className="dropdown w-full">
            <div
              tabIndex={0}
              role="button"
              className="w-full p-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between font-medium text-slate-800 hover:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <span
                  className={`w-2 h-2 rounded-full ${
                    formData.isPublished === 1 ? "bg-emerald-500" : "bg-amber-500"
                  }`}
                />
                {formData.isPublished === 1 ? "เผยแพร่ทันที (Public)" : "บันทึกเป็นฉบับร่าง (Draft)"}
              </span>
              <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
            <ul
              tabIndex={0}
              className="dropdown-content menu bg-white rounded-2xl w-full p-2 shadow-lg border border-purple-100 text-slate-700 mt-1 font-medium text-xs z-[100] space-y-1"
            >
              <li className="menu-title px-1 py-1">
                <div className="px-2 py-1 border-b border-slate-100 w-full">
                  <p className="text-[10px] font-bold text-purple-600 uppercase tracking-wider">
                    เลือกสถานะ
                  </p>
                </div>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => {
                    setFormData((prev) => ({ ...prev, isPublished: 1 }));
                    (document.activeElement as HTMLElement)?.blur();
                  }}
                  className={`px-3 py-2.5 rounded-xl transition-all flex items-center gap-2 ${
                    formData.isPublished === 1
                      ? "bg-emerald-600 text-white font-semibold"
                      : "hover:bg-emerald-50 hover:text-emerald-700"
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${formData.isPublished === 1 ? "bg-white" : "bg-emerald-500"}`} />
                  เผยแพร่ทันที (Public)
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => {
                    setFormData((prev) => ({ ...prev, isPublished: 0 }));
                    (document.activeElement as HTMLElement)?.blur();
                  }}
                  className={`px-3 py-2.5 rounded-xl transition-all flex items-center gap-2 ${
                    formData.isPublished === 0
                      ? "bg-amber-500 text-white font-semibold"
                      : "hover:bg-amber-50 hover:text-amber-700"
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${formData.isPublished === 0 ? "bg-white" : "bg-amber-500"}`} />
                  บันทึกเป็นฉบับร่าง (Draft)
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* 2. Title & Tag */}
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
            หัวข้อบทความ (title) <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="title"
            placeholder="เช่น ยาเสพติด : สมองติดยา"
            value={formData.title}
            onChange={handleChange}
            required
            className="w-full p-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-purple-500 focus:bg-white text-slate-800"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
            คำค้น / แท็ก (tag)
          </label>
          <input
            type="text"
            name="tag"
            placeholder="เช่น ยาเสพติด, สุขภาพ, การป้องกัน (คั่นด้วยเครื่องหมายจุลภาค)"
            value={formData.tag}
            onChange={handleChange}
            className="w-full p-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-purple-500 focus:bg-white text-slate-800"
          />
        </div>
      </div>

      {/* 3. Description */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
          คำอธิบายสั้น / เรื่องย่อ (description) <span className="text-red-500">*</span>
        </label>
        <textarea
          name="description"
          rows={2}
          placeholder="สรุปเนื้อหาสั้นๆ 2-3 บรรทัด..."
          value={formData.description}
          onChange={handleChange}
          required
          className="w-full p-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-purple-500 focus:bg-white text-slate-800"
        />
      </div>

      {/* 4. ภารกิจ / กลุ่มงาน / งาน */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
            ภารกิจ
          </label>
          <div className="relative">
            <select
              name="mission"
              value={formData.mission}
              onChange={handleChange}
              className="w-full p-2.5 text-sm bg-white border border-slate-200 rounded-xl appearance-none focus:outline-none focus:ring-1 focus:ring-purple-500 text-slate-700 font-medium pr-8 cursor-pointer"
            >
              <option value="">-- ค้นหาภารกิจ --</option>
              <option value="1">ภารกิจที่ 1</option>
              <option value="2">ภารกิจที่ 2</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-2.5 pointer-events-none text-slate-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
            กลุ่มงาน
          </label>
          <div className="relative">
            <select
              name="workGroup"
              value={formData.workGroup}
              onChange={handleChange}
              className="w-full p-2.5 text-sm bg-white border border-slate-200 rounded-xl appearance-none focus:outline-none focus:ring-1 focus:ring-purple-500 text-slate-700 font-medium pr-8 cursor-pointer"
            >
              <option value="">-- ค้นหากลุ่มงาน --</option>
              <option value="1">กลุ่มงานที่ 1</option>
              <option value="2">กลุ่มงานที่ 2</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-2.5 pointer-events-none text-slate-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
            งาน
          </label>
          <div className="relative">
            <select
              name="job"
              value={formData.job}
              onChange={handleChange}
              className="w-full p-2.5 text-sm bg-white border border-slate-200 rounded-xl appearance-none focus:outline-none focus:ring-1 focus:ring-purple-500 text-slate-700 font-medium pr-8 cursor-pointer"
            >
              <option value="">-- ค้นหางาน --</option>
              <option value="1">งานที่ 1</option>
              <option value="2">งานที่ 2</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-2.5 pointer-events-none text-slate-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* 5. เจ้าของผลงาน */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
          เจ้าของผลงาน (owner) <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="owner"
          placeholder="ชื่อ-นามสกุล"
          value={formData.owner}
          onChange={handleChange}
          required
          className="w-full p-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-purple-500 focus:bg-white text-slate-800"
        />
      </div>

      {/* 6. การนำไปใช้งาน/การขยายผล */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
          การนำไปใช้งาน/การขยายผล (Implementation/Expansion) <span className="text-red-500">*</span>
        </label>
        <textarea
          name="implementation"
          rows={2}
          placeholder="สรุปเนื้อหาสั้นๆ 2-3 บรรทัด..."
          value={formData.implementation}
          onChange={handleChange}
          required
          className="w-full p-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-purple-500 focus:bg-white text-slate-800"
        />
      </div>

      {/* 7. Drag & Drop File Upload */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
          รูปภาพปก (Drag & Drop File)
        </label>

        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer ${
            isDragging
              ? "border-purple-600 bg-purple-50/50 scale-[1.01]"
              : "border-purple-200 bg-slate-50/50 hover:border-purple-400 hover:bg-purple-50/20"
          }`}
        >
          <input
            type="file"
            accept="image/*"
            onChange={handleFileInput}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />

          {!selectedFile ? (
            <div className="space-y-3 pointer-events-none">
              <div className="w-12 h-12 mx-auto rounded-full bg-purple-100 text-purple-600 flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-700">
                  ลากไฟล์รูปภาพมาวางที่นี่ หรือ <span className="text-purple-600 underline">คลิกเพื่อเลือกไฟล์</span>
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  รองรับไฟล์ภาพ (PNG, JPG, WebP) ขนาดไม่เกิน 1MB
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-purple-200 shadow-xs relative z-10">
              <div className="flex items-center gap-3 overflow-hidden">
                <img
                  src={selectedFile.dataUrl}
                  alt="Preview"
                  className="w-12 h-12 object-cover rounded-lg border border-slate-200 shrink-0"
                />
                <div className="text-left truncate">
                  <p className="text-xs font-semibold text-slate-800 truncate">
                    {selectedFile.name}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    {selectedFile.size}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile();
                }}
                className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                title="ลบไฟล์"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 8. Full Content */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
          เนื้อหาฉบับเต็ม (content) <span className="text-red-500">*</span>
        </label>
        {/* เรียกใช้งาน RichTextEditor แทน textarea เดิม */}
        <RichTextEditor
          value={formData.content}
          onChange={(newContent) =>
            setFormData((prev) => ({ ...prev, content: newContent }))
          }
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
          {isSubmitting
            ? "กำลังบันทึก..."
            : mode === "edit"
            ? "บันทึกการแก้ไข"
            : "บันทึกบทความ"}
        </button>
      </div>
    </form>
  );
}