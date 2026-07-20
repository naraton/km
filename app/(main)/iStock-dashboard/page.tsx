"use client";

import {
  FiAlertTriangle,
  FiActivity,
} from "react-icons/fi";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { useState, useEffect } from "react";
import { getUser } from "@/app/lib/auth";
import Link from "next/link";

export default function Dashboard() {
  // state--------------------------------------------------------------------------
  const [user, setUser] = useState<any>(null);
  const [loadPage, setLoadPage] = useState<boolean>(true);
  const [dataDashboard, setDataDashboard] = useState<any>({
    TopCardDashboard: {},
    lowStockItems: [],
    recentActivities: [],
    chartData: [],
  });
  //---------------------------------------------------------------------------------

  // get user data from local storage------------------------------------------------------------
  useEffect(() => {
    const userData = getUser();
    setUser(userData);
  }, []);
  //------------------------------------------------------------------------------------------

  // ดึงข้อมูล--------------------------------------------------------------------------
  const getData = async () => {
    if (!user?.id_card) return;
    setLoadPage(true);
    
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/getDashboard?id_card=${user.id_card}`,
      );

      const data = await res.json();

      setDataDashboard(data);

      setLoadPage(false);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setLoadPage(false);
    }
  }
  useEffect(() => {
    getData();
  }, [user]);
  //---------------------------------------------------------------------------------

  // reusable card ------------------------------------------------------------------
  const StatCard = ({
    title,
    value,
    subtitle,
    gradient,
    icon,
  }: any) => (
    <div
      className={`
      relative
      overflow-hidden
      rounded-3xl
      p-6
      text-white
      shadow-lg
      ${gradient}
      hover:scale-[1.05]
      transition
      duration-300
      `}
    >
      {/* background circle */}
      <div className="absolute -right-8 -bottom-8 w-32 h-32 rounded-full bg-white/10"></div>

      <div className="relative flex justify-between items-start">
        <div>
          <p className="text-sm">{title}</p>

          <h2 className="text-4xl font-bold mt-3">{value}</h2>

          <p className="text-xs mt-3">{subtitle}</p>
        </div>

        <div className="text-3xl">{icon}</div>
      </div>
    </div>
  );
  //---------------------------------------------------------------------------------

  // จัดลำดับวัน------------------------------------------------------------------------
  const dayOrder = [
    "จันทร์",
    "อังคาร",
    "พุธ",
    "พฤหัสบดี",
    "ศุกร์",
    "เสาร์",
    "อาทิตย์",
  ];

  const sortedChartData = [...dataDashboard.chartData].sort(
    (a: any, b: any) => {
      const dayA = a.day.split(" ")[0]; // เอาแค่ชื่อวัน
      const dayB = b.day.split(" ")[0];

      return dayOrder.indexOf(dayA) - dayOrder.indexOf(dayB);
    }
  );
  //---------------------------------------------------------------------------------

  return (
    <div className="min-h-screen p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-5">
        <div>
          <h1 className="text-3xl font-bold text-sky-900">
            iStock Dashboard
          </h1>

          <p className="text-slate-500 mt-1">
            ภาพรวมการจัดการพัสดุภายในหน่วยงาน
          </p>
        </div>

        <div className="bg-white px-4 py-2 rounded-xl shadow-sm text-sm text-sky-900">
          {new Date().toLocaleDateString("th-TH")}
        </div>
      </div>

      {/* Load page */}
      {loadPage ? (
        <div className="flex items-center justify-center py-10">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-sky-600"></div>
          <p className="text-sky-900 text-sm ms-2">กำลังโหลดข้อมูล...</p>
        </div>
      ) : (
        <>
          {/* top cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mb-5">
            <StatCard
              title="พัสดุทั้งหมด"
              value={dataDashboard.TopCardDashboard.total_items || 0}
              subtitle="รายการทั้งหมดในระบบ (รายการ)"
              gradient="bg-gradient-to-br from-sky-400 to-indigo-400"
            />

            <StatCard
              title="รับพัสดุเดือนนี้"
              value={dataDashboard.TopCardDashboard.receive_month || 0}
              subtitle="รายการรับเข้าเดือนนี้ (ชิ้น)"
              gradient="bg-gradient-to-br from-emerald-400 to-teal-400"
            />

            <StatCard
              title="เบิกพัสดุเดือนนี้"
              value={dataDashboard.TopCardDashboard.issue_month || 0}
              subtitle="รายการเบิกเดือนนี้ (ชิ้น)"
              gradient="bg-gradient-to-br from-amber-400 to-orange-300"
            />

            <StatCard
              title="ใกล้หมด"
              value={dataDashboard.TopCardDashboard.low_stock || 0}
              subtitle="ต้องเติมสินค้า (รายการ)"
              gradient="bg-gradient-to-br from-rose-400 to-pink-400"
            />

          </div>

          {/* middle section */}
          <div className="grid grid-cols-1 xl:grid-cols-6 gap-6 mb-5">
            {/* activity */}
            <div className="xl:col-span-3 bg-white rounded-3xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-6">
                <FiActivity className="text-blue-500" />
                <h2 className="font-bold text-slate-800">
                  กิจกรรมล่าสุด
                </h2>
              </div>

              <div className="space-y-4">
                {dataDashboard?.recentActivities?.map((item: any) => (
                  <div key={item.id} className="flex gap-4">
                    {/* Dot Status */}
                    <div
                      className={`w-3 h-3 rounded-full mt-2 ${item.movement === "in"
                        ? "bg-green-500"
                        : "bg-red-500"
                        }`}
                    />

                    {/* Content */}
                    <div className="flex-1 border-b border-slate-200 pb-3">
                      <div className="flex justify-between items-center">
                        <p className="font-medium text-slate-700">
                          {item.activity_name}
                        </p>

                        <div className="flex flex-col items-end">
                          <p className="text-xs text-slate-400">
                            {item.created_by}
                          </p>

                          <p className="text-xs text-slate-400">
                            {item.activity_time}
                          </p>
                        </div>
                      </div>

                      <p
                        className={`mt-1 text-sm font-semibold ${
                          item.movement === "in"
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {item.movement === "in"
                          ? `+${item.qty}`
                          : `-${item.qty}`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* low stock */}
            <div className="xl:col-span-3 bg-white rounded-3xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-5">
                <FiAlertTriangle className="text-red-500" />
                <h2 className="font-bold text-slate-800">
                  พัสดุใกล้หมด
                </h2>
              </div>

              <div className="space-y-3">
                {dataDashboard?.lowStockItems?.map((item: any) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-2xl border border-slate-300 hover:bg-slate-50 transition"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-semibold text-slate-700">
                          {item.item_name}
                        </p>

                        <p className="text-xs text-slate-400 mt-1">
                          {item.categories_id}
                        </p>
                      </div>

                      <div className="px-3 py-1 rounded-full bg-red-50 text-red-600 font-semibold text-sm">
                        เหลือ {item.qty_balance}
                      </div>
                    </div>
                  </div>
                ))}

                <Link href="/stockbalance">
                  <button
                    className="w-full mt-2 border border-dashed border-slate-300 rounded-2xl py-3 text-slate-500 hover:bg-slate-50 transition cursor-pointer"
                  >
                    ดูทั้งหมด
                  </button>
                </Link>
              </div>
            </div>
          </div>

          {/* chart */}
          <div className="bg-white rounded-3xl p-6 shadow-sm">
            <div className="mb-6">
              <h2 className="text-lg font-bold text-slate-800">
                การเคลื่อนไหว 7 วันย้อนหลัง
              </h2>

              <p className="text-sm text-slate-400 mt-1">
                เปรียบเทียบรายการรับและเบิกพัสดุ
              </p>
            </div>

            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={sortedChartData}>
                <defs>
                  <linearGradient id="receiveGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2563eb" />
                    <stop offset="100%" stopColor="#93c5fd" />
                  </linearGradient>

                  <linearGradient id="issueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f59e0b" />
                    <stop offset="100%" stopColor="#fde68a" />
                  </linearGradient>
                </defs>

                <CartesianGrid
                  stroke="#e2e8f0"
                  strokeDasharray="3 3"
                  vertical={false}
                />

                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                />

                <YAxis
                  axisLine={false}
                  tickLine={false}
                />

                <Tooltip
                  content={CustomTooltip}
                />

                <Bar
                  dataKey="receive"
                  fill="url(#receiveGradient)"
                  radius={[8, 8, 0, 0]}
                />

                <Bar
                  dataKey="issue"
                  fill="url(#issueGradient)"
                  radius={[8, 8, 0, 0]}
                />

              </BarChart>
            </ResponsiveContainer>

            <div className="flex gap-6 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-slate-500">รับพัสดุ</span>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-orange-400 rounded-full"></div>
                <span className="text-sm text-slate-500">เบิกพัสดุ</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="bg-white/95 backdrop-blur-xl border border-slate-200 rounded-2xl px-4 py-3 shadow-2xl min-w-[220px]">

      {/* Day */}
      <div className="border-b border-slate-100 pb-2 mb-3">
        <p className="font-bold text-slate-700">
          วัน{label}
        </p>
      </div>

      {/* Receive */}
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-500"></div>
          <span className="text-sm text-slate-600">
            รับพัสดุ
          </span>
        </div>

        <span className="font-bold text-blue-600">
          {payload[0]?.value} ชิ้น
        </span>
      </div>

      {/* Issue */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-orange-400"></div>
          <span className="text-sm text-slate-600">
            เบิกพัสดุ
          </span>
        </div>

        <span className="font-bold text-orange-500">
          {payload[1]?.value} ชิ้น
        </span>
      </div>
    </div>
  );
}