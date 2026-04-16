import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import QueryProvider from "./providers/QueryProvider";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "World Pets Map",
  description: "Interactive map of popular pets around the world",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="h-full overflow-hidden bg-white text-zinc-900">
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
