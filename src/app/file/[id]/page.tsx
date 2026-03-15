"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import {
  MOCK_ASSETS,
  truncateAddress,
  formatAPT,
  simulatePurchase,
} from "@/lib/aptos";

export default function PublicFilePage() {
  const params = useParams();
  const router = useRouter();
  const { connected } = useWallet();
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [purchaseStep, setPurchaseStep] = useState<
    "idle" | "signing" | "confirming" | "success" | "error"
  >("idle");
  const [txHash, setTxHash] = useState("");

  const fileId = params.id as string;
  const asset = MOCK_ASSETS.find((a) => a.id === fileId) || MOCK_ASSETS[0];

  const handlePurchase = async () => {
    if (!connected) {
      alert("Please connect your Aptos wallet first.");
      return;
    }

    setIsPurchasing(true);
    setPurchaseStep("signing");

    try {
      // Simulate wallet signing
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setPurchaseStep("confirming");

      // Simulate on-chain transaction
      const result = await simulatePurchase(asset.id, asset.price);

      if (result.success) {
        setTxHash(result.txHash);
        setPurchaseStep("success");

        // Redirect to viewer after short delay
        setTimeout(() => {
          router.push(`/view/${asset.id}`);
        }, 2000);
      }
    } catch {
      setPurchaseStep("error");
      setTimeout(() => {
        setIsPurchasing(false);
        setPurchaseStep("idle");
      }, 2000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-4 mb-2">
          <span className="section-label">Public Link</span>
          <div className="flex-1 h-px bg-border" />
          <span className="font-mono text-xs text-text-muted">
            geni.link/{fileId}
          </span>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Blurred Preview */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="card-dark aspect-square flex items-center justify-center relative overflow-hidden group">
            {/* Faux file preview */}
            <div className="blur-preview absolute inset-0 flex items-center justify-center">
              <div className="grid grid-cols-4 gap-2 p-8 w-full h-full opacity-40">
                {Array.from({ length: 16 }).map((_, i) => (
                  <div
                    key={i}
                    className="bg-gray-600 rounded"
                    style={{
                      opacity: 0.3 + Math.random() * 0.5,
                      animationDelay: `${i * 0.1}s`,
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Lock overlay */}
            <div className="relative z-10 text-center">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-5xl mb-4 opacity-60"
              >
                🔒
              </motion.div>
              <p className="font-mono text-xs text-gray-400 uppercase tracking-wider">
                Content Locked
              </p>
            </div>

            {/* Corner markers */}
            <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-accent opacity-50" />
            <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-accent opacity-50" />
            <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-accent opacity-50" />
            <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-accent opacity-50" />
          </div>
        </motion.div>

        {/* Details & Purchase */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col"
        >
          {/* File Info */}
          <div className="card-light mb-4 flex-1">
            <h1 className="font-mono font-black text-lg uppercase mb-4">
              {asset.name}
            </h1>

            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-border">
                <span className="font-mono text-xs text-text-muted uppercase tracking-wider">
                  Creator
                </span>
                <span className="font-mono text-xs font-bold">
                  {truncateAddress(asset.creator)}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border">
                <span className="font-mono text-xs text-text-muted uppercase tracking-wider">
                  File Type
                </span>
                <span className="font-mono text-xs font-bold">
                  {asset.fileType}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border">
                <span className="font-mono text-xs text-text-muted uppercase tracking-wider">
                  Size
                </span>
                <span className="font-mono text-xs font-bold">
                  {asset.fileSize}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border">
                <span className="font-mono text-xs text-text-muted uppercase tracking-wider">
                  Purchases
                </span>
                <span className="font-mono text-xs font-bold">
                  {asset.purchases}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border">
                <span className="font-mono text-xs text-text-muted uppercase tracking-wider">
                  Storage
                </span>
                <span className="font-mono text-xs font-bold text-accent">
                  Shelby Mesh
                </span>
              </div>
            </div>
          </div>

          {/* Price & Purchase */}
          <div className="card-dark">
            <div className="flex justify-between items-center mb-4">
              <span className="font-mono text-xs text-gray-400 uppercase tracking-wider">
                Price
              </span>
              <span className="font-mono text-2xl font-black text-accent">
                {formatAPT(asset.price)}
              </span>
            </div>

            <AnimatePresence mode="wait">
              {purchaseStep === "idle" && (
                <motion.button
                  key="buy"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={handlePurchase}
                  className="btn-primary w-full justify-center text-base"
                  style={{ padding: "1rem" }}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <rect
                      x="1"
                      y="3"
                      width="15"
                      height="13"
                      rx="2"
                      ry="2"
                    />
                    <path d="M16 8h2a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-2" />
                  </svg>
                  PAY TO UNLOCK
                </motion.button>
              )}

              {purchaseStep === "signing" && (
                <motion.div
                  key="signing"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center py-3"
                >
                  <div className="loading-bar mb-3" />
                  <p className="font-mono text-xs text-gray-400">
                    Waiting for wallet signature...
                  </p>
                </motion.div>
              )}

              {purchaseStep === "confirming" && (
                <motion.div
                  key="confirming"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center py-3"
                >
                  <div className="loading-bar mb-3" />
                  <p className="font-mono text-xs text-gray-400">
                    Confirming on Aptos...
                  </p>
                </motion.div>
              )}

              {purchaseStep === "success" && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-3"
                >
                  <div className="text-success text-2xl mb-2">✓</div>
                  <p className="font-mono text-xs text-success font-bold mb-1">
                    Purchase Confirmed!
                  </p>
                  <p className="font-mono text-xs text-gray-500">
                    TX: {truncateAddress(txHash)}
                  </p>
                  <p className="font-mono text-xs text-gray-500 mt-2">
                    Redirecting to viewer...
                  </p>
                </motion.div>
              )}

              {purchaseStep === "error" && (
                <motion.div
                  key="error"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-3"
                >
                  <div className="text-error text-2xl mb-2">✕</div>
                  <p className="font-mono text-xs text-error font-bold">
                    Transaction Failed
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {purchaseStep === "idle" && (
              <p className="font-mono text-xs text-gray-500 text-center mt-3">
                APT is transferred directly to the creator
              </p>
            )}
          </div>
        </motion.div>
      </div>

      {/* CID Info */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mt-6 card-light"
      >
        <div className="flex items-center gap-2 mb-2">
          <span className="section-label">Content Identifier (CID)</span>
        </div>
        <p className="font-mono text-xs text-text-muted break-all">
          {asset.cid}
        </p>
      </motion.div>
    </div>
  );
}
