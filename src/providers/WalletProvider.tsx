"use client";

import { AptosWalletAdapterProvider } from "@aptos-labs/wallet-adapter-react";
import { Network } from "@aptos-labs/ts-sdk";
import { PropsWithChildren } from "react";

export function WalletProvider({ children }: PropsWithChildren) {
  return (
    <AptosWalletAdapterProvider
      autoConnect={true}
      optInWallets={["Petra"]}
      dappConfig={{
        network: Network.TESTNET,
      }}
    >
      {children}
    </AptosWalletAdapterProvider>
  );
}
