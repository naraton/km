"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import RichTextEditor from "../RichTextEditor";
import toast, { Toaster } from "react-hot-toast";
import { table } from "console";

// 1. เพิ่ม Type สำหรับ Props
interface ArticleFormProps {
  mode: "create" | "edit" | string;
  articleId?: string; // จำเป็นเมื่อ mode เป็น 'edit'
  initialData?: any;  // ข้อมูลเดิมสำหรับเติมใส่ช่องกรอกตอน Edit
}

// Helper Function สำหรับสร้าง Full URL ตามประเภทไฟล์
const getFullUrl = (path: string | null | undefined, type: "image" | "pdf") => {
  if (!path) return "";

  // ถ้าเป็น Data URL (Base64) หรือมี http/https ครบอยู่แล้ว ให้ใช้ค่านั้นได้เลย
  if (
    path.startsWith("data:") ||
    path.startsWith("http://") ||
    path.startsWith("https://")
  ) {
    return path;
  }

  // 1. เลือก Base URL ตามประเภทไฟล์จาก .env
  const baseUrl = type === "image"
    ? process.env.NEXT_PUBLIC_coverImage
    : process.env.NEXT_PUBLIC_pdfContent;

  if (!baseUrl) {
    console.error(`Missing NEXT_PUBLIC_${type === "image" ? "coverImage" : "pdfContent"} in .env`);
    return path;
  }

  // 2. ดึงเฉพาะชื่อไฟล์ออกมา (ตัด path โฟลเดอร์เดิมออกถ้าติดมาด้วย)
  const fileName = path.split("/").pop() || path;

  // 3. รวม Base URL เข้ากับชื่อไฟล์ (เช่น http://172.18.0.112/KM/coverImage/1785138033_6a670b7171357.jpg)
  const cleanBaseUrl = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
  return `${cleanBaseUrl}/${fileName}`;
};

export default function ArticleForm({
  mode,
  articleId,
  initialData,
}: ArticleFormProps) {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  // ตรวจสอบสิทธิ์การเข้าถึงหน้าเว็บ
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (e) {
      console.error("Failed to parse user from localStorage", e);
    }

    const checkPermission = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        router.push("/no-permission");
        return;
      }

      try {
        const meRes = await fetch("/api/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!meRes.ok) {
          router.push("/no-permission");
          return;
        }

        const me = await meRes.json();
        const roleNames = me.roles || [];

        if (!roleNames.includes("KM")) {
          router.push("/no-permission");
          return;
        }

        setUser(me);
      } catch (err) {
        console.error("Auth check failed:", err);
        router.push("/no-permission");
      }
    };

    checkPermission();
  }, [router]);

  // Drag & Drop State สำหรับรูปภาพ
  const [isDragging, setIsDragging] = useState(false);
  // Drag & Drop State สำหรับ PDF
  const [isPdfDragging, setIsPdfDragging] = useState(false);

  // Form State
  const [formData, setFormData] = useState<{
    categoryId: string;
    isPublished: number;
    title: string;
    tag: string;
    description: string;
    mission: string;
    workGroup: string;
    job: string;
    owner: string;
    implementation: string;
    coverImage: File | string | null;
    content: string;
    pdfContent: File | string | null;
    userId: string;
  }>({
    categoryId: "",
    isPublished: 1,
    title: "",
    tag: "",
    description: "",
    mission: "",
    workGroup: "",
    job: "",
    owner: "",
    implementation: "",
    coverImage: null,
    content: "",
    pdfContent: null,
    userId: "1",
  });

  // สถานะไฟล์รูปภาพที่อัปโหลด
  const [selectedFile, setSelectedFile] = useState<{
    name: string;
    size: string;
    type: string;
    dataUrl: string;
  } | null>(null);

  // สถานะไฟล์ PDF ที่อัปโหลด
  const [selectedPdf, setSelectedPdf] = useState<{
    name: string;
    size: string;
    type: string;
    dataUrl: string;
  } | null>(null);

  // 2. 🟢 เติมข้อมูลเดิมเข้า Form เมื่ออยู่ในโหมด Edit (ปรับปรุงการดึง URL)
  useEffect(() => {
    if (mode === "edit" && initialData) {
      setFormData({
        categoryId: String(initialData.categoryId || ""),
        isPublished: initialData.isPublished ?? 1,
        title: initialData.title || "",
        tag: initialData.tag || "",
        description: initialData.description || "",
        mission: initialData.mission || "",
        workGroup: initialData.workGroup || "",
        job: initialData.job || "",
        owner: initialData.owner || "",
        implementation: initialData.implementation || "",
        coverImage: initialData.coverImage || null,
        content: initialData.content || "",
        pdfContent: initialData.pdfContent || null,
        userId: String(initialData.userId || "1"),
      });

      // 🟢 จัดการ Preview รูปภาพเดิม (ระบุ type เป็น "image")
      if (initialData.coverImage) {
        const fullImageUrl = getFullUrl(initialData.coverImage, "image");
        const fileName = typeof initialData.coverImage === "string"
          ? initialData.coverImage.split("/").pop() || "รูปภาพปกเดิม"
          : "รูปภาพปกเดิม";

        setSelectedFile({
          name: fileName,
          size: "ไฟล์เดิมในระบบ",
          type: "image/*",
          dataUrl: fullImageUrl, // จะได้ http://172.18.0.112/KM/coverImage/1785138033_6a670b7171357.jpg
        });
      }

      // 🟢 จัดการ Preview PDF เดิม (ระบุ type เป็น "pdf")
      if (initialData.pdfContent) {
        const fullPdfUrl = getFullUrl(initialData.pdfContent, "pdf");
        const pdfName = typeof initialData.pdfContent === "string"
          ? initialData.pdfContent.split("/").pop() || "เอกสาร PDF เดิม"
          : "เอกสาร PDF เดิม";

        setSelectedPdf({
          name: pdfName,
          size: "ไฟล์เดิมในระบบ",
          type: "application/pdf",
          dataUrl: fullPdfUrl, // จะได้ http://172.18.0.112/KM/pdfContent/sample.pdf
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

  // --- [ระบบจัดการไฟล์รูปภาพ] ---
  const processFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("รองรับเฉพาะไฟล์รูปภาพ (PNG, JPG, WebP ฯลฯ) เท่านั้น");
      return;
    }

    if (file.size > 1 * 1024 * 1024) {
      toast.error("ขนาดไฟล์รูปภาพต้องไม่เกิน 1MB");
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
        coverImage: file,
      }));
    };
    reader.readAsDataURL(file);
  };

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
    setFormData((prev) => ({ ...prev, coverImage: null }));
  };

  // --- [ระบบจัดการไฟล์ PDF] ---
  const processPdfFile = (file: File) => {
    if (file.type !== "application/pdf" && !file.name.endsWith(".pdf")) {
      toast.error("กรุณาอัปโหลดเฉพาะไฟล์ PDF เท่านั้น");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("ขนาดไฟล์ PDF ต้องไม่เกิน 10MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;

      setSelectedPdf({
        name: file.name,
        size: (file.size / (1024 * 1024)).toFixed(2) + " MB",
        type: file.type,
        dataUrl: result,
      });

      setFormData((prev) => ({
        ...prev,
        pdfContent: file,
      }));
    };
    reader.readAsDataURL(file);
  };

  const handlePdfDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsPdfDragging(true);
  };

  const handlePdfDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsPdfDragging(false);
  };

  const handlePdfDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsPdfDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processPdfFile(e.dataTransfer.files[0]);
    }
  };

  const handlePdfFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processPdfFile(e.target.files[0]);
    }
  };

  const removePdfFile = () => {
    setSelectedPdf(null);
    setFormData((prev) => ({
      ...prev,
      pdfContent: "", // 👈 เคลียร์ค่าใน formData ให้เป็น string ว่าง (หรือ null)
    }));
  };
  // --- Fetch Master Data --------
  const [categoriesData, setCategoriesData] = useState<any>(null);
  const [missionData, setMissionData] = useState<any>(null);

  const getData = async () => {
    try {
      const resCategories = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/getCategories`
      );
      const resMission = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/Depart`
      );

      const categoryData = await resCategories.json();
      const missionDataJson = await resMission.json();

      setCategoriesData(categoryData);
      setMissionData(missionDataJson);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    getData();
  }, []);

  // ดึงกลุ่มงาน เมื่อ formData.mission เปลี่ยน
  const [workGroupsData, setWorkGroupsData] = useState<any>(null);
  useEffect(() => {
    const getWorkGroups = async () => {
      if (!formData.mission) {
        setWorkGroupsData(null);
        return;
      }

      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/Department?departId=${formData.mission}`
        );
        const data = await res.json();
        setWorkGroupsData(data);
      } catch (error) {
        console.error("Error fetching work groups:", error);
        setWorkGroupsData(null);
      }
    };

    getWorkGroups();
  }, [formData.mission]);

  // ดึงงาน เมื่อ formData.workGroup เปลี่ยน
  const [jobsData, setJobsData] = useState<any>(null);
  useEffect(() => {
    const getJobs = async () => {
      if (!formData.workGroup) {
        setJobsData(null);
        return;
      }

      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/DepartmentSub?departMentId=${formData.workGroup}`
        );
        const data = await res.json();
        setJobsData(data);
      } catch (error) {
        console.error("Error fetching jobs:", error);
        setJobsData(null);
      }
    };

    getJobs();
  }, [formData.workGroup]);

  // [Logic Validation] ------------------------------
  const requiredFields: Record<string, string> = {
    categoryId: "หมวดหมู่ความรู้",
    title: "หัวข้อบทความ",
    description: "คำอธิบายสั้น",
    implementation: "การนำไปใช้งาน/การขยายผล",
    owner: "เจ้าของผลงาน",
    coverImage: "รูปหน้าปก",
  };

  const focusField = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });

      if (!el.hasAttribute("tabindex")) {
        el.setAttribute("tabindex", "-1");
      }
      el.focus({ preventScroll: true });

      el.classList.remove("border-slate-200");
      el.classList.add(
        "!border-2",
        "!border-red-500",
        "ring-4",
        "ring-red-200",
        "bg-red-50/20"
      );

      setTimeout(() => {
        el.classList.remove(
          "!border-2",
          "!border-red-500",
          "ring-4",
          "ring-red-200",
          "bg-red-50/20"
        );
        el.classList.add("border-slate-200");
      }, 3000);
    }
  };

  // Submit
  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    for (const key in requiredFields) {
      const value = formData[key as keyof typeof formData];

      if (!value || (typeof value === "string" && value.trim() === "")) {
        const actionText = key === "categoryId" ? "เลือก" : "กรอก";
        const message = `กรุณา${actionText}${requiredFields[key]}`;

        focusField(key);

        toast.error(message, {
          className: "toast-error",
          style: { cursor: "pointer" },
        });

        return;
      }
    }

    setIsSubmitting(true);
    const toastId = toast.loading("กำลังบันทึกข้อมูล...");

    const isEdit = mode === "edit";
    const endpoint = isEdit ? `/api/articles/update` : "/api/articles/insert";

    try {
      const formDataToSend = new FormData();

      const isFile = (val: unknown): val is File => {
        return typeof window !== "undefined" && val instanceof File;
      };

      // 🟢 วนลูปจัดการส่งข้อมูลเข้า FormData
      Object.entries(formData).forEach(([key, value]) => {
        if (value === null || value === undefined) return;

        if (isFile(value)) {
          // ถ้าเป็นไฟล์ใหม่ที่เพิ่งเลือก (File Object)
          formDataToSend.append(key, value);
        } else if (key === "coverImage" || key === "pdfContent") {
          // 💡 ถ้าเป็นเรื่องไฟล์ แต่ไม่ใช่ File Object (แปลว่าไม่ได้เปลี่ยนไฟล์ใหม่)
          // ไม่ต้องส่ง หรือถ้าส่งไปฝั่ง Laravel จะมองเป็น String ปกติ
          if (typeof value === "string" && value.trim() !== "") {
            formDataToSend.append(key, value);
          }
        } else if (typeof value === "string") {
          formDataToSend.append(key, value);
        } else if (typeof value === "object") {
          formDataToSend.append(key, JSON.stringify(value));
        } else {
          formDataToSend.append(key, String(value));
        }
      });

      if (user?.id) {
        formDataToSend.set("userId", String(user.id));
      }

      if (isEdit && articleId) {
        formDataToSend.append("articleId", String(articleId));
      }

      //console.table(Object.fromEntries(formDataToSend.entries()));

      const res = await fetch(endpoint, {
        method: "POST",
        body: formDataToSend,
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(
          isEdit ? "อัปเดตบทความเรียบร้อย!" : "บันทึกบทความเรียบร้อย!",
          { id: toastId }
        );

        if (mode === "edit") {
          router.push("/my-articles");
        } else {
          router.push("/home");
        }
      } else {
        toast.error(
          `เกิดข้อผิดพลาด: ${data.message || data.error || "ไม่สามารถทำรายการได้"}`,
          { id: toastId }
        );

        console.error(data);
      }
    } catch (error) {
      console.error(error);
      toast.error("เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์", { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Toaster position="top-right" reverseOrder={false} />

      {/* 1. Category & Status */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="relative">
          <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
            หมวดหมู่ความรู้ <span className="text-red-500">*</span>
          </label>
          <div className="dropdown w-full">
            <div
              id="categoryId"
              tabIndex={0}
              role="button"
              className="w-full p-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between font-medium text-slate-800 hover:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all cursor-pointer"
            >
              <span>
                {categoriesData?.Categories?.find(
                  (c: any) => String(c.id) === String(formData.categoryId)
                )?.name || "-- เลือกหมวดหมู่ --"}
              </span>
              <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
            <ul tabIndex={0} className="dropdown-content menu bg-white rounded-2xl w-full p-2 shadow-lg border border-purple-100 text-slate-700 mt-1 font-medium text-xs z-[100] space-y-1">
              {categoriesData?.Categories?.map((item: any) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => {
                      handleChange({ target: { name: "categoryId", value: String(item.id) } } as any);
                      (document.activeElement as HTMLElement)?.blur();
                    }}
                    className={`px-3 py-2.5 rounded-xl transition-all ${String(formData.categoryId) === String(item.id)
                      ? "bg-purple-600 text-white font-semibold"
                      : "hover:bg-purple-50 hover:text-purple-700"
                      }`}
                  >
                    {item.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="relative">
          <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
            สถานะการเผยแพร่
          </label>
          <div className="dropdown w-full">
            <div
              tabIndex={0}
              role="button"
              className="w-full p-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between font-medium text-slate-800 hover:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${formData.isPublished === 1 ? "bg-emerald-500" : "bg-amber-500"}`} />
                {formData.isPublished === 1 ? "เผยแพร่ทันที (Public)" : "บันทึกเป็นฉบับร่าง (Draft)"}
              </span>
              <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
            <ul tabIndex={0} className="dropdown-content menu bg-white rounded-2xl w-full p-2 shadow-lg border border-purple-100 text-slate-700 mt-1 font-medium text-xs z-[100] space-y-1">
              <li>
                <button
                  type="button"
                  onClick={() => {
                    setFormData((prev) => ({ ...prev, isPublished: 1 }));
                    (document.activeElement as HTMLElement)?.blur();
                  }}
                  className={`px-3 py-2.5 rounded-xl transition-all flex items-center gap-2 ${formData.isPublished === 1 ? "bg-emerald-600 text-white font-semibold" : "hover:bg-emerald-50"
                    }`}
                >
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
                  className={`px-3 py-2.5 rounded-xl transition-all flex items-center gap-2 ${formData.isPublished === 0 ? "bg-amber-500 text-white font-semibold" : "hover:bg-amber-50"
                    }`}
                >
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
            หัวข้อบทความ <span className="text-red-500">*</span>
          </label>
          <input
            id="title"
            type="text"
            name="title"
            placeholder="เช่น ยาเสพติด : สมองติดยา"
            value={formData.title}
            onChange={handleChange}
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
            placeholder="เช่น ยาเสพติด, สุขภาพ, การป้องกัน"
            value={formData.tag}
            onChange={handleChange}
            className="w-full p-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-purple-500 focus:bg-white text-slate-800"
          />
        </div>
      </div>

      {/* 3. Description */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
          คำอธิบายสั้น / เรื่องย่อ <span className="text-red-500">*</span>
        </label>
        <textarea
          id="description"
          name="description"
          rows={2}
          placeholder="สรุปเนื้อหาสั้นๆ 2-3 บรรทัด..."
          value={formData.description}
          onChange={handleChange}
          className="w-full p-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-purple-500 focus:bg-white text-slate-800"
        />
      </div>

      {/* 4. ภารกิจ / กลุ่มงาน / งาน */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* ภารกิจ */}
        <div className="relative">
          <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
            ภารกิจ
          </label>
          <div className="dropdown w-full">
            <div
              tabIndex={0}
              role="button"
              className="w-full p-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between font-medium text-slate-800 hover:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all cursor-pointer"
            >
              <span>
                {missionData?.Depart?.find(
                  (c: any) => String(c.HR_DEPART_ID) === String(formData.mission)
                )?.HR_DEPART_NAME || "-- เลือกภารกิจ --"}
              </span>
              <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
            <ul tabIndex={0} className="dropdown-content menu bg-white rounded-2xl w-full p-2 shadow-lg border border-purple-100 text-slate-700 mt-1 font-medium text-xs z-[100] space-y-1">
              {missionData?.Depart?.map((item: any) => (
                <li key={item.HR_DEPART_ID}>
                  <button
                    type="button"
                    onClick={() => {
                      setFormData((prev) => ({
                        ...prev,
                        mission: String(item.HR_DEPART_ID),
                        workGroup: "",
                        job: "",
                      }));
                      (document.activeElement as HTMLElement)?.blur();
                    }}
                    className={`px-3 py-2.5 rounded-xl transition-all ${String(formData.mission) === String(item.HR_DEPART_ID)
                      ? "bg-purple-600 text-white font-semibold"
                      : "hover:bg-purple-50 hover:text-purple-700"
                      }`}
                  >
                    {item.HR_DEPART_NAME}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* กลุ่มงาน */}
        <div className="relative">
          <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
            กลุ่มงาน
          </label>
          <div className="dropdown w-full">
            <div
              tabIndex={0}
              role="button"
              className="w-full p-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between font-medium text-slate-800 hover:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all cursor-pointer"
            >
              <span>
                {workGroupsData?.DepartMent?.find(
                  (c: any) => String(c.HR_DEPARTMENT_ID) === String(formData.workGroup)
                )?.HR_DEPARTMENT_NAME || "-- เลือกกลุ่มงาน --"}
              </span>
              <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
            <ul tabIndex={0} className="dropdown-content menu bg-white rounded-2xl w-full p-2 shadow-lg border border-purple-100 text-slate-700 mt-1 font-medium text-xs z-[100] space-y-1">
              {workGroupsData?.DepartMent?.map((item: any) => (
                <li key={item.HR_DEPARTMENT_ID}>
                  <button
                    type="button"
                    onClick={() => {
                      handleChange({ target: { name: "workGroup", value: String(item.HR_DEPARTMENT_ID) } } as any);
                      (document.activeElement as HTMLElement)?.blur();
                    }}
                    className={`px-3 py-2.5 rounded-xl transition-all ${String(formData.workGroup) === String(item.HR_DEPARTMENT_ID)
                      ? "bg-purple-600 text-white font-semibold"
                      : "hover:bg-purple-50 hover:text-purple-700"
                      }`}
                  >
                    {item.HR_DEPARTMENT_NAME}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* งาน */}
        <div className="relative">
          <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
            งาน
          </label>
          <div className="dropdown w-full">
            <div
              tabIndex={0}
              role="button"
              className="w-full p-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between font-medium text-slate-800 hover:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all cursor-pointer"
            >
              <span>
                {jobsData?.DepartMentSub?.find(
                  (c: any) => String(c.HR_DEPARTMENT_SUB_ID) === String(formData.job)
                )?.HR_DEPARTMENT_SUB_NAME || "-- เลือกงาน --"}
              </span>
              <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
            <ul tabIndex={0} className="dropdown-content menu bg-white rounded-2xl w-full p-2 shadow-lg border border-purple-100 text-slate-700 mt-1 font-medium text-xs z-[100] space-y-1">
              {jobsData?.DepartMentSub?.map((item: any) => (
                <li key={item.HR_DEPARTMENT_SUB_ID}>
                  <button
                    type="button"
                    onClick={() => {
                      handleChange({ target: { name: "job", value: String(item.HR_DEPARTMENT_SUB_ID) } } as any);
                      (document.activeElement as HTMLElement)?.blur();
                    }}
                    className={`px-3 py-2.5 rounded-xl transition-all ${String(formData.job) === String(item.HR_DEPARTMENT_SUB_ID)
                      ? "bg-purple-600 text-white font-semibold"
                      : "hover:bg-purple-50 hover:text-purple-700"
                      }`}
                  >
                    {item.HR_DEPARTMENT_SUB_NAME}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* 5. เจ้าของผลงาน */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
          เจ้าของผลงาน <span className="text-red-500">*</span>
        </label>
        <input
          id="owner"
          type="text"
          name="owner"
          placeholder="ชื่อ-นามสกุล"
          value={formData.owner}
          onChange={handleChange}
          className="w-full p-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-purple-500 focus:bg-white text-slate-800"
        />
      </div>

      {/* 6. การนำไปใช้งาน/การขยายผล */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
          การนำไปใช้งาน/การขยายผล <span className="text-red-500">*</span>
        </label>
        <textarea
          id="implementation"
          name="implementation"
          rows={2}
          placeholder="สรุปเนื้อหาสั้นๆ 2-3 บรรทัด..."
          value={formData.implementation}
          onChange={handleChange}
          className="w-full p-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-purple-500 focus:bg-white text-slate-800"
        />
      </div>

      {/* 7. Image Upload (Drag & Drop) */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
          รูปภาพหน้าปก <span className="text-red-500">*</span>
        </label>

        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer ${isDragging
            ? "border-purple-600 bg-purple-50/50 scale-[1.01]"
            : "border-purple-200 bg-slate-50/50 hover:border-purple-400 hover:bg-purple-50/20"
            }`}
        >
          <input
            id="coverImage"
            type="file"
            accept="image/*"
            onChange={handleFileInput}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
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
            <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-purple-200 shadow-xs relative z-20">
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
                className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0 z-30"
                title="ลบไฟล์รูปภาพ"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 8. Full Content (RichTextEditor) */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
          เนื้อหาฉบับเต็ม (Content)
        </label>
        <RichTextEditor
          value={formData.content}
          onChange={(newContent) =>
            setFormData((prev) => ({ ...prev, content: newContent }))
          }
        />
      </div>

      {/* 9. PDF Content Upload (เพิ่มใหม่) */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
          ไฟล์เนื้อหาฉบับ PDF (Drag & Drop File)
        </label>

        <div
          onDragOver={handlePdfDragOver}
          onDragLeave={handlePdfDragLeave}
          onDrop={handlePdfDrop}
          className={`relative border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer ${isPdfDragging
            ? "border-red-500 bg-red-50/50 scale-[1.01]"
            : "border-slate-200 bg-slate-50/50 hover:border-red-400 hover:bg-red-50/20"
            }`}
        >
          <input
            type="file"
            accept=".pdf,application/pdf"
            onChange={handlePdfFileInput}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          />

          {!selectedPdf ? (
            <div className="space-y-3 pointer-events-none">
              <div className="w-12 h-12 mx-auto rounded-full bg-red-100 text-red-600 flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-700">
                  ลากไฟล์ PDF มาวางที่นี่ หรือ <span className="text-red-600 underline">คลิกเพื่อเลือกไฟล์</span>
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  รองรับเฉพาะไฟล์ PDF ขนาดไม่เกิน 10MB
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-red-200 shadow-xs relative z-20">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-12 h-12 rounded-lg bg-red-50 border border-red-100 text-red-500 flex items-center justify-center shrink-0">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="text-left truncate">
                  <p className="text-xs font-semibold text-slate-800 truncate">
                    {selectedPdf.name}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    {selectedPdf.size}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removePdfFile();
                }}
                className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0 z-30"
                title="ลบไฟล์ PDF"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ปุ่ม Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-5 py-2.5 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-xl text-xs font-semibold transition-all cursor-pointer"
        >
          ยกเลิก
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-purple-200 transition-all disabled:opacity-50 cursor-pointer"
        >
          {isSubmitting ? "กำลังบันทึก..." : mode === "edit" ? "อัปเดตบทความ" : "บันทึกบทความ"}
        </button>
      </div>
    </form>
  );
}