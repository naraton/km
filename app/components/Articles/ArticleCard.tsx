import { FaThumbsUp, FaEye } from "react-icons/fa";
import Link from "next/link";

export interface Article {
  id: number | string;
  title: string;
  description: string;
  coverImage?: string;
  viewsCount?: number;
  likesCount?: number;
}

interface ArticleCardProps {
  article: Article;
}

export default function ArticleCard({ article }: ArticleCardProps) {
  const coverBaseUrl = process.env.NEXT_PUBLIC_coverImage;
  const defaultImage = "/images/placeholder.svg";

  const imageSrc = article?.coverImage
    ? `${coverBaseUrl}/${article.coverImage}`
    : defaultImage;

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 border border-slate-200 flex flex-col justify-between h-full">
      <div className="group cursor-pointer" >
        {/* ส่วนรูปภาพปก */}
        <div className="h-36 sm:h-40 w-full overflow-hidden bg-slate-100">
          <img
            src={imageSrc}
            alt={article?.title || "รูปภาพบทความ"}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              const target = e.currentTarget;
              if (target.src !== defaultImage) {
                target.src = defaultImage;
              }
            }}
          />
        </div>

        {/* ส่วนเนื้อหา (หัวข้อ + คำอธิบาย) */}
        <div className="p-4 space-y-2">
          <h4 className="font-bold text-slate-800 text-sm line-clamp-1 group-hover:text-purple-600 transition-colors">
            {article?.title}
          </h4>
          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
            {article?.description}
          </p>
        </div>
      </div>

      {/* ส่วนท้ายแสดงยอด Like / View */}
      <div className="px-4 pb-4 pt-1 flex items-center gap-4 text-xs font-medium text-slate-400">
        <span className="flex items-center gap-1.5">
          <FaThumbsUp className="w-3.5 h-3.5 text-slate-400" />
          {article?.likesCount ?? 0}
        </span>
        <span className="flex items-center gap-1.5">
          <FaEye className="w-3.5 h-3.5 text-slate-400" />
          {article?.viewsCount ?? 0}
        </span>
      </div>
    </div>
  );
}