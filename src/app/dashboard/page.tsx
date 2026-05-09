"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { formatAPT } from "@/lib/aptos";
import { buildListAssetTx } from "@/lib/contract";
import {
  shelbyUpload,
  type UploadProgress,
  getAccountBlobs,
  getShelbyBlobExplorerUrl,
  getShelbyAccountExplorerUrl,
  getAptosTxExplorerUrl,
  truncateHash,
} from "@/lib/shelby";
import type { BlobMetadata } from "@shelby-protocol/sdk/browser";
import Link from "next/link";

type ListedAsset = {
  id: string;
  cid: string;
  name: string;
  price: number;
  status: "active" | "pending" | "sold";
  fileSize: string;
  txHash?: string;
  accountAddress?: string;
  blobName?: string;
};

export default function DashboardPage() {
  const { connected, account, signAndSubmitTransaction } = useWallet();
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [price, setPrice] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStep, setUploadStep] = useState<UploadProgress | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [assets, setAssets] = useState<ListedAsset[]>([]);
  const [isLoadingAssets, setIsLoadingAssets] = useState(false);

  // Fetch real blobs from Shelby when wallet connects
  useEffect(() => {
    if (!connected || !account?.address) {
      setAssets([]);
      return;
    }
    const fetchBlobs = async () => {
      setIsLoadingAssets(true);
      try {
        const blobs = await getAccountBlobs(account.address.toString());
        setAssets(
          (blobs as BlobMetadata[]).map((blob: BlobMetadata, i: number) => ({
            id: `shelby-${i}-${blob.blobNameSuffix}`,
            cid: blob.blobMerkleRoot
              ? Array.from(blob.blobMerkleRoot).map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 20) + "..."
              : "on-chain",
            name: blob.blobNameSuffix,
            price: 0,
            status: blob.isWritten ? ("active" as const) : ("pending" as const),
            fileSize: blob.size ? `${(blob.size / (1024 * 1024)).toFixed(2)} MB` : "—",
            accountAddress: account.address.toString(),
            blobName: blob.blobNameSuffix,
          }))
        );
      } catch (err) {
        console.error("Failed to fetch blobs:", err);
      } finally {
        setIsLoadingAssets(false);
      }
    };
    fetchBlobs();
  }, [connected, account?.address]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) setUploadedFile(file);
  }, []);

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) setUploadedFile(file);
    },
    []
  );

  const handleListAsset = async () => {
    if (!uploadedFile || !price || !account?.address) return;
    setIsUploading(true);
    setUploadProgress(0);
    setUploadStep(null);

    try {
      // Step 1-3: Encode + register on Shelby + RPC upload
      const result = await shelbyUpload(
        uploadedFile,
        account.address.toString(),
        signAndSubmitTransaction,
        (progress) => {
          setUploadStep(progress);
          switch (progress.step) {
            case "encoding": setUploadProgress(20); break;
            case "registering": setUploadProgress(50); break;
            case "uploading": setUploadProgress(75); break;
            case "done": setUploadProgress(90); break;
          }
        }
      );

      // Step 4: List on Geni contract (on-chain price + metadata)
      setUploadStep({ step: "registering", message: "Listing on Geni contract..." });
      const listTx = buildListAssetTx(
        result.blobName,
        uploadedFile.name,
        parseFloat(price),
        uploadedFile.size
      );
      await signAndSubmitTransaction(listTx);
      setUploadProgress(100);

      const newAsset: ListedAsset = {
        id: account.address.toString(), // buyer link = /file/[creatorAddress]
        cid: result.merkleRoot.slice(0, 20) + "...",
        name: uploadedFile.name,
        price: parseFloat(price),
        status: "active",
        fileSize: `${(uploadedFile.size / (1024 * 1024)).toFixed(1)} MB`,
        txHash: result.txHash,
        accountAddress: account.address.toString(),
        blobName: result.blobName,
      };

      setAssets((prev) => [newAsset, ...prev]);
      setUploadedFile(null);
      setPrice("");

      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
        setUploadStep(null);
      }, 1500);
    } catch (error) {
      console.error("Upload failed:", error);
      setIsUploading(false);
      setUploadProgress(0);
      setUploadStep({ step: "error", message: error instanceof Error ? error.message : "Upload failed" });
      setTimeout(() => setUploadStep(null), 4000);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (!connected) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-32 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="text-6xl mb-6 opacity-20">◈</div>
          <h1 className="heading-brutal text-3xl mb-4">
            CONNECT <span className="text-accent">WALLET</span>
          </h1>
          <p className="font-mono text-sm text-text-muted max-w-md mx-auto">
            Connect your Aptos wallet to access the Creator Dashboard. Upload
            files, set prices, and start earning.
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-4 mb-2">
          <span className="section-label">Creator Dashboard</span>
          <div className="flex-1 h-px bg-border" />
          {account?.address && (
            <a
              href={getShelbyAccountExplorerUrl(account.address.toString())}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-xs text-accent hover:underline flex items-center gap-1"
            >
              View on Explorer ↗
            </a>
          )}
          <span className="badge badge-active">● Connected</span>
        </div>
        <h1 className="heading-brutal text-3xl">
          YOUR <span className="text-accent">VAULT</span>
        </h1>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-1"
        >
          <div className="card-light">
            <h2 className="font-mono font-bold text-xs uppercase tracking-wider mb-4">
              ▸ Upload New Asset
            </h2>

            {/* Dropzone */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`dropzone mb-4 ${isDragging ? "active" : ""}`}
            >
              <input
                type="file"
                onChange={handleFileSelect}
                className="absolute inset-0 opacity-0 cursor-pointer"
                id="file-upload"
              />
              <AnimatePresence mode="wait">
                {uploadedFile ? (
                  <motion.div
                    key="file"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <div className="text-accent text-2xl mb-2">✓</div>
                    <p className="font-mono text-xs font-bold">
                      {uploadedFile.name}
                    </p>
                    <p className="font-mono text-xs text-text-muted mt-1">
                      {formatFileSize(uploadedFile.size)}
                    </p>
                  </motion.div>
                ) : (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <div className="text-3xl mb-2 opacity-30">↑</div>
                    <p className="font-mono text-xs font-bold mb-1">
                      Drop file here
                    </p>
                    <p className="font-mono text-xs text-text-muted">
                      or click to browse
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Price Input */}
            <div className="mb-4">
              <label className="font-mono text-xs text-text-muted uppercase tracking-wider block mb-2">
                Price (APT)
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0.00"
                  className="input-brutalist pr-14"
                  step="0.01"
                  min="0"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-xs text-text-muted font-bold">
                  APT
                </span>
              </div>
            </div>

            {/* Upload Progress */}
            <AnimatePresence>
              {(isUploading || uploadStep) && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-4"
                >
                  <div className="flex justify-between mb-1">
                    <span className={`font-mono text-xs ${uploadStep?.step === "error" ? "text-red-500" : "text-text-muted"}`}>
                      {uploadStep?.message || "Preparing..."}
                    </span>
                    <span className="font-mono text-xs font-bold">
                      {uploadStep?.step === "error" ? "✕" : `${Math.round(uploadProgress)}%`}
                    </span>
                  </div>
                  <div className="h-1 bg-bg-alt overflow-hidden">
                    <motion.div
                      className={`h-full ${uploadStep?.step === "error" ? "bg-red-500" : "bg-accent"}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${uploadProgress}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>

                  {/* Step indicators */}
                  {isUploading && uploadStep?.step !== "error" && (
                    <div className="flex gap-2 mt-3">
                      {["encoding", "registering", "uploading"].map((step, i) => (
                        <div key={step} className="flex items-center gap-1">
                          <div
                            className={`w-2 h-2 rounded-full ${
                              uploadStep?.step === step
                                ? "bg-accent animate-pulse"
                                : ["encoding", "registering", "uploading"].indexOf(uploadStep?.step || "") > i
                                ? "bg-accent"
                                : "bg-border"
                            }`}
                          />
                          <span className="font-mono text-xs text-text-muted capitalize">
                            {step === "encoding" ? "Encode" : step === "registering" ? "Register" : "Upload"}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* List Button */}
            <button
              onClick={handleListAsset}
              disabled={!uploadedFile || !price || isUploading}
              className="btn-primary w-full justify-center disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:transform-none disabled:hover:shadow-none"
            >
              {isUploading ? (
                "Processing..."
              ) : (
                <>
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                  Upload to Shelby
                </>
              )}
            </button>

            {/* Info note */}
            <p className="font-mono text-xs text-text-muted mt-3 leading-relaxed">
              ⓘ Uploads require APT (gas) + ShelbyUSD. Files are stored for 30 days on shelbynet testnet.
            </p>
          </div>
        </motion.div>

        {/* Assets Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2"
        >
          <div className="card-light overflow-hidden p-0">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
              <h2 className="font-mono font-bold text-xs uppercase tracking-wider">
                ▸ Listed Assets
              </h2>
              <span className="font-mono text-xs text-text-muted">
                {isLoadingAssets ? "Loading..." : `${assets.length} files`}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="table-brutalist">
                <thead>
                  <tr>
                    <th>File</th>
                    <th>Price</th>
                    <th>Status</th>
                    <th>Records</th>
                    <th>Link</th>
                  </tr>
                </thead>
                <tbody>
                  {assets.map((asset) => (
                    <tr key={asset.id}>
                      <td>
                        <div>
                          <div className="font-bold text-xs">{asset.name}</div>
                          <div className="text-text-muted text-xs mt-0.5">
                            {asset.fileSize}
                          </div>
                        </div>
                      </td>
                      <td className="font-bold">{formatAPT(asset.price)}</td>
                      <td>
                        <span
                          className={`badge badge-${asset.status === "active" ? "active" : asset.status === "sold" ? "sold" : "pending"}`}
                        >
                          {asset.status}
                        </span>
                      </td>
                      <td>
                        <div className="flex flex-col gap-1">
                          {asset.blobName && asset.accountAddress && (
                            <a
                              href={getShelbyBlobExplorerUrl(asset.accountAddress, asset.blobName)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-mono text-xs text-accent hover:underline flex items-center gap-1"
                            >
                              Shelby ↗
                            </a>
                          )}
                          {asset.txHash && (
                            <a
                              href={getAptosTxExplorerUrl(asset.txHash)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-mono text-xs text-text-muted hover:text-accent hover:underline flex items-center gap-1"
                            >
                              Tx: {truncateHash(asset.txHash, 4)}
                            </a>
                          )}
                          {!asset.txHash && !asset.blobName && (
                            <span className="font-mono text-xs text-text-muted">—</span>
                          )}
                        </div>
                      </td>
                      <td>
                        <Link
                          href={`/file/${asset.accountAddress || asset.id}`}
                          className="font-mono text-xs text-accent hover:underline"
                          target="_blank"
                        >
                          /file/{(asset.accountAddress || asset.id).slice(0, 10)}…
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
