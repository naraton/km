import React from "react";
import {
  FaBookOpen,
  FaFlask,
  FaLightbulb,
  FaHeartbeat,
  FaUser,
  FaThumbsUp,
  FaEye,
} from "react-icons/fa";

// --- Types ---
interface ContentCardProps {
  image: string;
  title: string;
  description: string;
  likes: number;
  views: number;
}

interface CategorySectionProps {
  title: string;
  icon: React.ReactNode;
  items: ContentCardProps[];
}

interface CommentProps {
  author: string;
  timeAgo: string;
  message: string;
}

// --- Mock Data ---
const mockCategories = [
  {
    title: "คลังข้อมูลที่เป็นแนวปฏิบัติที่ดี (Good Practice)",
    icon: <FaHeartbeat className="w-5 h-5 text-purple-600" />,
    items: [
      {
        image:
          "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=500&auto=format&fit=crop",
        title: "มะเร็งปากมดลูก : โรคร้ายที่ป้องกันได้",
        description: "โรคยอดฮิตที่เป็นสาเหตุอันดับต้นๆ ของหญิงไทยและทั่วโลก...",
        likes: 0,
        views: 15,
      },
      {
        image:
          "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=500&auto=format&fit=crop",
        title: "มาตรฐานการพยาบาลผู้ป่วยโรคสะเก็ดเงิน",
        description: "แนวทางการดูแลและฟื้นฟูสภาพผู้ป่วยอย่างถูกวิธี...",
        likes: 0,
        views: 8,
      },
    ],
  },
  {
    title: "คลังข้อมูลการวิจัย",
    icon: <FaFlask className="w-5 h-5 text-purple-600" />,
    items: [
      {
        image:
          "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=500&auto=format&fit=crop",
        title: "ผลของโปรแกรมการจัดการรายกรณีต่อพฤติกรรม...",
        description: "งานวิจัยติดตามผลพฤติกรรมการดูแลตนเองของผู้ป่วย...",
        likes: 0,
        views: 36,
      },
      {
        image:
          "https://images.unsplash.com/photo-1615461066841-6116e61058f4?w=800&auto=format&fit=crop",
        title: "อุบัติการณ์ ปัจจัยเสี่ยงของภาวะลิ่มเลือดอุดตัน...",
        description: "Journal of Hematology and Transfusion Medicine...",
        likes: 1,
        views: 40,
      },
    ],
  },
  {
    title: "คลังข้อมูลนวัตกรรม",
    icon: <FaLightbulb className="w-5 h-5 text-purple-600" />,
    items: [
      {
        image:
          "https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=500&auto=format&fit=crop",
        title: "การใช้อากาศยานไร้คนขับสนับสนุนภารกิจทางการแพทย์",
        description:
          "กรณีศึกษาพื้นที่ท่องเที่ยวจังหวัดภูเก็ต พังงา และกระบี่...",
        likes: 2,
        views: 19,
      },
      {
        image:
          "https://images.unsplash.com/photo-1516549655169-df83a0774514?w=500&auto=format&fit=crop",
        title: "คู่มือการสร้างเป้าหมายสำหรับผู้ป่วยแอมเฟตามีน",
        description: "ในระยะฟื้นฟูสมรรถภาพ...",
        likes: 0,
        views: 5,
      },
    ],
  },
  {
    title: "คลังข้อมูล CQI",
    icon: <FaBookOpen className="w-5 h-5 text-purple-600" />,
    items: [
      {
        image:
          "https://images.unsplash.com/photo-1559757175-5700dde675bc?w=500&auto=format&fit=crop",
        title: "มะเร็งไต (Renal Cell Carcinoma): รู้ไว-ตรวจพบเร็ว",
        description: "อาการเตือนและแนวทางการตรวจรักษาตั้งแต่ระยะเริ่มต้น...",
        likes: 5,
        views: 52,
      },
      {
        image:
          "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=500&auto=format&fit=crop",
        title: "โทษของบุหรี่ไฟฟ้า",
        description: "ผลกระทบต่อระบบทางเดินหายใจและสุขภาพในระยะยาว...",
        likes: 12,
        views: 88,
      },
    ],
  },
];

const mockComments: CommentProps[] = [
  {
    author: "ธนกานต์ ขอนกลาง",
    timeAgo: "362 วันที่แล้ว",
    message: "บทความมีประโยชน์มากเลยค่ะ",
  },
  { author: "ยศวรรธน์ บุญรอด", timeAgo: "362 วันที่แล้ว", message: "ดีค่ะ" },
  {
    author: "เทพฤทธิ์ เกื้อแก้ว",
    timeAgo: "362 วันที่แล้ว",
    message: "ขอบคุณครับ",
  },
  {
    author: "เตชิน รัตนวิสุทธิ์",
    timeAgo: "363 วันที่แล้ว",
    message: "เยี่ยมมากค่ะ",
  },
  {
    author: "อัมพร หมวดไธสง",
    timeAgo: "363 วันที่แล้ว",
    message: "มีประโยชน์มากค่ะ",
  },
  {
    author: "พงศ์ไทย สิงห์เชตอู่",
    timeAgo: "363 วันที่แล้ว",
    message: "เนื้อหาดีมากค่ะ",
  },
];

// การ์ดเนื้อหาย่อย
const ContentCard: React.FC<ContentCardProps> = ({image, title,description, likes, views,}) => (
  <div className="card bg-base-100 shadow-xs border border-base-200 overflow-hidden text-sm flex flex-col justify-between">
    <div>
      <figure className="h-32 overflow-hidden bg-base-300">
        <img src={image} alt={title} className="w-full h-full object-cover" />
      </figure>
      <div className="p-3">
        <h4 className="font-semibold text-base-content line-clamp-1 mb-1">
          {title}
        </h4>
        <p className="text-xs text-base-content/70 line-clamp-2">
          {description}
        </p>
      </div>
    </div>
    <div className="px-3 pb-3 pt-1 flex items-center gap-4 text-xs text-base-content/50 border-t border-base-100 mt-2">
      <span className="flex items-center gap-1">
        <FaThumbsUp className="w-3 h-3" /> {likes}
      </span>
      <span className="flex items-center gap-1">
        <FaEye className="w-3 h-3" /> {views}
      </span>
    </div>
  </div>
);

// หมวดหมู่ใหญ่ (Grid แบบมีกรอบรอบนอก)
const CategorySection: React.FC<CategorySectionProps> = ({ title, icon, items }) => (
  <div className="flex flex-col gap-3">
    {/* Header */}
    <div className="flex items-center gap-2">
      <div className="p-2 rounded-full bg-purple-100 dark:bg-purple-950/40 border border-purple-300 dark:border-purple-800/60">
        {icon}
      </div>
      <h3 className="font-semibold text-lg text-base-content">{title}</h3>
    </div>

    {/* Border Container */}
    <div className="border border-purple-300 dark:border-purple-800/60 rounded-2xl p-4 bg-base-100/50 shadow-xs">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {items.map((item, index) => (
          <ContentCard key={index} {...item} />
        ))}
      </div>

      {/* Pagination Dots */}
      <div className="flex justify-center gap-1.5 mt-4">
        <span className="w-2 h-2 rounded-full bg-purple-600"></span>
        <span className="w-2 h-2 rounded-full bg-base-300"></span>
        <span className="w-2 h-2 rounded-full bg-base-300"></span>
        <span className="w-2 h-2 rounded-full bg-base-300"></span>
      </div>
    </div>
  </div>
);

// การ์ดความคิดเห็น Sidebar
const CommentItem: React.FC<CommentProps> = ({ author, timeAgo, message }) => (
  <div className="p-3 rounded-xl border border-base-200 bg-base-100 shadow-xs flex items-start gap-3">
    <div className="avatar">
      <div className="bg-base-200 text-base-content/60 rounded-full w-8 flex items-center justify-center">
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
  return (
    // เปลี่ยนเป็น w-full และลบ Padding ด้านข้างออก เพื่อให้ชิดขอบจอแบบ 100%
    <div className="w-full min-h-screen py-4">
      <div className="w-full grid grid-cols-1 lg:grid-cols-4 gap-6 px-2 sm:px-4">
        {/* ฝั่งซ้าย: 4 หมวดหมู่หลัก (3 Columns) */}
        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6">
          {mockCategories.map((category, index) => (
            <CategorySection key={index} {...category} />
          ))}
        </div>

        {/* ฝั่งขวา: ความคิดเห็นล่าสุด (1 Column) */}
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
