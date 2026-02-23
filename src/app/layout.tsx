import type { Metadata } from "next";
import { Nav } from "@/components/nav";
import "./globals.css";

export const metadata: Metadata = {
  title: "Matching API Tester",
  description: "Test backend matching API endpoints",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background font-sans antialiased">
        <Nav />
        <main className="container mx-auto max-w-6xl px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
