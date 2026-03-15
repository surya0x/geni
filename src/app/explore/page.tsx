"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { MOCK_ASSETS, CATEGORIES, formatAPT } from "@/lib/aptos";
import type { Category } from "@/lib/aptos";

type SortOption = "popular" | "newest" | "price-low" | "price-high" | "rating";

export default function ExplorePage() {
  const [activeCategory, setActiveCategory] = useState<Category>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("popular");

  const filteredAssets = useMemo(() => {
    let filtered = MOCK_ASSETS.filter((a) => a.status === "active");

    // Category filter
    if (activeCategory !== "All") {
      filtered = filtered.filter((a) => a.category === activeCategory);
    }

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          a.creatorName.toLowerCase().includes(q) ||
          a.fileType.toLowerCase().includes(q) ||
          a.description.toLowerCase().includes(q)
      );
    }

    // Sort
    switch (sortBy) {
      case "popular":
        filtered.sort((a, b) => b.purchases - a.purchases);
        break;
      case "newest":
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case "price-low":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        filtered.sort((a, b) => b.rating - a.rating);
        break;
    }

    return filtered;
  }, [activeCategory, searchQuery, sortBy]);

  return (
    <div className="min-h-screen">
      {/* Search Header */}
      <div className="border-b border-border bg-white">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            {/* Logo area */}
            <motion.h1
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="heading-brutal text-2xl shrink-0"
            >
              EXPLORE
            </motion.h1>

            {/* Search bar */}
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
                  placeholder="Search products..."
                  className="input-brutalist pl-10"
                />
              </div>
            </motion.div>

            {/* Sort dropdown */}
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="shrink-0"
            >
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="input-brutalist text-xs uppercase tracking-wider cursor-pointer"
                style={{ width: "auto", paddingRight: "2rem" }}
              >
                <option value="popular">Most Popular</option>
                <option value="newest">Newest</option>
                <option value="price-low">Price: Low → High</option>
                <option value="price-high">Price: High → Low</option>
                <option value="rating">Top Rated</option>
              </select>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="border-b border-border bg-white sticky top-14 z-40">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center gap-1 overflow-x-auto py-3 -mb-px">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`
                  font-mono text-xs uppercase tracking-wider px-4 py-2 
                  border-b-2 transition-all whitespace-nowrap
                  ${
                    activeCategory === cat
                      ? "border-accent text-accent font-bold"
                      : "border-transparent text-text-muted hover:text-foreground hover:border-border"
                  }
                `}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Results header */}
        <div className="flex items-center justify-between mb-6">
          <span className="section-label">
            {filteredAssets.length} product{filteredAssets.length !== 1 ? "s" : ""}
            {activeCategory !== "All" ? ` in ${activeCategory}` : ""}
          </span>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="font-mono text-xs text-accent hover:underline"
            >
              Clear search ✕
            </button>
          )}
        </div>

        {/* Product Grid */}
        {filteredAssets.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredAssets.map((asset, i) => (
              <motion.div
                key={asset.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.3 }}
              >
                <Link href={`/file/${asset.id}`} className="block group">
                  <div className="border border-border bg-white overflow-hidden hover:border-accent transition-all hover:shadow-lg">
                    {/* Cover */}
                    <div
                      className="aspect-[4/3] relative overflow-hidden"
                      style={{ backgroundColor: asset.coverColor }}
                    >
                      {/* Decorative pattern */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-white/20 text-8xl font-black font-mono select-none">
                          {asset.name.charAt(0)}
                        </div>
                      </div>
                      {/* Grid overlay */}
                      <div
                        className="absolute inset-0 opacity-10"
                        style={{
                          backgroundImage:
                            "linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)",
                          backgroundSize: "20px 20px",
                        }}
                      />
                      {/* File type badge */}
                      <div className="absolute top-3 right-3">
                        <span className="bg-black/60 text-white font-mono text-xs px-2 py-1 backdrop-blur-sm">
                          {asset.fileType}
                        </span>
                      </div>
                    </div>

                    {/* Info */}
                    <div className="p-4">
                      <h3 className="font-mono font-bold text-sm leading-tight mb-2 group-hover:text-accent transition-colors line-clamp-2">
                        {asset.name}
                      </h3>
                      <p className="font-mono text-xs text-text-muted mb-3 line-clamp-2">
                        {asset.description}
                      </p>

                      {/* Creator */}
                      <div className="flex items-center gap-2 mb-3">
                        <div
                          className="w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold"
                          style={{ backgroundColor: asset.coverColor }}
                        >
                          {asset.creatorName.charAt(0)}
                        </div>
                        <span className="font-mono text-xs text-text-muted font-bold">
                          {asset.creatorName}
                        </span>
                      </div>

                      {/* Bottom row */}
                      <div className="flex items-center justify-between pt-3 border-t border-border">
                        <span
                          className="font-mono text-xs font-black px-2 py-1 text-white"
                          style={{ backgroundColor: "var(--accent)" }}
                        >
                          {formatAPT(asset.price)}
                        </span>
                        <div className="flex items-center gap-1">
                          <span className="text-yellow-500 text-xs">★</span>
                          <span className="font-mono text-xs font-bold">
                            {asset.rating}
                          </span>
                          <span className="font-mono text-xs text-text-muted">
                            ({asset.reviews})
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="text-5xl mb-4 opacity-20">∅</div>
            <h3 className="heading-brutal text-xl mb-2">NO RESULTS</h3>
            <p className="font-mono text-xs text-text-muted">
              Try a different search or category
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
