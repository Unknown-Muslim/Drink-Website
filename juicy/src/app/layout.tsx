import type { Metadata } from "next";
import localFont from "next/font/local";
import type { ReactNode } from "react";
import "./globals.css";

const thunder = localFont({
  src: [
    { path: "./fonts/Thunder-BlackLC.woff2", weight: "400", style: "normal" },
    { path: "./fonts/Thunder-BlackLC.woff",  weight: "400", style: "normal" },
    { path: "./fonts/Thunder-BlackLC.ttf",   weight: "400", style: "normal" },
  ],
  variable: "--font-thunder",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Monster × Red Bull — COLLISION",
  description: "Two legends. One unstoppable force. A concept.",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning className="w-screen overflow-hidden">
      <body className={`${thunder.variable} antialiased w-screen overflow-hidden`}>
        {children}
      </body>
    </html>
   );
}