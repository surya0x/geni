"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  MOCK_ASSETS,
  truncateAddress,
  simulateShelbyDownload,
} from "@/lib/aptos";
import Link from "next/link";

export default function ViewerPage() {
  const params = useParams();
  const fileId = params.id as string;
  const asset = MOCK_ASSETS.find((a) => a.id === fileId) || MOCK_ASSETS[0];

  const [phase, setPhase] = useState<
    "verifying" | "retrieving" | "assembling" | "ready"
  >("verifying");
  const [shardCount, setShardCount] = useState(0);
  const totalShards = 24;

  useEffect(() => {
    // Phase 1: Verify transaction
    const timer1 = setTimeout(() => setPhase("retrieving"), 1500);

    // Phase 2: Retrieve shards
    const timer2 = setTimeout(() => {
      const interval = setInterval(() => {
        setShardCount((prev) => {
          if (prev >= totalShards) {
            clearInterval(interval);
            return totalShards;
          }
          return prev + 1;
        });
      }, 80);
      return () => clearInterval(interval);
    }, 1500);

    // Phase 3: Assembling
    const timer3 = setTimeout(() => setPhase("assembling"), 4000);

    // Phase 4: Ready
    const timer4 = setTimeout(() => setPhase("ready"), 5500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, []);

  const handleDownload = async () => {
    const { blob, filename } = await simulateShelbyDownload(asset.cid);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-4 mb-2">
          <span className="section-label">Secure Viewer</span>
          <div className="flex-1 h-px bg-border" />
          <span className="badge badge-active">● Verified</span>
        </div>
        <h1 className="heading-brutal text-2xl">
          {asset.name}
        </h1>
      </motion.div>

      {/* Retrieval Status */}
      <AnimatePresence mode="wait">
        {phase !== "ready" ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -20 }}
            className="card-dark mb-6"
          >
            {/* Terminal-style output */}
            <div className="font-mono text-xs leading-loose">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-gray-500"
              >
                <span className="text-accent">$</span> geni verify-purchase --tx-hash 0x...a3f8
              </motion.div>

              {phase !== "verifying" && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-success"
                >
                  ✓ Transaction verified on Aptos testnet
                </motion.div>
              )}

              {(phase === "retrieving" || phase === "assembling") && (
                <>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-gray-500 mt-2"
                  >
                    <span className="text-accent">$</span> shelby retrieve --cid {asset.cid.slice(0, 20)}...
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-gray-400"
                  >
                    Retrieving shards from mesh: [{shardCount}/{totalShards}]
                  </motion.div>
                </>
              )}

              {phase === "assembling" && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-gray-400 mt-2"
                >
                  <span className="text-accent">$</span> Reassembling file from {totalShards} shards...
                </motion.div>
              )}
            </div>

            {/* Progress bar */}
            <div className="mt-4 h-1 bg-surface-light overflow-hidden">
              <motion.div
                className="h-full bg-accent"
                initial={{ width: 0 }}
                animate={{
                  width:
                    phase === "verifying"
                      ? "20%"
                      : phase === "retrieving"
                      ? `${20 + (shardCount / totalShards) * 60}%`
                      : "90%",
                }}
                transition={{ duration: 0.3 }}
              />
            </div>

            <div className="mt-3 flex justify-between">
              <span className="font-mono text-xs text-gray-500">
                {phase === "verifying"
                  ? "Verifying purchase..."
                  : phase === "retrieving"
                  ? "Retrieving from Shelby mesh..."
                  : "Assembling file..."}
              </span>
              <span className="font-mono text-xs text-accent">
                {phase === "verifying"
                  ? "20%"
                  : phase === "retrieving"
                  ? `${Math.round(20 + (shardCount / totalShards) * 60)}%`
                  : "90%"}
              </span>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="ready"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card-dark mb-6"
          >
            {/* Success terminal */}
            <div className="font-mono text-xs leading-loose mb-4">
              <div className="text-success">✓ Transaction verified on Aptos testnet</div>
              <div className="text-success">
                ✓ All {totalShards} shards retrieved from Shelby mesh
              </div>
              <div className="text-success">✓ File reassembled successfully</div>
              <div className="text-gray-500 mt-2">
                <span className="text-accent">$</span> File ready for download
              </div>
            </div>

            <div className="h-px bg-border-dark my-4" />

            {/* File Card */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-surface-light flex items-center justify-center">
                  <span className="text-accent text-xl">◈</span>
                </div>
                <div>
                  <p className="font-mono text-sm font-bold text-text-inverse">
                    {asset.name}
                  </p>
                  <p className="font-mono text-xs text-gray-500">
                    {asset.fileSize} • {asset.fileType}
                  </p>
                </div>
              </div>

              <button
                onClick={handleDownload}
                className="btn-primary"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Download
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Asset Details */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="card-light"
      >
        <h2 className="font-mono font-bold text-xs uppercase tracking-wider mb-4">
          ▸ Asset Details
        </h2>
        <div className="space-y-2">
          {[
            { label: "Creator", value: truncateAddress(asset.creator) },
            { label: "CID", value: asset.cid.slice(0, 30) + "..." },
            { label: "File Type", value: asset.fileType },
            { label: "Size", value: asset.fileSize },
            { label: "Network", value: "Aptos Testnet" },
            { label: "Storage", value: "Shelby Mesh (Devnet)" },
          ].map((row) => (
            <div
              key={row.label}
              className="flex justify-between items-center py-2 border-b border-border"
            >
              <span className="font-mono text-xs text-text-muted uppercase tracking-wider">
                {row.label}
              </span>
              <span className="font-mono text-xs font-bold">{row.value}</span>
            </div>
          ))}
        </div>

        <div className="mt-6 flex gap-3">
          <Link href={`/file/${asset.id}`} className="btn-secondary flex-1 justify-center">
            ← Back to Listing
          </Link>
          <Link href="/dashboard" className="btn-dark flex-1 justify-center">
            Dashboard
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
