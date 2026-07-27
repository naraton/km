'use client'

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import ArticleCard, { Article } from "@/app/components/Articles/ArticleCard";
import { 
  FaArrowLeft, 
  FaSearch, 
  FaBookOpen, 
  FaLayerGroup,
  FaSortAmountDown
} from "react-icons/fa";

export default function CategoryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const categoryId = params?.id;

  const [categoryName, setCategoryName] = useState<string>("กำลังโหลดหมวดหมู่...");
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<"latest" | "popular">("latest");

  // Pagination State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 6; // แสดงหน้าละ 6 บทความ

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const baseUrl = process.env.NEXT_PUBLIC_API_URL;

        const [resCat, resArt] = await Promise.all([
          fetch(`${baseUrl}/getCategories`),
          fetch(`${baseUrl}/getArticles`),
        ]);

        const catData = await resCat.json();
        const artData = await resArt.json();

        // หาชื่อหมวดหมู่ปัจจุบัน
        const currentCategory = (catData.Categories || []).find(
          (cat: any) => String(cat.id) === String(categoryId)
        );
        if (currentCategory) {
          setCategoryName(currentCategory.name);
        } else {
          setCategoryName(`หมวดหมู่ ID: ${categoryId}`);
        }

        // กรองเฉพาะบทความที่อยู่ในหมวดหมู่นี้ และ Publish แล้ว
        const matched = (artData.Articles || []).filter(
          (art: any) =>
            String(art.categoryId) === String(categoryId) &&
            Number(art.isPublished) === 1
        );

        setArticles(matched);
      } catch (err) {
        console.error("Fetch category articles error:", err);
      } finally {
        setLoading(false);
      }
    };

    if (categoryId) {
      fetchData();
    }
  }, [categoryId]);

  // --- Filter & Sort Logic ---
  const filteredArticles = articles
    .filter((art) => {
      const matchSearch =
        art.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        art.description?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchSearch;
    })
    .sort((a, b) => {
      if (sortBy === "popular") {
        return (b.viewsCount || 0) - (a.viewsCount || 0);
      }
      return 0; // ค่าเริ่มต้นเรียงตามลำดับปกติ
    });

  // --- Pagination Logic ---
  const totalPages = Math.ceil(filteredArticles.length / itemsPerPage) || 1;
  const paginatedArticles = filteredArticles.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600"></div>
        <p className="text-purple-600 text-sm font-medium">กำลังโหลดคลังความรู้...</p>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen py-6 px-2 sm:px-6 max-w-7xl mx-auto space-y-6">
      {/* 1. Top Bar: ปุ่มย้อนกลับ & Breadcrumb */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300 hover:text-purple-600 font-medium transition-colors bg-base-100 border border-base-300 px-3 py-1.5 rounded-full shadow-2xs cursor-pointer"
        >
          <FaArrowLeft className="w-3 h-3" />
          <span>ย้อนกลับ</span>
        </button>

        <div className="text-xs text-base-content/50 flex items-center gap-2">
          <Link href="/home" className="hover:underline">หน้าหลัก</Link>
          <span>/</span>
          <span className="text-purple-600 font-medium">คลังบทความ</span>
        </div>
      </div>

      {/* 2. Header Banner: หัวข้อหมวดหมู่ */}
      <div className="bg-gradient-to-r from-purple-900 via-purple-800 to-indigo-900 rounded-2xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-light text-purple-200">
            <FaLayerGroup className="w-3 h-3" />
            <span>คลังความรู้แบบเจาะลึก</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            {categoryName}
          </h1>
          <p className="text-xs sm:text-sm text-purple-100/80 max-w-2xl leading-relaxed">
            รวบรวมบทความ องค์ความรู้ และแนวปฏิบัติที่ดีที่สุดในหมวดหมู่ {categoryName} ทั้งหมด {articles.length} รายการ
          </p>
        </div>

        {/* Decorative Circle Background */}
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-purple-500/20 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* 3. Filter & Search Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-base-100 p-4 rounded-xl border border-base-200 shadow-2xs">
        {/* ช่องค้นหาภายในหมวดหมู่ */}
        <div className="relative w-full sm:w-80">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-base-content/40" />
          <input
            type="text"
            placeholder="ค้นหาในหมวดหมู่นี้..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1); // รีเซ็ตไปหน้า 1 เมื่อค้นหา
            }}
            className="w-full text-xs pl-9 pr-4 py-2 rounded-lg border border-base-300 bg-base-200/50 focus:outline-none focus:border-purple-500 transition-all"
          />
        </div>

        {/* การเรียงลำดับ */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <span className="text-xs text-base-content/60 flex items-center gap-1">
            <FaSortAmountDown className="w-3 h-3" /> เรียงตาม:
          </span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="text-xs border border-base-300 rounded-lg px-3 py-2 bg-base-100 focus:outline-none focus:border-purple-500"
          >
            <option value="latest">ล่าสุด</option>
            <option value="popular">ยอดนิยม (Views)</option>
          </select>
        </div>
      </div>

      {/* 4. Article Grid */}
      {paginatedArticles.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedArticles.map((article, index) => (
            <ArticleCard
              key={article.id ?? `cat-article-${index}`}
              article={article}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 bg-base-100 rounded-2xl border border-dashed border-base-300 text-center space-y-3">
          <div className="p-4 rounded-full bg-purple-50 dark:bg-purple-950/30 text-purple-500">
            <FaBookOpen className="w-8 h-8" />
          </div>
          <p className="text-sm font-semibold text-base-content">
            {searchQuery ? "ไม่พบบทความที่ตรงกับการค้นหา" : "ยังไม่มีบทความในหมวดหมู่นี้"}
          </p>
          <p className="text-xs text-base-content/50 max-w-xs">
            {searchQuery ? "ลองเปลี่ยนคำค้นหาใหม่อีกครั้ง" : "ระบบกำลังอัปเดตข้อมูลเพิ่มเติมเร็วๆ นี้"}
          </p>
        </div>
      )}

      {/* 5. Pagination Bar */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-6">
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-1.5 text-xs rounded-lg border border-base-300 bg-base-100 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-base-200 transition-colors"
          >
            ก่อนหน้า
          </button>

          <div className="flex gap-1">
            {Array.from({ length: totalPages }).map((_, i) => {
              const pageNum = i + 1;
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-8 h-8 text-xs rounded-lg font-medium transition-all ${
                    currentPage === pageNum
                      ? "bg-purple-600 text-white shadow-xs"
                      : "bg-base-100 border border-base-300 hover:bg-base-200"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-3 py-1.5 text-xs rounded-lg border border-base-300 bg-base-100 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-base-200 transition-colors"
          >
            ถัดไป
          </button>
        </div>
      )}

    </div>
  );
}