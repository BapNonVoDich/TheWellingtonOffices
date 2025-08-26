import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AuthProvider from "./components/AuthProvider";
import { Toaster } from "react-hot-toast";
import Header from "./components/Header";
import Footer from "./components/Footer";
import prisma from "@/lib/prisma";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  fallback: ["ui-sans-serif", "system-ui", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "The Wellington Offices",
  description: "Nền tảng tìm kiếm và cho thuê văn phòng chuyên nghiệp.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const districts = await prisma.district.findMany({
    orderBy: { name: "asc" },
    include: { wards: { orderBy: { name: "asc" } } },
    where: {
      NOT: { name: { in: ["Tỉnh Bình Dương", "Tỉnh Bà Rịa - Vũng Tàu"] } },
    },
  });

  return (
    <html lang="vi" className={`h-full ${inter.variable}`}>
      <body className="bg-gray-100 font-sans antialiased overflow-x-hidden min-h-screen flex flex-col">
        <AuthProvider>
          <Toaster position="top-center" />
          
          {/* Header */}
          <Header districts={districts} />
          
          {/* Main content */}
          <main
            className="flex-1"
            style={{
              paddingTop: "var(--header-height)",
            }}
          >
            {children}
          </main>

          {/* Footer */}
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
