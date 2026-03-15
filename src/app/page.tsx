"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as const },
  }),
};

const features = [
  {
    title: "Shelby Mesh Storage",
    desc: "Files sharded across a decentralized hot-storage network. Sub-second retrieval. No centralized point of failure.",
    icon: "◈",
    span: "col-span-1 md:col-span-2",
  },
  {
    title: "Aptos Payments",
    desc: "Direct peer-to-peer APT transfers. No intermediary. No fees beyond gas.",
    icon: "⬡",
    span: "col-span-1",
  },
  {
    title: "One-Click Links",
    desc: "Share geni.link/your-file. Buyers see a blurred preview and pay to unlock instantly.",
    icon: "◉",
    span: "col-span-1",
  },
  {
    title: "Zero Backend",
    desc: "No servers. No databases. The blockchain IS the backend. Your data lives on the mesh.",
    icon: "▣",
    span: "col-span-1 md:col-span-2",
  },
];

const stats = [
  { value: "<1s", label: "Shelby Retrieval" },
  { value: "$0", label: "Infrastructure Cost" },
  { value: "100%", label: "On-Chain Logic" },
  { value: "∞", label: "File Types Supported" },
];

export default function Home() {
  return (
    <div>
      {/* ─── Hero ─── */}
      <section className="relative overflow-hidden">
        {/* Grid background */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(var(--text) 1px, transparent 1px), linear-gradient(90deg, var(--text) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        <div className="max-w-7xl mx-auto px-6 pt-24 pb-20 relative">
          <motion.div
            initial="hidden"
            animate="visible"
            className="text-center"
          >
            {/* System tag */}
            <motion.div
              custom={0}
              variants={fadeUp}
              className="inline-flex items-center gap-2 mb-8"
            >
              <span className="section-label">Protocol v0.1</span>
              <span className="w-1 h-1 rounded-full bg-accent inline-block" />
              <span className="section-label">Aptos Testnet</span>
            </motion.div>

            {/* Main heading */}
            <motion.h1
              custom={1}
              variants={fadeUp}
              className="heading-brutal text-6xl md:text-8xl lg:text-9xl mb-6"
            >
              UPLOAD.{" "}
              <span className="text-accent">PRICE.</span>
            </motion.h1>
            <motion.h1
              custom={2}
              variants={fadeUp}
              className="heading-brutal text-6xl md:text-8xl lg:text-9xl mb-10"
            >
              <span className="text-accent">SELL.</span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              custom={3}
              variants={fadeUp}
              className="font-mono text-sm md:text-base text-text-muted max-w-2xl mx-auto mb-10 leading-relaxed"
            >
              GENI is the{" "}
              <span className="text-foreground font-bold">
                deterministic asset vault
              </span>{" "}
              between your files and your buyers. Shelby mesh storage. Aptos
              on-chain payments. No backend. No middleman.
            </motion.p>

            {/* CTAs */}
            <motion.div
              custom={4}
              variants={fadeUp}
              className="flex flex-col sm:flex-row gap-3 justify-center"
            >
              <Link href="/dashboard" className="btn-primary">
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
                Start Uploading
              </Link>
              <Link href="/file/demo-1" className="btn-secondary">
                View Demo Link →
              </Link>
            </motion.div>
          </motion.div>

          {/* Decorative lines */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="mt-20 flex items-center gap-4"
          >
            <div className="flex-1 h-px bg-border" />
            <div className="flex items-center gap-6">
              <span className="w-2 h-2 rotate-45 border border-text-muted" />
              <span className="section-label">Fire-Fast Asset Vault</span>
              <span className="w-2 h-2 rotate-45 border border-text-muted" />
            </div>
            <div className="flex-1 h-px bg-border" />
          </motion.div>
        </div>
      </section>

      {/* ─── Bento Features ─── */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="flex items-center gap-4 mb-12">
          <span className="section-label">Core Architecture</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-border">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`card-dark ${f.span} p-8 group`}
            >
              <div className="text-3xl mb-4 opacity-40 group-hover:opacity-100 group-hover:text-accent transition-all">
                {f.icon}
              </div>
              <h3 className="font-mono font-bold text-sm uppercase tracking-wider mb-3">
                {f.title}
              </h3>
              <p className="font-mono text-xs text-gray-400 leading-relaxed">
                {f.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─── Stats ─── */}
      <section className="border-y border-border">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4">
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="stat-block border-r border-border last:border-r-0"
              >
                <div className="stat-value">{s.value}</div>
                <div className="stat-label">{s.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── How It Works ─── */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="flex items-center gap-4 mb-12">
          <span className="section-label">Transaction Flow</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            {
              step: "01",
              title: "Upload",
              desc: "Drag & drop your file. It's sharded and pushed to the Shelby mesh network.",
            },
            {
              step: "02",
              title: "Register",
              desc: "Set your price in APT. The CID and price are stored on-chain via our Move contract.",
            },
            {
              step: "03",
              title: "Share",
              desc: "Get a unique geni.link URL. Buyers see a blurred preview and your price.",
            },
            {
              step: "04",
              title: "Earn",
              desc: "Buyer pays APT directly to your wallet. File unlocks instantly from the mesh.",
            },
          ].map((item, i) => (
            <motion.div
              key={item.step}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="card-light group"
            >
              <div className="font-mono text-4xl font-black text-border group-hover:text-accent transition-colors mb-4">
                {item.step}
              </div>
              <h3 className="font-mono font-bold text-sm uppercase tracking-wider mb-2">
                {item.title}
              </h3>
              <p className="font-mono text-xs text-text-muted leading-relaxed">
                {item.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="bg-surface text-text-inverse">
        <div className="max-w-7xl mx-auto px-6 py-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <p className="section-label text-gray-500 mb-4">
              Ready to monetize your files?
            </p>
            <h2 className="heading-brutal text-4xl md:text-6xl mb-6">
              START <span className="text-accent">BUILDING</span>
            </h2>
            <p className="font-mono text-sm text-gray-400 max-w-md mx-auto mb-8">
              Connect your Aptos wallet. Upload to Shelby. Set your price.
              That&apos;s it.
            </p>
            <Link href="/dashboard" className="btn-primary">
              Launch Dashboard →
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
