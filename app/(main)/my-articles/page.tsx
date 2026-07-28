"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  HiOutlinePencilSquare,
  HiOutlinePlus,
  HiOutlineDocumentText,
} from "react-icons/hi2";

interface Article {
  id: number;
  title: string;
  description: string;
  isPublished: number;
  viewsCount: number;
  createdAt: string;
}

export default function MyArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  // ดึงข้อมูลบทความของผู้ใช้
  useEffect(() => {
    const fetchMyArticles = async () => {
      // ดึง user จาก localStorage หรือ State Management ของคุณ
      const storedUser = localStorage.getItem("user");
      const user = storedUser ? JSON.parse(storedUser) : null;

      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || "";
        const res = await fetch(`${baseUrl}/getMyArticles?userId=${user.id}`);
        const data = await res.json();
        setArticles(data.Articles || []);
      } catch (error) {
        console.error("Fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMyArticles();
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">บทความของฉัน</h1>
          <p className="text-xs text-slate-500 mt-1">
            จัดการบทความและองค์ความรู้ทั้งหมดที่คุณเป็นผู้เขียน
          </p>
        </div>

        <Link
          href="/articles/create"
          className="inline-flex items-center gap-1.5 bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium px-4 py-2 rounded-xl transition-all shadow-md hover:shadow-violet-200 shrink-0 whitespace-nowrap"
        >
          <HiOutlinePlus className="w-4 h-4" />
          เขียนบทความใหม่
        </Link>
      </div>

      {/* Content Section */}
      {loading ? (
        <div className="flex justify-center py-16">
          <span className="loading loading-spinner loading-lg text-violet-600"></span>
        </div>
      ) : articles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {articles.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl p-5 border border-purple-300 shadow-sm hover:shadow-lg transition-all duration-200 flex flex-col justify-between"
            >
              <div>
                {/* Status Badge */}
                <div className="flex items-center justify-between mb-3">
                  <span
                    className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${item.isPublished === 1
                      ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                      : "bg-amber-50 text-amber-600 border border-amber-200"
                      }`}
                  >
                    {item.isPublished === 1 ? "เผยแพร่แล้ว" : "ฉบับร่าง"}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {new Date(item.createdAt).toLocaleDateString("th-TH")}
                  </span>
                </div>

                {/* Title */}
                <h3 className="font-bold text-slate-800 text-base line-clamp-2 mb-2">
                  {item.title}
                </h3>

                {/* Description */}
                <p className="text-xs text-slate-500 line-clamp-3 mb-4">
                  {item.description || "ไม่มีรายละเอียดสรุป"}
                </p>
              </div>

              {/* Action Buttons Section */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1">
                  {/* ✏️ ปุ่มแก้ไขบทความ */}
                  <Link
                    href={`/edit-article/${item.id}`}
                    className="p-2 text-amber-600 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors flex items-center gap-1 text-xs font-medium"
                    title="แก้ไขบทความ"
                  >
                    <HiOutlinePencilSquare className="w-4 h-4" />
                    <span>แก้ไข</span>
                  </Link>
                </div>

                {/* ปุ่มอ่านต่อ / ดูรายละเอียดเพิ่มเติม */}
                <Link
                  href={`/articlesView/${item.id}`}
                  className="shrink-0 whitespace-nowrap text-xs text-violet-600 hover:text-white font-medium border border-violet-400 rounded-full px-3 py-1 hover:bg-violet-600 transition-colors"
                >
                  อ่านต่อ &gt;&gt;
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-12 text-center border border-purple-200">
          <HiOutlineDocumentText className="w-12 h-12 text-violet-400 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-700">
            คุณยังไม่มีบทความ
          </h3>
          <p className="text-xs text-slate-400 mt-1 mb-4">
            เริ่มต้นแบ่งปันองค์ความรู้ของคุณโดยการสร้างบทความแรก
          </p>
          <Link
            href="/articles/create"
            className="inline-flex items-center gap-1 bg-violet-600 text-white text-xs font-medium px-4 py-2 rounded-xl hover:bg-violet-700 transition-colors"
          >
            <HiOutlinePlus className="w-4 h-4" />
            เขียนบทความใหม่
          </Link>
        </div>
      )}
    </div>
  );
}
