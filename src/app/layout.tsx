import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "EquiPe — Smart Expense Sharing",
  description: "Split the bill. Keep the peace. A premium expense sharing and settlement platform.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-[#050505] text-white">{children}</body>
    </html>
  );
}

