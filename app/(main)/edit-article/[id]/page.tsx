"use client";

import { useEffect, useState, use } from "react";
import ArticleForm from "@/app/components/Articles/AritclesForm"; // ปรับ Path ตามโครงสร้างโฟลเดอร์ของคุณ
import { HiOutlineArrowLeft } from "react-icons/hi2";
import Link from "next/link";

export default function EditArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // แกะ params id สำหรับ Next.js 15+ (หรือถ้าใช้ Next.js 14 ใช้ params.id ได้เลย)
  const resolvedParams = use(params);
  const articleId = resolvedParams.id;

  const [initialData, setInitialData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArticleDetail = async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || "";
        const res = await fetch(`${baseUrl}/getArticleById?id=${articleId}`);

        if (!res.ok) {
          throw new Error("ไม่สามารถดึงข้อมูลบทความได้");
        }

        const data = await res.json();
        // ปรับตาม Key ที่ API ของคุณตอบกลับมา (เช่น data.article หรือ data)
        setInitialData(data.article || data);
      } catch (err: any) {
        console.error("Fetch article error:", err);
        setError(err.message || "เกิดข้อผิดพลาดในการโหลดข้อมูล");
      } finally {
        setLoading(false);
      }
    };

    if (articleId) {
      fetchArticleDetail();
    }
  }, [articleId]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-200">
        <Link
          href="/my-articles"
          className="p-2 text-slate-500 hover:text-white bg-slate-300 hover:bg-violet-600 rounded-xl transition-colors"
          title="ย้อนกลับ"
        >
          <HiOutlineArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">แก้ไขบทความ</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            แก้ไขรายละเอียดเนื้อหา และข้อมูลประกอบบทความ (ID: {articleId})
          </p>
        </div>
      </div>

      {/* Content Section */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-3">
          <span className="loading loading-spinner loading-lg text-purple-600"></span>
          <p className="text-xs text-slate-500 font-medium">
            กำลังดึงข้อมูลบทความ...
          </p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-600 p-6 rounded-2xl text-center my-8">
          <p className="font-semibold text-sm mb-2">{error}</p>
          <Link
            href="/my-articles"
            className="inline-block text-xs bg-red-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-red-700 transition-colors"
          >
            กลับสู่หน้าบทความของฉัน
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-purple-100 shadow-xl">
          {/* ส่ง mode="edit", articleId และ initialData เข้าไป */}
          <ArticleForm
            mode="edit"
            articleId={articleId}
            initialData={initialData}
          />
        </div>
      )}
    </div>
  );
}
