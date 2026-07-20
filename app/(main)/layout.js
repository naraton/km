import "../globals.css";
import LayoutDrawer from "../components/LayoutDrawer";
import AuthWrapper from "../components/AuthWrapper";
import { Kanit } from "next/font/google";

const kanit = Kanit({
  subsets: ["thai"],
  weight: ["300", "400", "500", "600", "700"], // กำหนดน้ำหนักที่ต้องใช้
});

export default function RootLayout({ children }) {
  return (
    <html lang="th" data-theme="fantasy">
      <body className={`${kanit.className} min-h-screen`}>
        <AuthWrapper requireAuth={true}>
          <LayoutDrawer>{children}</LayoutDrawer>
        </AuthWrapper>
      </body>
    </html>
  );
}
