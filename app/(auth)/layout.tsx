import { Kanit } from "next/font/google";
import "../globals.css";
import AuthWrapper from "../components/AuthWrapper";

const kanit = Kanit({
  subsets: ["thai"],
  weight: ["300", "400", "500", "600", "700"], // กำหนดน้ำหนักที่ต้องใช้
});

export const metadata = {
  title: "KM",
  description: "ระบบจัดการองค์ความรู้ภายในองค์กร",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th" data-theme="fantasy">
      <body
        className={`${kanit.className} relative min-h-screen flex items-center justify-center overflow-hidden`}
      >
        {/* Decorative background blobs */}
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-sky-200/30 blur-[130px] pointer-events-none" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-sky-100/60 blur-[130px] pointer-events-none" />
        <div className="absolute top-[30%] right-[15%] w-[40%] h-[40%] rounded-full bg-sky-200/10 blur-[100px] pointer-events-none" />

        <div className="relative z-10 w-full flex items-center justify-center p-4">
          <AuthWrapper requireAuth={false}>{children}</AuthWrapper>
        </div>
      </body>
    </html>
  );
}
