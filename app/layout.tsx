import type { Metadata } from "next";
import "./globals.css";
import { CustomFontLoader } from "@/app/components/layout/CustomFontLoader";

export const metadata: Metadata = {
  title: "自由导航-宝哥",
  description: "自由导航 (Aurora Nav) - 一个简约、美观、可高度定制的浏览器起始页。",
  icons: {
    icon: '/icon.png',
  },
};

import { FontProvider } from '@/app/context/FontContext';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className="antialiased"
      >
        <FontProvider>
          <CustomFontLoader />
          {children}
        </FontProvider>
      </body>
    </html>
  );
}
