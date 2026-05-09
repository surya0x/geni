"use client";

import { AptosWalletAdapterProvider } from "@aptos-labs/wallet-adapter-react";
import { Network } from "@aptos-labs/ts-sdk";
import { PropsWithChildren } from "react";

export function WalletProvider({ children }: PropsWithChildren) {
  const aptosApiKey = process.env.NEXT_PUBLIC_APTOS_API_KEY;

  return (
    <AptosWalletAdapterProvider
      autoConnect={true}
      optInWallets={["Petra"]}
      dappConfig={{
        network: Network.TESTNET,
        ...(aptosApiKey
          ? {
              aptosApiKeys: {
                [Network.TESTNET]: aptosApiKey,
              },
            }
          : {}),
      }}
      onError={(error) => {
        console.log("Wallet connection error:", error);
      }}
    >
      {children}
    </AptosWalletAdapterProvider>
  );
}
