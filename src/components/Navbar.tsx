"use client";

import Link from "next/link";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { truncateAddress } from "@/lib/aptos";
import { motion } from "framer-motion";

export function Navbar() {
  const { connected, account, connect, disconnect } = useWallet();

  const handleConnect = async () => {
    if (connected) {
      disconnect();
    } else {
      try {
        // Connect directly using the wallet name
        await connect("Petra" as any);
      } catch (error) {
        console.error("Failed to connect wallet:", error);
        // Check if Petra extension is installed
        if (!(window as any).petra) {
          window.open("https://petra.app/", "_blank");
        }
      }
    }
  };

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="fixed top-0 left-0 right-0 z-50 border-b border-border"
      style={{ background: "rgba(245, 240, 235, 0.9)", backdropFilter: "blur(12px)" }}
    >
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          <div className="w-6 h-6 bg-accent rounded-full flex items-center justify-center">
            <div className="w-2 h-2 bg-white rounded-full" />
          </div>
          <span className="font-mono font-black text-sm tracking-widest uppercase">
            Geni
          </span>
        </Link>

        {/* Nav Links */}
        <div className="hidden md:flex items-center gap-8">
          <Link
            href="/dashboard"
            className="font-mono text-xs uppercase tracking-wider text-text-muted hover:text-accent transition-colors"
          >
            Dashboard
          </Link>
          <Link
            href="/explore"
            className="font-mono text-xs uppercase tracking-wider text-text-muted hover:text-accent transition-colors"
          >
            Explore
          </Link>
          <span className="font-mono text-xs uppercase tracking-wider text-text-muted">
            Docs
          </span>
        </div>

        {/* Wallet Button */}
        <button
          onClick={handleConnect}
          className={connected ? "btn-dark" : "btn-primary"}
          style={{ padding: "0.5rem 1rem", fontSize: "0.7rem" }}
        >
          {connected ? (
            <>
              <span className="w-2 h-2 rounded-full bg-success inline-block" />
              {truncateAddress(account?.address?.toString() || "")}
            </>
          ) : (
            <>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="6" width="20" height="14" rx="2" />
                <path d="M2 10h20" />
              </svg>
              Connect Wallet
            </>
          )}
        </button>
      </div>
    </motion.nav>
  );
}
