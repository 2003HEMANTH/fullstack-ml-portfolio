import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "../components/Navbar";

const inter = Inter({ subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: { default: "Hemanth L — Full-stack & ML Engineer", template: "%s — Hemanth L" },
  description: "Portfolio of Hemanth L, a full-stack developer and data science engineer in Bengaluru.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body className={inter.className}><Navbar />{children}</body></html>;
}