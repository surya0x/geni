/**
 * On-chain interactions with the Geni vault.move contract
 * All purchases are direct wallet-to-wallet APT transfers recorded on Aptos testnet
 */

import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";
import type { InputTransactionData } from "@aptos-labs/wallet-adapter-react";

export const MODULE_ADDRESS =
  process.env.NEXT_PUBLIC_MODULE_ADDRESS ||
  "0x18b20a31641727e4ceff2cb7e412036867802585fb98227e63eede4e5ec8423c";
export const MODULE_NAME = "vault";

const aptos = new Aptos(
  new AptosConfig({ network: Network.TESTNET })
);

// ─── Types ────────────────────────────────────────────────────────
export interface OnChainAsset {
  blobName: string;   // Shelby blob name suffix
  name: string;       // Display name
  price: number;      // in Octas
  priceAPT: number;   // in APT
  fileSize: number;   // bytes
  creatorAddress: string;
}

export interface ListedOnChainAsset extends OnChainAsset {
  transactionVersion: number;
  eventIndex: number;
}

type ListTransactionRow = {
  sender: string;
  timestamp: string;
  version: number | string;
};

// ─── Read: Fetch asset metadata from chain ───────────────────────
export async function getOnChainAsset(
  creatorAddress: string
): Promise<OnChainAsset | null> {
  try {
    const result = await aptos.view({
      payload: {
        function: `${MODULE_ADDRESS}::${MODULE_NAME}::get_asset`,
        typeArguments: [],
        functionArguments: [creatorAddress],
      },
    });

    // Returns (blob_name, name, price, file_size)
    const [blobName, name, price, fileSize] = result as [string, string, string, string];
    return {
      blobName,
      name,
      price: Number(price),
      priceAPT: Number(price) / 1e8,
      fileSize: Number(fileSize),
      creatorAddress,
    };
  } catch (err) {
    console.error("getOnChainAsset error:", err);
    return null;
  }
}

export async function getListedAssets(limit = 50): Promise<ListedOnChainAsset[]> {
  try {
    const result = await aptos.queryIndexer<{ user_transactions: ListTransactionRow[] }>({
      query: {
        query: `
          query GeniListTransactions($where_condition: user_transactions_bool_exp, $limit: Int, $order_by: [user_transactions_order_by!]) {
            user_transactions(
              where: $where_condition
              limit: $limit
              order_by: $order_by
            ) {
              sender
              timestamp
              version
            }
          }
        `,
        variables: {
          where_condition: {
            entry_function_contract_address: { _eq: MODULE_ADDRESS },
            entry_function_module_name: { _eq: MODULE_NAME },
            entry_function_function_name: { _eq: "list_asset" },
          },
          limit,
          order_by: [
            { version: "desc" },
          ],
        },
      },
    });

    const rows = result.user_transactions ?? [];
    const assets = await Promise.all(
      rows.map(async (row, index): Promise<ListedOnChainAsset | null> => {
        const creatorAddress = row.sender;
        if (!creatorAddress) return null;

        const current = await getOnChainAsset(creatorAddress);
        if (!current) return null;

        return {
          ...current,
          creatorAddress: current.creatorAddress || creatorAddress,
          transactionVersion: Number(row.version),
          eventIndex: index,
        };
      })
    );

    const latestByCreator = new Map<string, ListedOnChainAsset>();
    assets.filter(Boolean).forEach((asset) => {
      const listedAsset = asset as ListedOnChainAsset;
      if (!latestByCreator.has(listedAsset.creatorAddress)) {
        latestByCreator.set(listedAsset.creatorAddress, listedAsset);
      }
    });

    return Array.from(latestByCreator.values());
  } catch (err) {
    console.error("getListedAssets error:", err);
    return [];
  }
}

// ─── Write: List an asset on-chain ──────────────────────────────
export function buildListAssetTx(
  blobName: string,
  name: string,
  priceAPT: number,
  fileSizeBytes: number
): InputTransactionData {
  const priceOctas = Math.floor(priceAPT * 1e8);
  return {
    data: {
      function: `${MODULE_ADDRESS}::${MODULE_NAME}::list_asset`,
      typeArguments: [],
      functionArguments: [blobName, name, priceOctas, fileSizeBytes],
    },
  };
}

// ─── Write: Purchase an asset on-chain ───────────────────────────
export function buildPurchaseTx(
  creatorAddress: string,
  priceOctas: number
): InputTransactionData {
  return {
    data: {
      function: `${MODULE_ADDRESS}::${MODULE_NAME}::purchase`,
      typeArguments: [],
      functionArguments: [creatorAddress, priceOctas],
    },
  };
}

// ─── Helpers ──────────────────────────────────────────────────────
export function formatAPT(octas: number): string {
  return `${(octas / 1e8).toFixed(2)} APT`;
}

export function shortenAddress(addr: string, chars = 6): string {
  if (!addr) return "";
  return `${addr.slice(0, chars + 2)}...${addr.slice(-chars)}`;
}

export function getAptosTxUrl(hash: string): string {
  return `https://explorer.aptoslabs.com/txn/${hash}?network=testnet`;
}
