"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  formatAPT,
  getListedAssets,
  shortenAddress,
  type ListedOnChainAsset,
} from "@/lib/contract";

const FILE_FILTERS = [
  "All",
  "Images",
  "Audio",
  "Video",
  "Documents",
  "Archives",
  "Other",
] as const;

type FileFilter = (typeof FILE_FILTERS)[number];
type SortOption = "newest" | "price-low" | "price-high" | "name";

const COVER_COLORS = [
  "#F26522",
  "#0F766E",
  "#2563EB",
  "#7C3AED",
  "#BE123C",
  "#3F6212",
  "#111827",
  "#B45309",
];

function formatFileSize(bytes: number): string {
  if (!bytes) return "Unknown";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function getExtension(fileName: string): string {
  const part = fileName.split(".").pop();
  return part && part !== fileName ? part.toUpperCase() : "FILE";
}

function getFileFilter(fileName: string): Exclude<FileFilter, "All"> {
  const ext = getExtension(fileName).toLowerCase();
  if (["jpg", "jpeg", "png", "gif", "webp", "svg", "fig"].includes(ext)) {
    return "Images";
  }
  if (["mp3", "wav", "flac", "aac", "ogg"].includes(ext)) return "Audio";
  if (["mp4", "mov", "webm", "mkv"].includes(ext)) return "Video";
  if (["pdf", "doc", "docx", "txt", "md", "ppt", "pptx", "xls", "xlsx"].includes(ext)) {
    return "Documents";
  }
  if (["zip", "rar", "7z", "tar", "gz"].includes(ext)) return "Archives";
  return "Other";
}

function getCoverColor(asset: ListedOnChainAsset): string {
  const seed = `${asset.creatorAddress}:${asset.blobName}`;
  const total = Array.from(seed).reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return COVER_COLORS[total % COVER_COLORS.length];
}

export default function ExplorePage() {
  const [activeFilter, setActiveFilter] = useState<FileFilter>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [assets, setAssets] = useState<ListedOnChainAsset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const loadAssets = useCallback(async () => {
    setIsLoading(true);
    setLoadError("");
    try {
      const listedAssets = await getListedAssets(100);
      setAssets(listedAssets);
    } catch (error) {
      console.error("Failed to load marketplace:", error);
      setLoadError("Unable to load Aptos testnet listings.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAssets();
  }, [loadAssets]);

  const filteredAssets = useMemo(() => {
    let filtered = [...assets];

    if (activeFilter !== "All") {
      filtered = filtered.filter((asset) => getFileFilter(asset.blobName) === activeFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (asset) =>
          asset.name.toLowerCase().includes(q) ||
          asset.blobName.toLowerCase().includes(q) ||
          asset.creatorAddress.toLowerCase().includes(q)
      );
    }

    switch (sortBy) {
      case "newest":
        filtered.sort((a, b) => b.transactionVersion - a.transactionVersion);
        break;
      case "price-low":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "name":
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
    }

    return filtered;
  }, [activeFilter, assets, searchQuery, sortBy]);

  return (
    <div className="min-h-screen">
      <div className="border-b border-border bg-white">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            <motion.h1
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="heading-brutal text-2xl shrink-0"
            >
              EXPLORE
            </motion.h1>

            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex-1 w-full"
            >
              <div className="relative">
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search live listings..."
                  className="input-brutalist pl-10"
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="flex w-full shrink-0 gap-2 md:w-auto"
            >
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="input-brutalist text-xs uppercase tracking-wider cursor-pointer"
                style={{ width: "auto", paddingRight: "2rem" }}
              >
                <option value="newest">Newest</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="name">Name</option>
              </select>
              <button
                onClick={loadAssets}
                className="btn-secondary"
                style={{ padding: "0.75rem 1rem", fontSize: "0.7rem" }}
              >
                Refresh
              </button>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="border-b border-border bg-white sticky top-14 z-40">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center gap-1 overflow-x-auto py-3 -mb-px">
            {FILE_FILTERS.map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`
                  font-mono text-xs uppercase tracking-wider px-4 py-2
                  border-b-2 transition-all whitespace-nowrap
                  ${
                    activeFilter === filter
                      ? "border-accent text-accent font-bold"
                      : "border-transparent text-text-muted hover:text-foreground hover:border-border"
                  }
                `}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-6">
          <span className="section-label">
            {isLoading
              ? "Loading Aptos testnet listings"
              : `${filteredAssets.length} live listing${filteredAssets.length !== 1 ? "s" : ""}`}
            {activeFilter !== "All" && !isLoading ? ` in ${activeFilter}` : ""}
          </span>
          <div className="flex items-center gap-4">
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="font-mono text-xs text-accent hover:underline"
              >
                Clear search
              </button>
            )}
            <Link href="/dashboard" className="font-mono text-xs text-accent hover:underline">
              List an asset
            </Link>
          </div>
        </div>

        {loadError && (
          <div className="card-light mb-6 flex items-center justify-between gap-4">
            <p className="font-mono text-xs text-error">{loadError}</p>
            <button onClick={loadAssets} className="font-mono text-xs text-accent hover:underline">
              Retry
            </button>
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="border border-border bg-white overflow-hidden">
                <div className="aspect-[4/3] bg-bg-alt loading-bar" />
                <div className="p-4 space-y-3">
                  <div className="h-3 bg-bg-alt w-3/4" />
                  <div className="h-3 bg-bg-alt w-1/2" />
                  <div className="h-px bg-border" />
                  <div className="h-6 bg-bg-alt w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredAssets.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredAssets.map((asset, i) => {
              const coverColor = getCoverColor(asset);
              const fileType = getExtension(asset.blobName);

              return (
                <motion.div
                  key={`${asset.creatorAddress}-${asset.transactionVersion}-${asset.eventIndex}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04, duration: 0.25 }}
                >
                  <Link href={`/file/${asset.creatorAddress}`} className="block group">
                    <div className="border border-border bg-white overflow-hidden hover:border-accent transition-all hover:shadow-lg">
                      <div
                        className="aspect-[4/3] relative overflow-hidden"
                        style={{ backgroundColor: coverColor }}
                      >
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-white/20 text-8xl font-black font-mono select-none">
                            {asset.name.charAt(0)}
                          </div>
                        </div>
                        <div
                          className="absolute inset-0 opacity-10"
                          style={{
                            backgroundImage:
                              "linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)",
                            backgroundSize: "20px 20px",
                          }}
                        />
                        <div className="absolute top-3 right-3">
                          <span className="bg-black/60 text-white font-mono text-xs px-2 py-1 backdrop-blur-sm">
                            {fileType}
                          </span>
                        </div>
                        <div className="absolute bottom-3 left-3">
                          <span className="bg-white/90 text-foreground font-mono text-xs px-2 py-1">
                            Aptos Testnet
                          </span>
                        </div>
                      </div>

                      <div className="p-4">
                        <h3 className="font-mono font-bold text-sm leading-tight mb-2 group-hover:text-accent transition-colors line-clamp-2">
                          {asset.name}
                        </h3>
                        <p className="font-mono text-xs text-text-muted mb-3 line-clamp-2 break-all">
                          {asset.blobName}
                        </p>

                        <div className="flex items-center gap-2 mb-3">
                          <div
                            className="w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold"
                            style={{ backgroundColor: coverColor }}
                          >
                            {asset.creatorAddress.slice(2, 3).toUpperCase()}
                          </div>
                          <span className="font-mono text-xs text-text-muted font-bold">
                            {shortenAddress(asset.creatorAddress, 4)}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 mb-3">
                          <div>
                            <div className="font-mono text-[10px] text-text-muted uppercase tracking-wider">
                              Size
                            </div>
                            <div className="font-mono text-xs font-bold">
                              {formatFileSize(asset.fileSize)}
                            </div>
                          </div>
                          <div>
                            <div className="font-mono text-[10px] text-text-muted uppercase tracking-wider">
                              Storage
                            </div>
                            <span className="font-mono text-xs font-bold text-accent">
                              Shelby
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t border-border">
                          <span
                            className="font-mono text-xs font-black px-2 py-1 text-white"
                            style={{ backgroundColor: "var(--accent)" }}
                          >
                            {formatAPT(asset.price)}
                          </span>
                          <span className="font-mono text-xs text-text-muted">
                            v{asset.transactionVersion}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="text-5xl mb-4 opacity-20">0</div>
            <h3 className="heading-brutal text-xl mb-2">NO LIVE LISTINGS</h3>
            <p className="font-mono text-xs text-text-muted mb-5">
              Upload from the dashboard, then refresh Explore after the transaction is indexed.
            </p>
            <Link href="/dashboard" className="btn-primary">
              Open Dashboard
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  );
}
