import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { WalletProvider } from "@/providers/WalletProvider";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GENI — The Fire-Fast Asset Vault",
  description:
    "Upload. Price. Sell. A minimalist pay-to-unlock gateway for high-value files powered by Aptos and Shelby Protocol.",
  keywords: ["Aptos", "Shelby", "digital assets", "crypto", "file vault", "pay to unlock"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <WalletProvider>
          <Navbar />
          <main className="flex-1 pt-14">{children}</main>
          <Footer />
        </WalletProvider>
      </body>
    </html>
  );
}
