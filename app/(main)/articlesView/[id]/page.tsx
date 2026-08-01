'use client'

import React, { useEffect, useState, useCallback, useRef } from "react";
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
import toast from "react-hot-toast";

// Lightbox
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails";
import "yet-another-react-lightbox/plugins/thumbnails.css";

// --- Interfaces ---
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
  owner: string;
  implementation: string;
  coverImage: string;
  content?: string;
  pdfContent?: string;
  userId: number;
  viewsCount: number;
  likesCount: number;
  createdAt: string;
  updatedAt: string;
  categoryName?: string;
  departName?: string;
  departmentName?: string;
  departmentSubName?: string;
}

export interface CommentDB {
  id: number;
  message: string;
  articleId: string;
  userId: string;
  fullname?: string;
  createdAt: string;
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

  // State คอมเมนต์
  const [comments, setComments] = useState<CommentDB[]>([]);
  const [newComment, setNewComment] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

   // State สำหรับLightbox
  const [open, setOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const coverBaseUrl = process.env.NEXT_PUBLIC_coverImage;
  const pdfBaseUrl = process.env.NEXT_PUBLIC_pdfContent || "";
  const defaultImage = "/images/placeholder.svg";

  // 1. Fetch Article Detail
  const isFetching = useRef(false);
  const fetchArticleDetail = useCallback(async () => {
    if (!articleId || isFetching.current) return;

    try {
      isFetching.current = true;
      setLoading(true);
      const baseUrl = process.env.NEXT_PUBLIC_API_URL;

      const [resArt, resCat, resDepart, resDepartment, resDepartmentSub] = await Promise.all([
        fetch(`${baseUrl}/getArticles`),
        fetch(`${baseUrl}/getCategories`),
        fetch(`${baseUrl}/getDepart`),
        fetch(`${baseUrl}/getDepartment`),
        fetch(`${baseUrl}/getDepartmentSub`),
      ]);

      if (!resArt.ok || !resCat.ok) {
        throw new Error("API Rate limit or error server response");
      }

      const artData = await resArt.json();
      const catData = await resCat.json();
      const departData = await resDepart.json();
      const departmentData = await resDepartment.json();
      const departmentSubData = await resDepartmentSub.json();

      const allArticles: ArticleDB[] = artData.Articles || [];
      const currentArt = allArticles.find((a) => String(a.id) === String(articleId));

      if (currentArt) {
        const categories = catData.Categories || catData || [];
        const matchedCat = categories.find((c: any) => String(c.id) === String(currentArt.categoryId));

        const departs = departData.Depart || [];
        const targetDepartId = currentArt.mission || (currentArt as any).departId || (currentArt as any).depart;
        const matchedDepart = departs.find((d: any) => String(d.HR_DEPART_ID) === String(targetDepartId));

        const departments = departmentData.Department || [];
        const targetDepartmentId = currentArt.workGroup || (currentArt as any).departmentId || (currentArt as any).department;
        const matchedDepartment = departments.find((dp: any) => String(dp.HR_DEPARTMENT_ID) === String(targetDepartmentId));

        const departmentSubs = departmentSubData.DepartmentSub || [];
        const targetSubId = currentArt.job || (currentArt as any).departmentSubId || (currentArt as any).departmentSub;
        const matchedSub = departmentSubs.find((ds: any) => String(ds.HR_DEPARTMENT_SUB_ID) === String(targetSubId));

        setArticle({
          ...currentArt,
          categoryName: matchedCat ? (matchedCat.name || matchedCat.categoryName) : "ทั่วไป",
          departName: matchedDepart ? matchedDepart.HR_DEPART_NAME : "-",
          departmentName: matchedDepartment ? matchedDepartment.HR_DEPARTMENT_NAME : "-",
          departmentSubName: matchedSub ? matchedSub.HR_DEPARTMENT_SUB_NAME : "-",
        });

        setLikes(currentArt.likesCount || 0);

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
  }, [articleId]);

  // 2. Fetch Comments
  const fetchComments = useCallback(async () => {
    if (!articleId) return;

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL;
      const res = await fetch(`${baseUrl}/getCommentsByArticle?articleId=${articleId}`);

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setComments(data.comments || []);
        }
      }
    } catch (err) {
      console.error("Fetch comments error:", err);
    }
  }, [articleId]);

  // 3. Increment View Count
  const incrementViewCount = useCallback(async (id: string | number) => {
    const viewedKey = `viewed_article_${id}`;
    const hasViewed = sessionStorage.getItem(viewedKey);

    if (!hasViewed) {
      try {
        const res = await fetch(`/api/articles/${id}/view`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (res.ok) {
          sessionStorage.setItem(viewedKey, "true");
          setArticle((prev) =>
            prev ? { ...prev, viewsCount: (prev.viewsCount || 0) + 1 } : null
          );
        }
      } catch (err) {
        console.error("Failed to increment view count:", err);
      }
    }
  }, []);

  // --- ALL USEEFFECTS (ต้องอยู่ก่อน Early Returns) ---
  useEffect(() => {
    if (articleId) {
      fetchArticleDetail();
      fetchComments();
    }
  }, [articleId, fetchArticleDetail, fetchComments]);

  useEffect(() => {
    if (articleId) {
      incrementViewCount(String(articleId));
    }
  }, [articleId, incrementViewCount]);

  // --- HANDLERS ---
  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const userId = user?.id || user?.userId;

    if (!userId) {
      toast.error("กรุณาเข้าสู่ระบบก่อนแสดงความคิดเห็น");
      return;
    }

    try {
      setIsSubmitting(true);

      const res = await fetch("/api/articles/comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({
          message: newComment,
          articleId: String(articleId),
          userId: String(userId),
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        toast.success("ส่งความคิดเห็นเรียบร้อยแล้ว!");
        setNewComment("");
        fetchComments();
      } else {
        toast.error(data.message || "ไม่สามารถแสดงความคิดเห็นได้");
      }
    } catch (err) {
      console.error("Error submitting comment:", err);
      toast.error("เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLike = async () => {
    if (!articleId) return;

    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const userId = user?.id || user?.userId;

    if (!userId) {
      toast.error("กรุณาเข้าสู่ระบบก่อนกดถูกใจ");
      return;
    }

    const prevIsLiked = isLiked;
    const prevLikes = likes;

    setIsLiked(!isLiked);
    setLikes((prev) => (isLiked ? prev - 1 : prev + 1));

    try {
      const res = await fetch(`/api/articles/${articleId}/like`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      if (res.ok) {
        const data = await res.json();
        setIsLiked(data.isLiked);
        setLikes(data.likesCount);
      } else {
        setIsLiked(prevIsLiked);
        setLikes(prevLikes);
      }
    } catch (err) {
      console.error("Error toggling like:", err);
      setIsLiked(prevIsLiked);
      setLikes(prevLikes);
    }
  };

  // --- EARLY RETURNS (วางไว้หลังจาก Hooks ทั้งหมดเรียบร้อยแล้ว) ---
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
        <p className="text-violet-600 text-sm ms-2">กำลังโหลดข้อมูลองค์ความรู้...</p>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-4 text-center">
        <p className="text-lg font-semibold text-base-content/70">ไม่พบบทความที่คุณต้องการ</p>
        <button
          onClick={() => router.back()}
          className="bg-purple-600 text-white hover:bg-purple-700 text-xs px-4 py-2 rounded-lg cursor-pointer"
        >
          กลับหน้าหลัก
        </button>
      </div>
    );
  }

  const imageSrc = article.coverImage ? `${coverBaseUrl}/${article.coverImage}` : defaultImage;
  const tagsList = article.tag ? article.tag.split(",").map((t) => t.trim()) : [];

  // สร้าง Array รูปภาพสำหรับ Lightbox
  const images = article.coverImage ? [`${coverBaseUrl}/${article.coverImage}`] : [];

  // ฟังก์ชันเปิด Lightbox (ส่ง index รูปที่ต้องการเปิด)
  const handleOpenLightbox = (index: number) => {
    setCurrentIndex(index);
    setOpen(true);
  };

  return (
    <div className="w-full min-h-screen py-6 px-2 sm:px-6 max-w-7xl mx-auto space-y-6">
      {/* 1. Header & Breadcrumb */}
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
            <div
              className="w-full h-64 sm:h-96 rounded-xl overflow-hidden bg-base-300 relative cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => handleOpenLightbox(0)} // เมื่อคลิก ให้เปิดรูปแรก (Index 0)
            >
              <img
                src={imageSrc}
                alt={article.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.currentTarget;
                  if (target.src !== defaultImage) target.src = defaultImage;
                }}
              />
              
              <Lightbox
                open={open}
                close={() => setOpen(false)}
                index={currentIndex}
                slides={images.map((src) => ({ src }))}
                plugins={[Zoom, Thumbnails]}
              />
            </div>

            {/* คำอธิบายสั้น (Description) */}
            {article.description && (
              <div className="prose dark:prose-invert max-w-none text-xs sm:text-sm leading-relaxed text-base-content/90 space-y-4">
                <div className="p-4 rounded-xl bg-purple-50/50 dark:bg-purple-950/20 border-l-4 border-purple-600 text-xs sm:text-sm text-base-content/80 leading-relaxed font-medium">
                  <span className="font-semibold text-purple-600 dark:text-purple-400">คำอธิบายสั้น / เรื่องย่อ</span>
                  <div dangerouslySetInnerHTML={{ __html: article.description }} />
                </div>
              </div>
            )}

            {/* เนื้อหาหลักบทความ (HTML / Rich Text) */}
            {article.content && (
              <div className="prose dark:prose-invert max-w-none text-xs sm:text-sm leading-relaxed text-base-content/90 space-y-4">
                <div className="p-4 rounded-xl bg-purple-50/50 dark:bg-purple-950/20 border-l-4 border-purple-600 text-xs sm:text-sm text-base-content/80 leading-relaxed font-medium">
                  <span className="font-semibold text-purple-600 dark:text-purple-400">เนื้อหาองค์ความรู้</span>
                  <div dangerouslySetInnerHTML={{ __html: article.content }} />
                </div>
              </div>
            )}

            {/* ส่วนแสดง: การนำไปใช้งาน / การขยายผล (implementation) */}
            {article.implementation && (
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-base-200 border border-slate-300 dark:border-base-400 space-y-2">
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
                  <span key={idx} className="text-[11px] bg-violet-50 text-base-content/70 px-2.5 py-1 rounded-md border border-violet-300 dark:border-violet-600">
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
                  ? "bg-purple-600 text-white shadow-md scale-105 cursor-pointer"
                  : "bg-base-200 text-base-content/70 hover:bg-purple-100 hover:text-purple-700 cursor-pointer"
                  }`}
              >
                <FaThumbsUp className="w-3.5 h-3.5" />
                <span>ถูกใจ ({likes})</span>
              </button>

              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  toast.success("คัดลอกลิงก์เรียบร้อยแล้ว!");
                }}
                className="p-2.5 rounded-full bg-violet-100 hover:bg-violet-300 text-base-content/70 text-xs cursor-pointer"
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

            {/* ฟอร์มพิมพ์ความคิดเห็น */}
            <form onSubmit={handleAddComment} className="flex gap-2">
              <input
                type="text"
                placeholder="เขียนความคิดเห็นของคุณ..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                disabled={isSubmitting}
                className="flex-1 text-xs px-4 py-2.5 rounded-xl border border-base-300 bg-base-200/50 focus:outline-none focus:border-purple-500 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={isSubmitting || !newComment.trim()}
                className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300 text-white rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <FaPaperPlane className="w-3 h-3" />
                <span>{isSubmitting ? "กำลังส่ง..." : "ส่ง"}</span>
              </button>
            </form>

            {/* รายการความคิดเห็นทั้งหมด */}
            <div className="space-y-3 pt-2">
              {comments.length > 0 ? (
                comments.map((comment) => (
                  <div key={comment.id} className="p-3 rounded-xl bg-base-200/40 border border-base-200 space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-purple-700 dark:text-purple-400">
                        {comment.fullname || `ผู้ใช้งาน ID: ${comment.userId}`}
                      </span>
                      <span className="text-[10px] text-base-content/40">
                        {comment.createdAt
                          ? new Date(comment.createdAt).toLocaleString("th-TH", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                          : "เมื่อสักครู่"}
                      </span>
                    </div>
                    <p className="text-xs text-base-content/80 whitespace-pre-line">{comment.message}</p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-center text-base-content/40 py-6 italic">
                  ยังไม่มีความคิดเห็น เป็นคนแรกที่แสดงความคิดเห็นสิ!
                </p>
              )}
            </div>
          </div>
        </div>

        {/* --- ฝั่งขวา: Sidebar ข้อมูลสังกัด & บทความที่เกี่ยวข้อง --- */}
        <div className="lg:col-span-1 space-y-6">
          {/* การ์ดสังกัดองค์กร */}
          <div className="bg-base-100 border border-base-200 rounded-2xl p-4 shadow-xs space-y-3">
            <h3 className="font-semibold text-xs text-base-content border-b border-base-200 pb-2 flex items-center gap-2">
              <FaBriefcase className="w-3.5 h-3.5 text-purple-600" />
              <span>ข้อมูลหน่วยงานสังกัด</span>
            </h3>
            <div className="space-y-2 text-xs text-base-content/80">
              <div className="flex justify-between gap-2">
                <span className="text-base-content/50 shrink-0">ภารกิจ:</span>
                <span className="font-medium text-right">{article.departName || "-"}</span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-base-content/50 shrink-0">กลุ่มงาน:</span>
                <span className="font-medium text-right">{article.departmentName || "-"}</span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-base-content/50 shrink-0">งาน:</span>
                <span className="font-medium text-right">{article.departmentSubName || "-"}</span>
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