'use client'

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  FaArrowLeft,
  FaThumbsUp,
  FaEye,
  FaUser,
  FaClock,
  FaShareAlt,
  FaFilePdf,
  FaTag,
  FaBriefcase,
  FaPaperPlane,
  FaBookOpen,
  FaTasks
} from "react-icons/fa";

// --- Interface ตาม DB Schema เป๊ะๆ ---
export interface ArticleDB {
  id: number;
  categoryId: number;
  isPublished: number;
  title: string;
  tag?: string;
  description: string;
  mission?: string;
  workGroup?: string;
  job?: string;
  owner: string;            // เจ้าของผลงาน
  implementation: string;   // การนำไปใช้งาน/ขยายผล
  coverImage: string;
  content?: string;
  pdfContent?: string;      // ชื่อไฟล์หรือ URL ของ PDF
  userId: number;
  viewsCount: number;
  likesCount: number;
  createdAt: string;
  updatedAt: string;
  categoryName?: string;    // JOIN มาจาก categories
}

export default function ArticleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const articleId = params?.id;

  const [article, setArticle] = useState<ArticleDB | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<ArticleDB[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // State การกดไลก์ และ ความคิดเห็น
  const [isLiked, setIsLiked] = useState<boolean>(false);
  const [likes, setLikes] = useState<number>(0);
  const [newComment, setNewComment] = useState<string>("");
  const [comments, setComments] = useState([
    { id: 1, author: "ธนกานต์ ขอนกลาง", text: "บทความมีประโยชน์ นำไปปรับใช้ได้จริงครับ", time: "2 ชั่วโมงที่แล้ว" },
    { id: 2, author: "ยศวรรธน์ บุญรอด", text: "เนื้อหากระชับ อ่านเข้าใจง่ายมากเลยครับ", time: "1 วันที่แล้ว" },
  ]);

  const coverBaseUrl = process.env.NEXT_PUBLIC_coverImage;
  const pdfBaseUrl = process.env.NEXT_PUBLIC_pdfUrl || coverBaseUrl; // หรือ URL Path ที่เก็บ PDF
  const defaultImage = "/images/placeholder.svg";

  useEffect(() => {
    const fetchArticleDetail = async () => {
      try {
        setLoading(true);
        const baseUrl = process.env.NEXT_PUBLIC_API_URL;

        const [resArt, resCat] = await Promise.all([
          fetch(`${baseUrl}/getArticles`),
          fetch(`${baseUrl}/getCategories`),
        ]);

        const artData = await resArt.json();
        const catData = await resCat.json();

        const allArticles: ArticleDB[] = artData.Articles || [];
        const currentArt = allArticles.find((a) => String(a.id) === String(articleId));

        if (currentArt) {
          const categories = catData.Categories || [];
          const matchedCat = categories.find((c: any) => String(c.id) === String(currentArt.categoryId));

          setArticle({
            ...currentArt,
            categoryName: matchedCat ? matchedCat.name : "ทั่วไป",
          });
          setLikes(currentArt.likesCount || 0);

          // ดึงบทความใกล้เคียงในหมวดเดียวกัน
          const related = allArticles.filter(
            (a) => String(a.categoryId) === String(currentArt.categoryId) && String(a.id) !== String(articleId)
          ).slice(0, 3);
          setRelatedArticles(related);
        }
      } catch (err) {
        console.error("Fetch article detail error:", err);
      } finally {
        setLoading(false);
      }
    };

    if (articleId) {
      fetchArticleDetail();
    }
  }, [articleId]);

  // ฟังก์ชันกดไลก์
  const handleLike = () => {
    if (isLiked) {
      setLikes((prev) => prev - 1);
      setIsLiked(false);
    } else {
      setLikes((prev) => prev + 1);
      setIsLiked(true);
    }
  };

  // ฟังก์ชันเพิ่มคอมเมนต์
  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setComments([
      { id: Date.now(), author: "ผู้ใช้งานทั่วไป", text: newComment, time: "เมื่อสักครู่" },
      ...comments,
    ]);
    setNewComment("");
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
        <p className="text-violet-600 text-sm ms-2"> กำลังโหลดข้อมูลองค์ความรู้...</p>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-4 text-center">
        <p className="text-lg font-semibold text-base-content/70">ไม่พบบทความที่คุณต้องการ</p>
        <button
          onClick={() => router.back()}
          className="bg-purple-600 text-white hover:bg-purple-700 text-xs px-4 py-2 rounded-lg"
        >
          กลับหน้าหลัก
        </button>
      </div>
    );
  }

  const imageSrc = article.coverImage ? `${coverBaseUrl}/${article.coverImage}` : defaultImage;
  const tagsList = article.tag ? article.tag.split(",").map((t) => t.trim()) : [];

  return (
    <div className="w-full min-h-screen py-6 px-2 sm:px-6 max-w-7xl mx-auto space-y-6">

      {/* 1. Header & Breadcrumb */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300 hover:text-purple-600 font-medium transition-colors bg-base-100 border border-base-300 px-3 py-1.5 rounded-full shadow-2xs"
        >
          <FaArrowLeft className="w-3 h-3" />
          <span>ย้อนกลับ</span>
        </button>

        <div className="text-xs text-base-content/50 flex items-center gap-2">
          <Link href="/home" className="hover:underline">หน้าหลัก</Link>
          <span>/</span>
          <span className="text-purple-600 font-medium">{article.categoryName}</span>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

        {/* --- ฝั่งซ้าย: เนื้อหาบทความหลัก (3 Cols) --- */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-base-100 border border-base-200 rounded-2xl p-4 sm:p-8 shadow-xs space-y-6">

            {/* Category Tag & Metadata */}
            <div className="space-y-3">
              <span className="inline-block px-3 py-1 bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 text-xs font-semibold rounded-full border border-purple-200 dark:border-purple-800">
                {article.categoryName}
              </span>

              <h1 className="text-2xl sm:text-3xl font-bold text-base-content leading-tight">
                {article.title}
              </h1>

              {/* รายละเอียดผู้สร้าง / เจ้าของผลงาน */}
              <div className="flex flex-wrap items-center gap-4 text-xs text-base-content/70 pt-2 border-b border-base-200 pb-4">
                <div className="flex items-center gap-1.5 font-medium text-purple-700 dark:text-purple-400">
                  <FaUser className="w-3.5 h-3.5" />
                  <span>เจ้าของผลงาน: {article.owner}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <FaClock className="w-3.5 h-3.5 text-base-content/40" />
                  <span>เผยแพร่เมื่อ: {new Date(article.createdAt).toLocaleDateString('th-TH')}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <FaEye className="w-3.5 h-3.5 text-base-content/40" />
                  <span>{article.viewsCount} เข้าชม</span>
                </div>
              </div>
            </div>

            {/* รูปปกบทความ */}
            <div className="w-full h-64 sm:h-96 rounded-xl overflow-hidden bg-base-300 relative">
              <img
                src={imageSrc}
                alt={article.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.currentTarget;
                  if (target.src !== defaultImage) target.src = defaultImage;
                }}
              />
            </div>

            {/* คำอธิบายสั้น (Description) */}
            <div className="p-4 rounded-xl bg-purple-50/50 dark:bg-purple-950/20 border-l-4 border-purple-600 text-xs sm:text-sm text-base-content/80 leading-relaxed font-medium">
              {article.description}
            </div>

            {/* เนื้อหาหลักบทความ (HTML / Rich Text) */}
            {article.content && (
              <div className="prose dark:prose-invert max-w-none text-xs sm:text-sm leading-relaxed text-base-content/90 space-y-4">
                <div dangerouslySetInnerHTML={{ __html: article.content }} />
              </div>
            )}

            {/* ส่วนแสดง: การนำไปใช้งาน / การขยายผล (implementation) */}
            {article.implementation && (
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-base-200 border border-slate-200 dark:border-base-300 space-y-2">
                <h3 className="font-bold text-sm text-purple-700 dark:text-purple-400 flex items-center gap-2">
                  <FaTasks className="w-4 h-4" />
                  <span>การนำไปใช้งาน / การขยายผล (Implementation)</span>
                </h3>
                <p className="text-xs sm:text-sm text-base-content/80 leading-relaxed whitespace-pre-line">
                  {article.implementation}
                </p>
              </div>
            )}

            {/* ส่วนดาวน์โหลดไฟล์เอกสารแนบ PDF (pdfContent) */}
            {article.pdfContent && (
              <div className="flex items-center justify-between p-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-red-100 dark:bg-red-900/50 text-red-600 rounded-lg">
                    <FaFilePdf className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">เอกสารประกอบบทความ (PDF)</h4>
                    <p className="text-[11px] text-slate-500">คลิกเพื่อเปิดอ่านหรือดาวน์โหลดเอกสารฉบับเต็ม</p>
                  </div>
                </div>
                <a
                  href={`${pdfBaseUrl}/${article.pdfContent}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-medium transition-colors"
                >
                  เปิดไฟล์ PDF
                </a>
              </div>
            )}

            {/* แท็กค้นหา (Tags) */}
            {tagsList.length > 0 && (
              <div className="flex items-center gap-2 pt-2 flex-wrap">
                <span className="text-xs text-base-content/50 flex items-center gap-1">
                  <FaTag className="w-3 h-3" /> แท็ก:
                </span>
                {tagsList.map((tag, idx) => (
                  <span key={idx} className="text-[11px] bg-base-200 text-base-content/70 px-2.5 py-1 rounded-md">
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* ปุ่มกด Like และ Copy Link */}
            <div className="flex items-center justify-between pt-6 border-t border-base-200">
              <button
                onClick={handleLike}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-all ${isLiked
                  ? "bg-purple-600 text-white shadow-md scale-105"
                  : "bg-base-200 text-base-content/70 hover:bg-purple-100 hover:text-purple-700"
                  }`}
              >
                <FaThumbsUp className="w-3.5 h-3.5" />
                <span>ถูกใจ ({likes})</span>
              </button>

              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  alert("คัดลอกลิงก์เรียบร้อยแล้ว!");
                }}
                className="p-2.5 rounded-full bg-base-200 hover:bg-base-300 text-base-content/70 text-xs"
                title="คัดลอกลิงก์"
              >
                <FaShareAlt className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>

          {/* Section: ความคิดเห็น */}
          <div className="bg-base-100 border border-base-200 rounded-2xl p-4 sm:p-6 shadow-xs space-y-4">
            <h3 className="font-semibold text-base text-base-content">
              ความคิดเห็น ({comments.length})
            </h3>

            <form onSubmit={handleAddComment} className="flex gap-2">
              <input
                type="text"
                placeholder="เขียนความคิดเห็นของคุณ..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="flex-1 text-xs px-4 py-2.5 rounded-xl border border-base-300 bg-base-200/50 focus:outline-none focus:border-purple-500"
              />
              <button
                type="submit"
                className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors"
              >
                <FaPaperPlane className="w-3 h-3" />
                <span>ส่ง</span>
              </button>
            </form>

            <div className="space-y-3 pt-2">
              {comments.map((comment) => (
                <div key={comment.id} className="p-3 rounded-xl bg-base-200/40 border border-base-200 space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-purple-700 dark:text-purple-400">{comment.author}</span>
                    <span className="text-[10px] text-base-content/40">{comment.time}</span>
                  </div>
                  <p className="text-xs text-base-content/80">{comment.text}</p>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* --- ฝั่งขวา: Sidebar ข้อมูลสังกัด & บทความที่เกี่ยวข้อง --- */}
        <div className="lg:col-span-1 space-y-6">

          {/* การ์ดสังกัดองค์กร (Mission / WorkGroup / Job) */}
          <div className="bg-base-100 border border-base-200 rounded-2xl p-4 shadow-xs space-y-3">
            <h3 className="font-semibold text-xs text-base-content border-b border-base-200 pb-2 flex items-center gap-2">
              <FaBriefcase className="w-3.5 h-3.5 text-purple-600" />
              <span>ข้อมูลหน่วยงานสังกัด</span>
            </h3>
            <div className="space-y-2 text-xs text-base-content/80">
              <div className="flex justify-between">
                <span className="text-base-content/50">ภารกิจ:</span>
                <span className="font-medium">{article.mission || "-"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-base-content/50">กลุ่มงาน:</span>
                <span className="font-medium">{article.workGroup || "-"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-base-content/50">งาน:</span>
                <span className="font-medium">{article.job || "-"}</span>
              </div>
            </div>
          </div>

          {/* บทความที่เกี่ยวข้อง */}
          <div className="bg-base-100 border border-base-200 rounded-2xl p-4 shadow-xs space-y-4 sticky top-6">
            <h3 className="font-semibold text-xs text-base-content border-b border-base-200 pb-2 flex items-center gap-2">
              <FaBookOpen className="w-3.5 h-3.5 text-purple-600" />
              <span>บทความที่เกี่ยวข้อง</span>
            </h3>

            {relatedArticles.length > 0 ? (
              <div className="space-y-3">
                {relatedArticles.map((rel) => {
                  const relImg = rel.coverImage ? `${coverBaseUrl}/${rel.coverImage}` : defaultImage;
                  return (
                    <Link
                      key={rel.id}
                      href={`/articlesView/${rel.id}`}
                      className="group flex gap-3 p-2 rounded-xl hover:bg-base-200/60 transition-colors"
                    >
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-base-300 flex-shrink-0">
                        <img src={relImg} alt={rel.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <h4 className="text-xs font-semibold text-base-content line-clamp-2 group-hover:text-purple-600 transition-colors">
                          {rel.title}
                        </h4>
                        <span className="text-[10px] text-base-content/40 flex items-center gap-1">
                          <FaEye className="w-2.5 h-2.5" /> {rel.viewsCount} Views
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-base-content/40 italic py-2 text-center">ไม่มีบทความใกล้เคียง</p>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}