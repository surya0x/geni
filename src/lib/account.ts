import {
  Aptos,
  AptosConfig,
  Network,
  TransactionResponseType,
  type TransactionResponse,
} from "@aptos-labs/ts-sdk";
import { getAptosTxUrl } from "@/lib/contract";

const aptos = new Aptos(new AptosConfig({ network: Network.TESTNET }));

export interface WalletAccountTransaction {
  hash: string;
  label: string;
  success: boolean;
  timestamp: string;
  url: string;
  version: string;
}

export interface WalletAccountSummary {
  balanceOctas: number;
  transactions: WalletAccountTransaction[];
}

async function getRecentAccountTransactions(accountAddress: string) {
  try {
    const count = await aptos.getAccountTransactionsCount({ accountAddress });
    const offset = Math.max(Number(count) - 5, 0);
    return aptos.getAccountTransactions({
      accountAddress,
      options: { limit: 5, offset },
    });
  } catch {
    return aptos.getAccountTransactions({
      accountAddress,
      options: { limit: 5 },
    });
  }
}

function getTransactionLabel(transaction: TransactionResponse): string {
  if (
    transaction.type === TransactionResponseType.User &&
    "payload" in transaction &&
    transaction.payload.type === "entry_function_payload" &&
    "function" in transaction.payload
  ) {
    return transaction.payload.function.split("::").slice(-2).join("::");
  }

  return transaction.type.replace(/_/g, " ");
}

export async function getWalletAccountSummary(
  accountAddress: string
): Promise<WalletAccountSummary> {
  const [balanceResult, transactionsResult] = await Promise.allSettled([
    aptos.getAccountAPTAmount({ accountAddress }),
    getRecentAccountTransactions(accountAddress),
  ]);

  const balanceOctas =
    balanceResult.status === "fulfilled" ? balanceResult.value : 0;
  const transactions =
    transactionsResult.status === "fulfilled" ? transactionsResult.value : [];

  return {
    balanceOctas,
    transactions: transactions
      .slice()
      .reverse()
      .map((transaction) => ({
        hash: "hash" in transaction ? transaction.hash : "",
        label: getTransactionLabel(transaction),
        success: "success" in transaction ? transaction.success : true,
        timestamp: "timestamp" in transaction ? transaction.timestamp : "",
        url: "hash" in transaction ? getAptosTxUrl(transaction.hash) : "#",
        version: "version" in transaction ? transaction.version : "",
      })),
  };
}
