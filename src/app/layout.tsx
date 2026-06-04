import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Monster × Red Bull — COLLISION",
  description: "Two legends. One unstoppable force. A concept.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="overflow-hidden">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap" rel="stylesheet" />
      </head>
      <body className="overflow-hidden w-screen">
        {children}
      </body>
    </html>
  );
}