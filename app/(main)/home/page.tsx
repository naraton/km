'use client'

import React, { useEffect, useState } from "react";
import ArticleCard, { Article } from "@/app/components/Articles/ArticleCard";
import {
  FaBookOpen,
  FaFlask,
  FaLightbulb,
  FaHeartbeat,
  FaUser,
} from "react-icons/fa";
import Link from "next/link";

// --- Map Icon ให้ตรงกับใน DB ---
const iconMap: Record<string, React.ReactNode> = {
  FaHeartbeat: <FaHeartbeat className="w-5 h-5 text-purple-600" />,
  FaFlask: <FaFlask className="w-5 h-5 text-purple-600" />,
  FaLightbulb: <FaLightbulb className="w-5 h-5 text-purple-600" />,
  FaBookOpen: <FaBookOpen className="w-5 h-5 text-purple-600" />,
};

interface CategorySectionProps {
  id: number | string;
  title: string;
  icon?: React.ReactNode;
  items: Article[];
}

interface CommentProps {
  author: string;
  timeAgo: string;
  message: string;
}

// --- Mock Comments ---
const mockComments: CommentProps[] = [
  { author: "ธนกานต์ ขอนกลาง", timeAgo: "362 วันที่แล้ว", message: "บทความมีประโยชน์มากเลยค่ะ" },
  { author: "ยศวรรธน์ บุญรอด", timeAgo: "362 วันที่แล้ว", message: "ดีค่ะ" },
  { author: "เทพฤทธิ์ เกื้อแก้ว", timeAgo: "362 วันที่แล้ว", message: "ขอบคุณครับ" },
  { author: "เตชิน รัตนวิสุทธิ์", timeAgo: "363 วันที่แล้ว", message: "เยี่ยมมากค่ะ" },
  { author: "อัมพร หมวดไธสง", timeAgo: "363 วันที่แล้ว", message: "มีประโยชน์มากค่ะ" },
  { author: "พงศ์ไทย สิงห์เชตอู่", timeAgo: "363 วันที่แล้ว", message: "เนื้อหาดีมากค่ะ" },
];

// --- หมวดหมู่ใหญ่ (ดึง ArticleCard มาใช้เรนเดอร์ + Pagination) ---
const CategorySection: React.FC<CategorySectionProps> = ({ id, title, icon, items }) => {
  // สเตตสำหรับเก็บหน้าที่กำลังแสดงผลอยู่ (เริ่มที่หน้า 0)
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 2; // แสดงทีละ 2 บทความ

  // คำนวณจำนวนหน้าทั้งหมด (ถ้าไม่มีข้อมูลให้มีอย่างน้อย 1 หน้า)
  const totalPages = Math.ceil(items.length / itemsPerPage) || 1;

  // ตัดแบ่งข้อมูลบทความมาแสดงเฉพาะหน้าที่เลือกอยู่
  const displayedItems = items.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  return (
    <div className="flex flex-col gap-3">
      <div className="border border-purple-300 dark:border-purple-800/60 rounded-2xl p-4 bg-base-100/50 shadow-xs flex flex-col justify-between min-h-[220px]">
        {/* ส่วนหัวหมวดหมู่ (ใช้ justify-between ดันลิงก์ไปขวาสุด) */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-full bg-purple-100 dark:bg-purple-950/40 border border-purple-300 dark:border-purple-800/60">
              {icon || <FaBookOpen className="w-5 h-5 text-purple-600" />}
            </div>
            <h3 className="font-semibold text-lg text-base-content">{title}</h3>
          </div>

          {/* ลิงก์ Read more อยู่ขวาสุด */}
          <Link
            href={`/categories/${id}`}
            className="text-xs sm:text-sm font-medium text-purple-600 hover:text-purple-700 bg-purple-300/10 hover:bg-purple-300 transition-colors flex items-center gap-1 border border-purple-300 dark:border-purple-800/60 rounded-full px-2 py-1"
          >
            &laquo; View More
          </Link>
        </div>

        {/* กล่องใส่บทความ */}
        {items.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
            {displayedItems.map((item, index) => (
              <Link
                href={`/articlesView/${item.id}`}
                key={item.id}
                className="block h-full"
              >
                <ArticleCard
                  key={item.id ?? `article-${currentPage}-${index}`}
                  article={item}
                />
              </Link>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center my-auto h-32 text-xs text-base-content/40 italic">
            ยังไม่มีบทความในหมวดหมู่นี้
          </div>
        )}

        {/* Pagination Dots */}
        <div className="flex justify-center items-center gap-2 mt-4 pt-1">
          {Array.from({ length: totalPages }).map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentPage(idx)}
              aria-label={`ไปยังหน้าที่ ${idx + 1}`}
              className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${currentPage === idx
                ? "w-2.5 bg-purple-600"
                : "w-2.5 bg-base-300 hover:bg-purple-300"
                }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

// --- การ์ดความคิดเห็น Sidebar ---
const CommentItem: React.FC<CommentProps> = ({ author, timeAgo, message }) => (
  <div className="p-3 rounded-xl border border-base-200 bg-base-100 shadow-xs flex items-start gap-3">
    <div className="avatar">
      <div className="bg-base-200 text-base-content/60 rounded-full w-8 h-8 flex items-center justify-center">
        <FaUser className="w-4 h-4" />
      </div>
    </div>
    <div className="flex-1 text-xs">
      <div className="flex justify-between items-center mb-1">
        <span className="font-medium text-purple-700 dark:text-purple-400">
          {author}
        </span>
        <span className="text-[10px] text-base-content/40">{timeAgo}</span>
      </div>
      <p className="text-base-content/80">{message}</p>
    </div>
  </div>
);

// --- Main Component ---
export default function KMDashboard() {
  const [categories, setCategories] = useState<any[]>([]);
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL;

        const [resCat, resArt] = await Promise.all([
          fetch(`${baseUrl}/getCategories`),
          fetch(`${baseUrl}/getArticles`),
        ]);

        const catData = await resCat.json();
        const artData = await resArt.json();

        setCategories(catData.Categories || []);
        setArticles(artData.Articles || []);

      } catch (err) {
        console.error("Fetch data error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
        <p className="text-violet-600 text-sm ms-2"> กำลังโหลดข้อมูลองค์ความรู้...</p>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen py-4">
      <div className="w-full grid grid-cols-1 lg:grid-cols-4 gap-6 px-2 sm:px-4">
        {/* หมวดหมู่หลัก */}
        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6">
          {categories.map((category) => {
            const matchedArticles = articles.filter(
              (art) =>
                String(art.categoryId) === String(category.id) &&
                Number(art.isPublished) === 1
            );

            return (
              <CategorySection
                id={category.id}
                key={category.id}
                title={category.name}
                icon={iconMap[category.icon]}
                items={matchedArticles}
              />
            );
          })}
        </div>

        {/* ความคิดเห็นล่าสุด */}
        <div className="lg:col-span-1 flex flex-col gap-4">
          <h3 className="font-semibold text-lg text-base-content px-1">
            ความคิดเห็นล่าสุด
          </h3>
          <div className="flex flex-col gap-2.5">
            {mockComments.map((comment, index) => (
              <CommentItem key={index} {...comment} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}