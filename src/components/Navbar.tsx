"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { formatAPT, shortenAddress } from "@/lib/contract";
import {
  getWalletAccountSummary,
  type WalletAccountSummary,
} from "@/lib/account";
import { motion } from "framer-motion";

export function Navbar() {
  const { connected, account, connect, disconnect, isLoading, wallets } = useWallet();
  const isPetraDetected = wallets.some((wallet) => wallet.name === "Petra");
  const accountAddress = account?.address?.toString() || "";
  const menuRef = useRef<HTMLDivElement>(null);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [accountSummary, setAccountSummary] =
    useState<WalletAccountSummary | null>(null);
  const [accountStatus, setAccountStatus] = useState<
    "idle" | "loading" | "error"
  >("idle");
  const [copyLabel, setCopyLabel] = useState("Copy");

  useEffect(() => {
    if (!isAccountOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setIsAccountOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [isAccountOpen]);

  const loadAccountSummary = async (address: string) => {
    setAccountStatus("loading");

    getWalletAccountSummary(address)
      .then((summary) => {
        setAccountSummary(summary);
        setAccountStatus("idle");
      })
      .catch((error) => {
        console.error("Failed to load account summary:", error);
        setAccountSummary(null);
        setAccountStatus("error");
      });
  };

  const handleConnect = async () => {
    if (isLoading) return;

    if (connected) {
      const shouldOpen = !isAccountOpen;
      setIsAccountOpen(shouldOpen);
      if (shouldOpen && accountAddress) {
        await loadAccountSummary(accountAddress);
      }
      return;
    }

    if (!isPetraDetected) {
      window.open("https://petra.app/", "_blank");
      return;
    }

    try {
      await connect("Petra");
    } catch (error) {
      console.error("Failed to connect wallet:", error);
      if (typeof window !== "undefined" && !("petra" in window)) {
        window.open("https://petra.app/", "_blank");
      }
    }
  };

  const handleCopyAddress = async () => {
    if (!accountAddress) return;
    await navigator.clipboard.writeText(accountAddress);
    setCopyLabel("Copied");
    setTimeout(() => setCopyLabel("Copy"), 1200);
  };

  const handleLogout = async () => {
    setIsAccountOpen(false);
    await disconnect();
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

        <div ref={menuRef} className="relative">
          <button
            onClick={handleConnect}
            className={connected ? "btn-dark" : "btn-primary"}
            style={{ padding: "0.5rem 1rem", fontSize: "0.7rem" }}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="w-2 h-2 rounded-full bg-border inline-block animate-pulse" />
                Wallet...
              </>
            ) : connected ? (
              <>
                <span className="w-2 h-2 rounded-full bg-success inline-block" />
                {shortenAddress(accountAddress, 4)}
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </>
            ) : !isPetraDetected ? (
              <>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 5v14" />
                  <path d="M5 12h14" />
                </svg>
                Install Petra
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

          {connected && isAccountOpen && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute right-0 top-full mt-2 w-[min(22rem,calc(100vw-2rem))] border border-border bg-white shadow-xl z-50"
            >
              <div className="p-4 border-b border-border">
                <div className="flex items-center justify-between mb-2">
                  <span className="section-label">Account</span>
                  <span className="badge badge-active">Testnet</span>
                </div>
                <p className="font-mono text-xs break-all leading-relaxed">
                  {accountAddress}
                </p>
              </div>

              <div className="grid grid-cols-3 border-b border-border">
                <button
                  onClick={handleCopyAddress}
                  className="font-mono text-xs font-bold uppercase py-3 hover:text-accent transition-colors"
                >
                  {copyLabel}
                </button>
                <a
                  href={`https://explorer.aptoslabs.com/account/${accountAddress}?network=testnet`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-xs font-bold uppercase py-3 text-center border-x border-border hover:text-accent transition-colors"
                >
                  Account
                </a>
                <button
                  onClick={handleLogout}
                  className="font-mono text-xs font-bold uppercase py-3 hover:text-error transition-colors"
                >
                  Logout
                </button>
              </div>

              <div className="p-4 border-b border-border">
                <div className="font-mono text-[10px] text-text-muted uppercase tracking-wider mb-1">
                  Balance
                </div>
                <div className="font-mono text-xl font-black">
                  {accountStatus === "loading" && !accountSummary
                    ? "Loading..."
                    : formatAPT(accountSummary?.balanceOctas ?? 0)}
                </div>
              </div>

              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="section-label">Recent Transactions</span>
                  <button
                    onClick={() => loadAccountSummary(accountAddress)}
                    className="font-mono text-[10px] text-accent hover:underline"
                    disabled={accountStatus === "loading"}
                  >
                    {accountStatus === "loading" ? "Loading" : "Refresh"}
                  </button>
                </div>

                {accountStatus === "error" ? (
                  <p className="font-mono text-xs text-error">
                    Unable to load account data.
                  </p>
                ) : accountSummary?.transactions.length ? (
                  <div className="space-y-2">
                    {accountSummary.transactions.map((transaction) => (
                      <a
                        key={transaction.hash}
                        href={transaction.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between gap-3 border border-border px-3 py-2 hover:border-accent transition-colors"
                      >
                        <div className="min-w-0">
                          <div className="font-mono text-xs font-bold truncate">
                            {transaction.label}
                          </div>
                          <div className="font-mono text-[10px] text-text-muted">
                            v{transaction.version || "-"}
                          </div>
                        </div>
                        <span
                          className={`font-mono text-[10px] font-bold ${
                            transaction.success ? "text-success" : "text-error"
                          }`}
                        >
                          {transaction.success ? "OK" : "FAIL"}
                        </span>
                      </a>
                    ))}
                  </div>
                ) : (
                  <p className="font-mono text-xs text-text-muted">
                    No transactions found.
                  </p>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </motion.nav>
  );
}
