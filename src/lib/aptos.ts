// Mock data and Aptos utilities for the Geni MVP

export const CATEGORIES = [
  "All",
  "Design",
  "AI & ML",
  "Audio",
  "Software",
  "Education",
  "3D & Gaming",
] as const;

export type Category = (typeof CATEGORIES)[number];

export const MOCK_ASSETS = [
  {
    id: "demo-1",
    cid: "bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oamty3bojbk7ux",
    name: "Premium Design System Kit",
    price: 5.0,
    creator: "0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b",
    creatorName: "DesignLab",
    status: "active" as const,
    fileSize: "24.5 MB",
    fileType: "Figma Design",
    category: "Design" as Category,
    purchases: 12,
    rating: 4.8,
    reviews: 108,
    description: "Complete design system with 200+ components, dark/light themes, and auto-layout.",
    coverColor: "#6C5CE7",
    createdAt: "2025-03-10",
  },
  {
    id: "demo-2",
    cid: "bafybeihkoviema7g3gx7tswkwhdphbjvjhzxe72ygfpdoqbmlrhwbk5xsu",
    name: "GPT-4 Fine-Tuned Weights v3",
    price: 25.0,
    creator: "0x2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c",
    creatorName: "NeuralForge",
    status: "active" as const,
    fileSize: "1.2 GB",
    fileType: "Binary Model",
    category: "AI & ML" as Category,
    purchases: 3,
    rating: 4.2,
    reviews: 159,
    description: "Production-ready fine-tuned model weights for code generation tasks.",
    coverColor: "#00B894",
    createdAt: "2025-03-12",
  },
  {
    id: "demo-3",
    cid: "bafybeigm4cuezfhqnhgmpjfvxibhksikofuqoyalsqwswfuavbrgmr4y3e",
    name: "Exclusive Track - Ethereal Master",
    price: 2.5,
    creator: "0x3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d",
    creatorName: "SoundVault",
    status: "active" as const,
    fileSize: "48.2 MB",
    fileType: "Audio Master",
    category: "Audio" as Category,
    purchases: 47,
    rating: 5.0,
    reviews: 89,
    description: "Uncompressed WAV master, royalty-free for commercial use.",
    coverColor: "#E17055",
    createdAt: "2025-03-08",
  },
  {
    id: "demo-4",
    cid: "bafybeif7ztnhq33hrzh4xywnmqgp5fn5w3ckyrfhj2mxqr7hn6r5klzpy",
    name: "React Component Library Pro",
    price: 15.0,
    creator: "0x4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e",
    creatorName: "CodeCraft",
    status: "active" as const,
    fileSize: "8.3 MB",
    fileType: "Source Code",
    category: "Software" as Category,
    purchases: 89,
    rating: 4.6,
    reviews: 234,
    description: "50+ production-ready React components with TypeScript, tests, and Storybook.",
    coverColor: "#0984E3",
    createdAt: "2025-03-01",
  },
  {
    id: "demo-5",
    cid: "bafybeigxjv2o4jse4gfkhyqtmfopa5nqhe4jdgp7tmkqzwmhxbr4k5yzi",
    name: "Blockchain Development Masterclass",
    price: 8.0,
    creator: "0x5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f",
    creatorName: "Web3Academy",
    status: "active" as const,
    fileSize: "2.1 GB",
    fileType: "Video Course",
    category: "Education" as Category,
    purchases: 156,
    rating: 4.9,
    reviews: 312,
    description: "40-hour course covering Move, Solidity, and smart contract security.",
    coverColor: "#FDCB6E",
    createdAt: "2025-02-28",
  },
  {
    id: "demo-6",
    cid: "bafybeihwrd7lfbr6k4yt5m4ep5h3xrjnse7wqzkhi5jxq7lnhbz3c3vme",
    name: "Cyberpunk City 3D Asset Pack",
    price: 12.0,
    creator: "0x6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a",
    creatorName: "PolyMesh",
    status: "active" as const,
    fileSize: "340 MB",
    fileType: "3D Models",
    category: "3D & Gaming" as Category,
    purchases: 34,
    rating: 4.7,
    reviews: 67,
    description: "120+ low-poly cyberpunk buildings, vehicles, and props. Unity & Unreal ready.",
    coverColor: "#A29BFE",
    createdAt: "2025-03-05",
  },
  {
    id: "demo-7",
    cid: "bafybeid4ue6z5r7qm3xk4v8j2tn6pywhsdl7gfhjrk9e4wbv5mx",
    name: "Icon Pack — 2000 Minimal Icons",
    price: 3.0,
    creator: "0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b",
    creatorName: "DesignLab",
    status: "active" as const,
    fileSize: "15.7 MB",
    fileType: "SVG Bundle",
    category: "Design" as Category,
    purchases: 203,
    rating: 4.5,
    reviews: 178,
    description: "Pixel-perfect icons in 3 weights. Figma, Sketch, and SVG formats.",
    coverColor: "#636E72",
    createdAt: "2025-02-15",
  },
  {
    id: "demo-8",
    cid: "bafybeig7yrz2nqhj4x5wktmvep8f3lrnxhsjwz9q6k3bd4mtuy",
    name: "Lo-Fi Beat Pack Vol. 7",
    price: 1.5,
    creator: "0x3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d",
    creatorName: "SoundVault",
    status: "active" as const,
    fileSize: "120 MB",
    fileType: "Audio Bundle",
    category: "Audio" as Category,
    purchases: 512,
    rating: 4.8,
    reviews: 445,
    description: "25 handcrafted lo-fi beats. Stems included. Royalty-free.",
    coverColor: "#E84393",
    createdAt: "2025-03-14",
  },
  {
    id: "demo-9",
    cid: "bafybeihk3x5rzt8nlmq2j7v4wp9e6yfrnxhgsjwdz3qb8k4md",
    name: "Stable Diffusion LoRA — Anime v2",
    price: 7.5,
    creator: "0x2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c",
    creatorName: "NeuralForge",
    status: "active" as const,
    fileSize: "450 MB",
    fileType: "LoRA Weights",
    category: "AI & ML" as Category,
    purchases: 78,
    rating: 4.3,
    reviews: 92,
    description: "High-quality anime LoRA trained on 10K curated images. SDXL compatible.",
    coverColor: "#FF7675",
    createdAt: "2025-03-09",
  },
  {
    id: "demo-10",
    cid: "bafybeidr5zt8nqhm2j7xk4vwp8e3lfrnshgjwz9q6b3dk4mtu",
    name: "Next.js SaaS Starter Kit",
    price: 20.0,
    creator: "0x4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e",
    creatorName: "CodeCraft",
    status: "active" as const,
    fileSize: "12.4 MB",
    fileType: "Source Code",
    category: "Software" as Category,
    purchases: 67,
    rating: 4.9,
    reviews: 145,
    description: "Full-stack SaaS template with auth, billing, dashboards, and API routes.",
    coverColor: "#2D3436",
    createdAt: "2025-03-11",
  },
  {
    id: "demo-11",
    cid: "bafybeigx3v2o5jte4gfkhzqtmfopb6nqhe5jdgp8tmkqawmhxdr",
    name: "ZK-Proofs Explained — Video Series",
    price: 4.0,
    creator: "0x5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f",
    creatorName: "Web3Academy",
    status: "active" as const,
    fileSize: "890 MB",
    fileType: "Video Series",
    category: "Education" as Category,
    purchases: 45,
    rating: 4.7,
    reviews: 58,
    description: "12-part deep dive into zero-knowledge proofs, SNARKs, and STARKs.",
    coverColor: "#FD79A8",
    createdAt: "2025-03-07",
  },
  {
    id: "demo-12",
    cid: "bafybeihwte7lfbr6k5yz5m4ep6h4xrjnse8wqzkji6kxq8lnhcz",
    name: "Fantasy RPG Character Pack",
    price: 18.0,
    creator: "0x6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a",
    creatorName: "PolyMesh",
    status: "active" as const,
    fileSize: "780 MB",
    fileType: "3D Characters",
    category: "3D & Gaming" as Category,
    purchases: 23,
    rating: 4.4,
    reviews: 41,
    description: "20 rigged fantasy characters with PBR textures. Blender & FBX.",
    coverColor: "#00CEC9",
    createdAt: "2025-03-13",
  },
];

export type Asset = (typeof MOCK_ASSETS)[number];

export function truncateAddress(address: string): string {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function formatAPT(amount: number): string {
  return `${amount.toFixed(2)} APT`;
}

// Simulated on-chain transaction for demo
export async function simulatePurchase(
  assetId: string,
  _amount: number
): Promise<{ success: boolean; txHash: string }> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 2000));
  return {
    success: true,
    txHash: `0x${Array.from({ length: 64 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join("")}`,
  };
}

// Simulated Shelby upload
export async function simulateShelbyUpload(
  file: File
): Promise<{ cid: string }> {
  await new Promise((resolve) => setTimeout(resolve, 3000));
  const randomCid = `bafybei${Array.from({ length: 50 }, () =>
    "abcdefghijklmnopqrstuvwxyz234567"[Math.floor(Math.random() * 32)]
  ).join("")}`;
  console.log(`Uploaded ${file.name} to Shelby mesh`);
  return { cid: randomCid };
}

// Simulated Shelby download
export async function simulateShelbyDownload(
  cid: string
): Promise<{ blob: Blob; filename: string }> {
  await new Promise((resolve) => setTimeout(resolve, 2500));
  const asset = MOCK_ASSETS.find((a) => a.cid === cid);
  const mockContent = new Blob(
    [`[Shelby Mesh Reconstructed Content for CID: ${cid}]`],
    { type: "application/octet-stream" }
  );
  return { blob: mockContent, filename: asset?.name || "download.bin" };
}
