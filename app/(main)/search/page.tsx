"use client";
import { useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import {
  HiOutlineDocumentText,
  HiOutlineUser,
  HiOutlineTag,
} from "react-icons/hi2";

interface Article {
  id: number;
  title: string;
  tag: string;
  description: string;
  owner: string;
  implementation: string;
  content: string;
}

// แยกส่วนเนื้อหาการค้นหาออกมารับ searchParams
function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";

  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query) return;
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "";

    const fetchSearchResults = async () => {
      setLoading(true);
      try {
        // ✅ แก้ไข Endpoint ให้ตรงกับ Route Laravel (searchArticles)
        const res = await fetch(`${baseUrl}/searchArticles?search=${encodeURIComponent(query)}`);
        const data = await res.json();

        // รับค่าจาก response ['Articles' => $articles]
        setArticles(data.Articles || data.data || []);
      } catch (error) {
        console.error("Search Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSearchResults();
  }, [query]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-800">
          ผลการค้นหาสำหรับ: <span className="text-violet-600">"{query}"</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          พบ {articles.length} รายการที่เกี่ยวข้อง
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <span className="loading loading-spinner loading-lg text-violet-600"></span>
        </div>
      ) : articles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {articles.map((item) => (
            <div
              key={item.id}
              className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-lg transition-all duration-200 flex flex-col justify-between border border-violet-400"
            >
              <div>
                {/* Tag */}
                {item.tag && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-violet-600 bg-violet-50 px-2.5 py-1 rounded-md mb-2">
                    <HiOutlineTag className="w-3 h-3" />
                    {item.tag}
                  </span>
                )}

                {/* Title */}
                <h2 className="font-bold text-slate-800 text-base line-clamp-2 mb-2">
                  {item.title}
                </h2>

                {/* Description */}
                <p className="text-xs text-slate-500 line-clamp-3 mb-4">
                  {item.description || "ไม่มีรายละเอียดสรุป"}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3 text-xs text-slate-400">
                {/* Owner: เพิ่ม truncate และ min-w-0 เพื่อไม่ให้ดันปุ่ม */}
                <span className="flex items-center gap-1.5 min-w-0">
                  <HiOutlineUser className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{item.owner || "ไม่ระบุผู้เขียน"}</span>
                </span>

                {/* Button: เพิ่ม shrink-0 และ whitespace-nowrap ป้องกันปุ่มถูกบีบ */}
                <Link
                  href={`/articlesView/${item.id}`}
                  className="shrink-0 whitespace-nowrap text-violet-600 hover:text-white font-medium border border-violet-400 rounded-full px-3 py-1 hover:bg-violet-600 transition-colors duration-200"
                >
                  อ่านต่อ &gt;&gt;
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-12 text-center border border-violet-400/60">
          <HiOutlineDocumentText className="w-12 h-12 text-violet-500 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-violet-500">
            ไม่พบข้อมูลที่ตรงกับคำค้นหา
          </h3>
          <p className="text-xs text-violet-400 mt-1">
            ลองใช้คำค้นหาอื่น เช่น ชื่อหัวข้อ แท็ก หรือชื่อผู้เขียน
          </p>
        </div>
      )}
    </div>
  );
}

// Component หลักที่ถูกครอบด้วย Suspense
export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center py-12">
        <span className="loading loading-spinner loading-lg text-violet-600"></span>
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}