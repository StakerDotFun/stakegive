"use client";

import { ReactNode, useEffect, useState } from "react";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-phantom";
import { SolflareWalletAdapter } from "@solana/wallet-adapter-solflare";
import { clusterApiUrl, Cluster } from "@solana/web3.js";
import "@solana/wallet-adapter-react-ui/styles.css";

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  const [mounted, setMounted] = useState(false);
  const [walletError, setWalletError] = useState<string>("");
  // Use env variable for endpoint, fallback to devnet
  const endpoint =
    process.env.NEXT_PUBLIC_SOLANA_RPC_HOST ||
    clusterApiUrl((process.env.NEXT_PUBLIC_SOLANA_NETWORK as Cluster) || "devnet");

  useEffect(() => {
    setMounted(true);
    
    // Check if any Solana wallet is available
    const checkWalletAvailability = () => {
      const hasPhantom = 'phantom' in window;
      const hasSolflare = 'solflare' in window;
      
      if (!hasPhantom && !hasSolflare) {
        setWalletError("Please connect your wallet before moving ahead");
      }
    };
    
    checkWalletAvailability();
  }, []);

  // Configure supported wallets - only use stable, supported adapters
  const wallets = [
    new PhantomWalletAdapter(),
    //new SolflareWalletAdapter(),
  ];

  // Don't render anything until client-side
  if (!mounted) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br bg-gray-800 dark:from-black dark:via-indigo-700 dark:to-gray-800 animate-gradient-x px-4">
      {/* Logo */}
      <img
        src="/logo-removed-bg.png" // Replace with your actual logo path
        alt="Logo"
        className="w-24 h-24 mb-8 drop-shadow-xl"
      />

      {/* Loading Bar Container */}
      <div className="w-64 h-2 bg-white/30 rounded-full overflow-hidden shadow-inner">
        <div className="h-full bg-white rounded-full animate-loading-bar" />
      </div>
    </div>
  );
}

  return (
    <ConnectionProvider endpoint={"http://localhost:8899"}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          {children}
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}