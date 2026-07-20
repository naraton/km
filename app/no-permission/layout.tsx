import "../globals.css";
import { Kanit } from "next/font/google";

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
    <html lang="en">
      <body className={`${kanit.className} min-h-screen justify-center`}>
        {children}
      </body>
    </html>
  );
}
