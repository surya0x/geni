"use client";

import { ShelbyClient } from "@shelby-protocol/sdk/browser";
import {
  type BlobCommitments,
  createDefaultErasureCodingProvider,
  generateCommitments,
  expectedTotalChunksets,
  ShelbyBlobClient,
} from "@shelby-protocol/sdk/browser";
import { Network, Aptos, AptosConfig, AccountAddress } from "@aptos-labs/ts-sdk";
import type { InputTransactionData } from "@aptos-labs/wallet-adapter-react";

// ─── Shelby Client Singleton ──────────────────────────────────────
const API_KEY = process.env.NEXT_PUBLIC_SHELBY_API_KEY;

let _shelbyClient: ShelbyClient | null = null;

export function getShelbyClient(): ShelbyClient {
  if (!_shelbyClient) {
    if (!API_KEY) {
      throw new Error("NEXT_PUBLIC_SHELBY_API_KEY is not set in .env.local");
    }
    _shelbyClient = new ShelbyClient({
      network: Network.TESTNET,
      apiKey: API_KEY,
    });
  }
  return _shelbyClient;
}

// ─── Aptos Client ──────────────────────────────────────────────────
export const aptosClient = new Aptos(
  new AptosConfig({
    network: Network.TESTNET,
    clientConfig: {
      API_KEY: API_KEY,
    },
  })
);

// ─── Step 1: Encode File ───────────────────────────────────────────
export async function encodeFile(file: File): Promise<BlobCommitments> {
  // Use Uint8Array directly — browser-compatible (no Node.js Buffer)
  const data = new Uint8Array(await file.arrayBuffer());
  const provider = await createDefaultErasureCodingProvider();
  const commitments = await generateCommitments(provider, data);
  return commitments;
}

// ─── Step 2: Register Blob On-Chain ────────────────────────────────
export function createRegisterPayload(
  accountAddress: string,
  fileName: string,
  commitments: BlobCommitments
): InputTransactionData {
  // expirationMicros: 30 days from now in microseconds (use integer math)
  const nowMs = Date.now();
  const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
  const expirationMicros = (nowMs + thirtyDaysMs) * 1000;

  const payload = ShelbyBlobClient.createRegisterBlobPayload({
    account: AccountAddress.from(accountAddress),
    blobName: fileName,
    blobMerkleRoot: commitments.blob_merkle_root,
    numChunksets: expectedTotalChunksets(commitments.raw_data_size),
    expirationMicros,
    blobSize: commitments.raw_data_size,
    encoding: 0, // Clay encoding (required by contract)
  });

  return { data: payload } as InputTransactionData;
}

// ─── Step 3: Upload to Shelby RPC ──────────────────────────────────
export async function uploadToShelby(
  accountAddress: string,
  fileName: string,
  file: File
): Promise<void> {
  const client = getShelbyClient();
  await client.rpc.putBlob({
    account: accountAddress,
    blobName: fileName,
    blobData: new Uint8Array(await file.arrayBuffer()),
  });
}

// ─── Full Upload Flow (3-step) ─────────────────────────────────────
export interface UploadProgress {
  step: "encoding" | "registering" | "uploading" | "done" | "error";
  message: string;
}

export async function shelbyUpload(
  file: File,
  accountAddress: string,
  signAndSubmitTransaction: (tx: InputTransactionData) => Promise<{ hash: string }>,
  onProgress?: (progress: UploadProgress) => void
): Promise<{ blobName: string; merkleRoot: string; txHash: string }> {
  try {
    // Step 1: Encode
    onProgress?.({ step: "encoding", message: "Encoding file with erasure coding..." });
    const commitments = await encodeFile(file);

    // Step 2: Register on-chain
    onProgress?.({ step: "registering", message: "Registering blob on Aptos..." });
    const payload = createRegisterPayload(accountAddress, file.name, commitments);
    const txResult = await signAndSubmitTransaction(payload);
    await aptosClient.waitForTransaction({ transactionHash: txResult.hash });

    // Step 3: Upload to Shelby RPC
    onProgress?.({ step: "uploading", message: "Uploading to Shelby mesh..." });
    await uploadToShelby(accountAddress, file.name, file);

    onProgress?.({ step: "done", message: "File stored on Shelby network!" });

    return {
      blobName: file.name,
      merkleRoot: commitments.blob_merkle_root,
      txHash: txResult.hash,
    };
  } catch (error) {
    onProgress?.({
      step: "error",
      message: error instanceof Error ? error.message : "Upload failed",
    });
    throw error;
  }
}

// ─── Download from Shelby ──────────────────────────────────────────
export function getShelbyDownloadUrl(
  accountAddress: string,
  blobName: string
): string {
  return `https://api.testnet.shelby.xyz/shelby/v1/blobs/${accountAddress}/${blobName}`;
}

export async function shelbyDownload(
  accountAddress: string,
  blobName: string
): Promise<{ blob: Blob; filename: string }> {
  const url = getShelbyDownloadUrl(accountAddress, blobName);
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Download failed: ${response.status} ${response.statusText}`);
  }

  const blob = await response.blob();
  return { blob, filename: blobName };
}

// ─── Get Account's Files ───────────────────────────────────────────
export async function getAccountBlobs(accountAddress: string) {
  const client = getShelbyClient();
  const blobs = await client.coordination.getAccountBlobs({
    account: AccountAddress.from(accountAddress),
  });
  // Filter out deleted blobs
  return blobs.filter((b) => !b.isDeleted);
}

// ─── Explorer URL Builders ─────────────────────────────────────────
const SHELBY_EXPLORER = "https://explorer.shelby.xyz/testnet";
const APTOS_EXPLORER = "https://explorer.aptoslabs.com";

/** Link to a blob on Shelby Explorer */
export function getShelbyBlobExplorerUrl(
  accountAddress: string,
  blobName: string
): string {
  return `${SHELBY_EXPLORER}/blobs/${accountAddress}?blobName=${encodeURIComponent(blobName)}`;
}

/** Link to an account's blobs on Shelby Explorer */
export function getShelbyAccountExplorerUrl(
  accountAddress: string
): string {
  return `${SHELBY_EXPLORER}/account/${accountAddress}/blobs`;
}

/** Link to Aptos transaction on Aptos Explorer */
export function getAptosTxExplorerUrl(txHash: string): string {
  return `${APTOS_EXPLORER}/txn/${txHash}?network=testnet`;
}

/** Truncate hash for display */
export function truncateHash(hash: string, chars = 6): string {
  if (!hash || hash.length <= chars * 2 + 3) return hash;
  return `${hash.slice(0, chars)}...${hash.slice(-chars)}`;
}
