import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "TenderPro AI — Tender & RFP Analyzer",
  description:
    "Upload government tenders and RFP documents. AI extracts eligibility criteria, deadlines, required documents, scoring criteria, and generates a compliance checklist instantly.",
  keywords: "tender analyzer, RFP analysis, government procurement, compliance checklist, AI procurement",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={outfit.variable} suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
