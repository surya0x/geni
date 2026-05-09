"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import {
  getOnChainAsset,
  buildPurchaseTx,
  formatAPT,
  shortenAddress,
  getAptosTxUrl,
  type OnChainAsset,
} from "@/lib/contract";
import {
  getShelbyDownloadUrl,
  getShelbyBlobExplorerUrl,
} from "@/lib/shelby";
import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";

const aptos = new Aptos(new AptosConfig({ network: Network.TESTNET }));

export default function PublicFilePage() {
  const params = useParams();
  // URL format: /file/[creatorAddress]
  // e.g. /file/0x18b20a31641727e4ceff2cb7e412036867802585fb98227e63eede4e5ec8423c
  const creatorAddress = params.id as string;

  const { connected, account, signAndSubmitTransaction } = useWallet();
  const [asset, setAsset] = useState<OnChainAsset | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [purchaseStep, setPurchaseStep] = useState<
    "idle" | "signing" | "confirming" | "success" | "error"
  >("idle");
  const [txHash, setTxHash] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [downloadUrl, setDownloadUrl] = useState("");

  // ─── Load asset from chain ─────────────────────────────────────
  useEffect(() => {
    if (!creatorAddress) return;
    const load = async () => {
      setIsLoading(true);
      const data = await getOnChainAsset(creatorAddress);
      if (!data) {
        setNotFound(true);
      } else {
        setAsset(data);
      }
      setIsLoading(false);
    };
    load();
  }, [creatorAddress]);

  // ─── Purchase handler ──────────────────────────────────────────
  const handlePurchase = async () => {
    if (!connected || !account) {
      alert("Please connect your Aptos wallet first.");
      return;
    }
    if (!asset) return;

    setPurchaseStep("signing");
    setErrorMsg("");

    try {
      const tx = buildPurchaseTx(creatorAddress, asset.price);
      const result = await signAndSubmitTransaction(tx);

      setPurchaseStep("confirming");
      await aptos.waitForTransaction({ transactionHash: result.hash });

      setTxHash(result.hash);
      // After payment confirmed, generate the Shelby download URL
      const url = getShelbyDownloadUrl(creatorAddress, asset.blobName);
      setDownloadUrl(url);
      setPurchaseStep("success");
    } catch (err) {
      console.error("Purchase error:", err);
      setErrorMsg(
        err instanceof Error ? err.message : "Transaction failed"
      );
      setPurchaseStep("error");
      setTimeout(() => setPurchaseStep("idle"), 3000);
    }
  };

  const handleDownload = () => {
    if (!downloadUrl || !asset) return;
    const a = document.createElement("a");
    a.href = downloadUrl;
    a.download = asset.blobName;
    a.click();
  };

  // ─── Render: Loading ───────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-32 text-center">
        <div className="loading-bar max-w-xs mx-auto mb-4" />
        <p className="font-mono text-xs text-text-muted">
          Fetching asset from Aptos testnet...
        </p>
      </div>
    );
  }

  // ─── Render: Not found ─────────────────────────────────────────
  if (notFound || !asset) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-32 text-center">
        <div className="text-5xl mb-6 opacity-20">◈</div>
        <h1 className="heading-brutal text-2xl mb-3">
          ASSET <span className="text-accent">NOT FOUND</span>
        </h1>
        <p className="font-mono text-xs text-text-muted">
          No asset listed at this address on Aptos testnet.
        </p>
      </div>
    );
  }

  const fileSizeStr = asset.fileSize
    ? asset.fileSize < 1024 * 1024
      ? `${(asset.fileSize / 1024).toFixed(1)} KB`
      : `${(asset.fileSize / (1024 * 1024)).toFixed(2)} MB`
    : "—";

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-4 mb-2">
          <span className="section-label">Pay-to-Unlock</span>
          <div className="flex-1 h-px bg-border" />
          <a
            href={getShelbyBlobExplorerUrl(creatorAddress, asset.blobName)}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-xs text-accent hover:underline"
          >
            Shelby Explorer ↗
          </a>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Blurred Preview / Success State */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="card-dark aspect-square flex items-center justify-center relative overflow-hidden">
            {purchaseStep === "success" ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center z-10 px-6"
              >
                <div className="text-success text-5xl mb-4">✓</div>
                <p className="font-mono text-xs text-success font-bold mb-2">
                  ACCESS GRANTED
                </p>
                <p className="font-mono text-xs text-gray-400 mb-4">
                  File unlocked from Shelby mesh
                </p>
                <button
                  onClick={handleDownload}
                  className="btn-primary text-xs"
                >
                  ↓ Download {asset.blobName}
                </button>
              </motion.div>
            ) : (
              <>
                {/* Blurred faux preview */}
                <div className="blur-preview absolute inset-0 flex items-center justify-center">
                  <div className="grid grid-cols-4 gap-2 p-8 w-full h-full opacity-40">
                    {Array.from({ length: 16 }).map((_, i) => (
                      <div
                        key={i}
                        className="bg-gray-600 rounded"
                        style={{ opacity: 0.3 + (i % 5) * 0.1 }}
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
              </>
            )}
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

            <div className="space-y-0">
              <div className="flex justify-between items-center py-2 border-b border-border">
                <span className="font-mono text-xs text-text-muted uppercase tracking-wider">
                  Creator
                </span>
                <span className="font-mono text-xs font-bold">
                  {shortenAddress(creatorAddress)}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border">
                <span className="font-mono text-xs text-text-muted uppercase tracking-wider">
                  File
                </span>
                <span className="font-mono text-xs font-bold">
                  {asset.blobName}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border">
                <span className="font-mono text-xs text-text-muted uppercase tracking-wider">
                  Size
                </span>
                <span className="font-mono text-xs font-bold">
                  {fileSizeStr}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border">
                <span className="font-mono text-xs text-text-muted uppercase tracking-wider">
                  Storage
                </span>
                <span className="font-mono text-xs font-bold text-accent">
                  Shelby Testnet
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border">
                <span className="font-mono text-xs text-text-muted uppercase tracking-wider">
                  Network
                </span>
                <span className="font-mono text-xs font-bold">
                  Aptos Testnet
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
                    <rect x="1" y="3" width="15" height="13" rx="2" ry="2" />
                    <path d="M16 8h2a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-2" />
                  </svg>
                  PAY TO UNLOCK
                </motion.button>
              )}

              {(purchaseStep === "signing" || purchaseStep === "confirming") && (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center py-3"
                >
                  <div className="loading-bar mb-3" />
                  <p className="font-mono text-xs text-gray-400">
                    {purchaseStep === "signing"
                      ? "Waiting for wallet signature..."
                      : "Confirming on Aptos testnet..."}
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
                    Payment Confirmed!
                  </p>
                  <a
                    href={getAptosTxUrl(txHash)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-xs text-accent hover:underline"
                  >
                    View TX on Aptos ↗
                  </a>
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
                  <p className="font-mono text-xs text-error font-bold mb-1">
                    Transaction Failed
                  </p>
                  {errorMsg && (
                    <p className="font-mono text-xs text-gray-500 break-all">
                      {errorMsg.slice(0, 80)}
                    </p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {purchaseStep === "idle" && (
              <p className="font-mono text-xs text-gray-500 text-center mt-3">
                APT transferred directly to creator&apos;s wallet
              </p>
            )}
          </div>
        </motion.div>
      </div>

      {/* On-chain record */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mt-6 card-light"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="section-label">On-Chain Record</span>
          <div className="flex gap-3">
            <a
              href={getShelbyBlobExplorerUrl(creatorAddress, asset.blobName)}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-xs text-accent hover:underline"
            >
              Shelby Explorer ↗
            </a>
            <a
              href={`https://explorer.aptoslabs.com/account/${creatorAddress}?network=testnet`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-xs text-text-muted hover:text-accent hover:underline"
            >
              Aptos ↗
            </a>
          </div>
        </div>
        <p className="font-mono text-xs text-text-muted break-all">
          Creator: {creatorAddress}
        </p>
        <p className="font-mono text-xs text-text-muted mt-1 break-all">
          Blob: {asset.blobName}
        </p>
        {txHash && (
          <p className="font-mono text-xs text-success mt-1 break-all">
            Purchase TX: {txHash}
          </p>
        )}
      </motion.div>
    </div>
  );
}
