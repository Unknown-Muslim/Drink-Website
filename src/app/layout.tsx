import type { Metadata } from "next";
import localFont from "next/font/local";

const thunder = localFont({
  src: [
    { path: "./Thunder-BlackLC.woff2", weight: "400", style: "normal" },
    { path: "./Thunder-BlackLC.woff",  weight: "400", style: "normal" },
    { path: "./Thunder-BlackLC.ttf",   weight: "400", style: "normal" },
  ],
  variable: "--font-thunder",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Monster × Red Bull — COLLISION",
  description: "Two legends. One unstoppable force. A concept.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="overflow-hidden">
      <body className={`${thunder.variable} overflow-hidden w-screen`}>
        {children}
      </body>
    </html>
  );
}