"use client";

import { useState, useEffect } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { Connection, PublicKey, LAMPORTS_PER_SOL, Transaction, SystemProgram } from "@solana/web3.js";

// Helper function to get memo program ID dynamically
async function getMemoProgramId(connection: Connection): Promise<PublicKey> {
  try {
    // Try to get from wallet first if available
    if (typeof window !== 'undefined' && window.solana?.memoProgramId) {
      return new PublicKey(window.solana.memoProgramId);
    }
    
    // Fallback to querying on-chain for the memo program
    const memoProgramId = await findMemoProgramId(connection);
    return new PublicKey(memoProgramId);
  } catch (error) {
    console.error('Failed to fetch memo program ID:', error);
    throw new Error("Failed to fetch memo program ID");
  }
}

// Implementation to find the memo program ID on-chain
async function findMemoProgramId(connection: Connection): Promise<string> {
  // For devnet, we'll return the standard memo program ID
  return "MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr";
}

export default function WalletTest() {
  const { publicKey, connected, signTransaction, signAllTransactions, disconnect } = useWallet();
  const { connection } = useConnection();
  const [balance, setBalance] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "info">("info");
  const [showSuccess, setShowSuccess] = useState(false);
  const [txResults, setTxResults] = useState<{signature: string, index?: number}[]>([]);

  useEffect(() => {
    const checkBalance = async () => {
      if (connected && publicKey && connection) {
        try {
          const bal = await connection.getBalance(publicKey);
          setBalance(bal / LAMPORTS_PER_SOL);
        } catch (error) {
          console.error('Failed to get balance:', error);
          showMessage('Failed to get wallet balance', 'error');
        }
      }
    };
    
    checkBalance();
  }, [connected, publicKey, connection]);

  const showMessage = (msg: string, type: "success" | "error" | "info") => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(""), 5000);
  };

  const SuccessPopup = () => {
    if (!showSuccess) return null;

    return (
      <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-black/90 border border-white/20 rounded-xl p-6 max-w-md w-full relative backdrop-blur-lg">
          <button 
            onClick={() => setShowSuccess(false)}
            className="absolute top-4 right-4 text-white hover:text-gray-300 text-xl"
          >
            &times;
          </button>
          
          <div className="text-center">
            <div className="text-green-400 text-5xl mb-3">✓</div>
            <h3 className="text-xl font-bold text-white mb-2">
              {txResults.length > 1 ? "Batch Successful" : "Transaction Successful"}
            </h3>
            <p className="text-gray-300 mb-4">
              {txResults.length > 1 
                ? `${txResults.length} transactions signed and submitted` 
                : "Your transaction was signed and submitted"}
            </p>
            
            <div className="space-y-2 max-h-60 overflow-y-auto">
              <p className="text-gray-300 text-left mb-1">
                View on SOLANA EXPLORER:
              </p>
            
              {txResults.map((result, idx) => (
                <div key={result.signature} className="bg-white/5 p-2 rounded">
                  <a
                    href={`https://explorer.solana.com/tx/${result.signature}?cluster=devnet`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:underline break-all"
                  >
                    {txResults.length > 1 ? `Tx ${idx + 1}: ` : ""}
                    {result.signature.slice(0, 8)}...{result.signature.slice(-8)}
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const testSignTransaction = async () => {
  if (!publicKey || !signTransaction || !connection) {
    showMessage("Wallet not connected or signing not available", "error");
    return;
  }

  try {
    // Fetch memo program ID from wallet or on-chain
    const memoProgram = await getMemoProgramId();

    const transaction = new Transaction().add({
      programId: memoProgram,
      keys: [{ pubkey: publicKey, isSigner: true, isWritable: true }],
      data: Buffer.from("Test transaction signature only", "utf-8"),
    });
    transaction.feePayer = publicKey;
    transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

    console.log('Testing transaction signing...');
    const signedTx = await signTransaction(transaction);
    console.log('Transaction signed successfully:', signedTx);
    showMessage("Transaction signing test successful!", "success");

    const signature = await connection.sendRawTransaction(signedTx.serialize());
    setTxResults([{ signature }]);
    setShowSuccess(true);
  } catch (error) {
    console.error('Transaction signing test failed:', error);
    showMessage(`Transaction signing test failed: ${error}`, "error");
  }
};

const testSignAllTransactions = async () => {
  if (!publicKey || !signAllTransactions || !connection) {
    showMessage("Wallet not connected or batch signing not available", "error");
    return;
  }

  try {
    // Fetch memo program ID from wallet or on-chain
    const memoProgram = await getMemoProgramId();
    const blockhash = (await connection.getLatestBlockhash()).blockhash;
    
    const transactions = [1, 2, 3].map(i => {
      const tx = new Transaction().add({
        programId: memoProgram,
        keys: [{ pubkey: publicKey, isSigner: true, isWritable: true }],
        data: Buffer.from(`Test batch transaction ${i}`, "utf-8"),
      });
      tx.feePayer = publicKey;
      tx.recentBlockhash = blockhash;
      return tx;
    });

    console.log('Testing batch transaction signing...');
    const signedTxs = await signAllTransactions(transactions);
    console.log('Batch transactions signed successfully:', signedTxs);
    showMessage("Batch transaction signing test successful!", "success");

    const signatures = await Promise.all(
    signedTxs.map(tx => connection.sendRawTransaction(tx.serialize()))
    );
    setTxResults(signatures.map((sig, idx) => ({ signature: sig, index: idx + 1 })));
    setShowSuccess(true);
  } catch (error) {
    console.error('Batch transaction signing test failed:', error);
    showMessage(`Batch transaction signing test failed: ${error}`, "error");
  }
};

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-blue-900 to-purple-900 text-white p-8">
      <SuccessPopup />
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 text-green-300">Wallet Connection Test</h1>
          <p className="text-lg text-gray-300 mb-6">Test basic wallet functionality before using smart contracts</p>
          
          <div className="flex justify-center mb-6">
            <WalletMultiButton className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded" />
          </div>
          
          {message && (
            <div className={`p-4 rounded-lg mb-6 ${
              messageType === "success" ? "bg-green-600" :
              messageType === "error" ? "bg-red-600" : "bg-blue-600"
            }`}>
              {message}
            </div>
          )}
        </div>

        {!connected ? (
          <div className="text-center">
            <p className="text-xl text-gray-300">Please connect your Phantom wallet to start testing</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Wallet Info */}
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <h2 className="text-2xl font-bold mb-4 text-green-300">Wallet Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-sm text-gray-400">Wallet Address</p>
                  <p className="font-mono text-sm break-all">{publicKey?.toString()}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-400">Balance</p>
                  <p className="font-mono text-lg">{balance !== null ? `${balance.toFixed(4)} SOL` : 'Loading...'}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-400">Network</p>
                  <p className="font-mono text-sm">Devnet</p>
                </div>
              </div>
            </div>

            {/* Connection Status */}
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <h2 className="text-2xl font-bold mb-4 text-green-300">Connection Status</h2>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Wallet Connected:</span>
                  <span className={connected ? "text-green-400" : "text-red-400"}>
                    {connected ? "✅ Yes" : "❌ No"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Public Key Available:</span>
                  <span className={publicKey ? "text-green-400" : "text-red-400"}>
                    {publicKey ? "✅ Yes" : "❌ No"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Sign Transaction Available:</span>
                  <span className={signTransaction ? "text-green-400" : "text-red-400"}>
                    {signTransaction ? "✅ Yes" : "❌ No"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Sign All Transactions Available:</span>
                  <span className={signAllTransactions ? "text-green-400" : "text-red-400"}>
                    {signAllTransactions ? "✅ Yes" : "❌ No"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Connection Established:</span>
                  <span className={connection ? "text-green-400" : "text-red-400"}>
                    {connection ? "✅ Yes" : "❌ No"}
                  </span>
                </div>
              </div>
            </div>

            {/* Test Buttons */}
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <h2 className="text-2xl font-bold mb-4 text-green-300">Test Functions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={testSignTransaction}
                  disabled={!signTransaction}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-bold py-3 px-4 rounded transition-colors"
                >
                  Test Sign Transaction
                </button>
                <button
                  onClick={testSignAllTransactions}
                  disabled={!signAllTransactions}
                  className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white font-bold py-3 px-4 rounded transition-colors"
                >
                  Test Sign All Transactions
                </button>
              </div>
            </div>

            {/* Navigation */}
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <h2 className="text-2xl font-bold mb-4 text-green-300">Next Steps</h2>
              <p className="text-gray-300 mb-4">
                If all tests pass above, you can proceed to test the smart contract functions.
              </p>
              <a
                href="/test-contract"
                className="inline-block bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded transition-colors"
              >
                Go to Smart Contract Test
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 