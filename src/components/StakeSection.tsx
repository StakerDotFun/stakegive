"use client";

import { useState, useEffect } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { Transaction, PublicKey } from "@solana/web3.js";
import { LST } from "../types";
import toast from "react-hot-toast";
import { lstApi, transactionApi } from "../lib/api";
import { useRouter } from "next/navigation";

interface StakeSectionProps {
  lst: LST;
}

interface OnchainLST {
  mint: string;
  name: string;
  symbol: string;
  apy: number;
  balance?: number;
  isUserHolding?: boolean;
}

interface NGOLSTOption {
  lstData: any;
  mint: string;
  name: string;
  symbol: string;
  ngoName: string;
  isCurrentNGO?: boolean;
}

export default function StakeSection({ lst }: StakeSectionProps) {
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [lockPercentage, setLockPercentage] = useState<number>(0);
  const [donatePercentage, setDonatePercentage] = useState<number>(0);
  const [loadingBalance, setLoadingBalance] = useState(false);
  const router = useRouter();

  const { connected, publicKey, signTransaction } = useWallet();
  const { connection } = useConnection();

  const [activeTab, setActiveTab] = useState<"lock" | "donate">("lock");
  const [lockAmount, setLockAmount] = useState<string>("");
  const [lockingPeriod, setLockingPeriod] = useState<string>("1");
  const [yieldPercentage, setYieldPercentage] = useState<string>("10");
  const [selectedLST, setSelectedLST] = useState<string>("");
  const [onchainLSTs, setOnchainLSTs] = useState<OnchainLST[]>([]);
  const [donateAmount, setDonateAmount] = useState<string>("");
  const [selectedNGOLST, setSelectedNGOLST] = useState<string>("");
  const [ngoLSTOptions, setNgoLSTOptions] = useState<NGOLSTOption[]>([]);
  const [isLocking, setIsLocking] = useState(false);
  const [isDonating, setIsDonating] = useState(false);
  const [loadingLSTs, setLoadingLSTs] = useState(false);
  const [loadingNGOLSTs, setLoadingNGOLSTs] = useState(false);

  // Add this missing function for donate percentage updates
  const updateDonateAmountFromPercentage = (percentage: number) => {
    const amount = ((walletBalance * percentage) / 100).toFixed(4);
    setDonateAmount(amount);
    setDonatePercentage(percentage);
  };

  // Add this function to get balance based on selected LST
  const getAvailableBalance = () => {
    if (!selectedLST) {
      return { balance: walletBalance, symbol: "SOL" };
    }

    const selectedLSTData = getSelectedLSTDetails();
    if (selectedLSTData && selectedLSTData.isUserHolding) {
      return {
        balance: selectedLSTData.balance || 0,
        symbol: selectedLSTData.symbol,
      };
    }

    return { balance: walletBalance, symbol: "SOL" };
  };

  // Update the lock amount calculation function
  const updateLockAmountFromPercentage = (percentage: number) => {
    const { balance } = getAvailableBalance();
    const amount = ((balance * percentage) / 100).toFixed(4);
    setLockAmount(amount);
    setLockPercentage(percentage);
  };

  // Fetch wallet balance
  const fetchWalletBalance = async () => {
    if (!connected || !publicKey) return;

    setLoadingBalance(true);
    try {
      const balance = await connection.getBalance(publicKey);
      const solBalance = balance / 1000000000;
      setWalletBalance(solBalance);
    } catch (error) {
      console.error("Error fetching wallet balance:", error);
      toast.error("Failed to fetch wallet balance");
    } finally {
      setLoadingBalance(false);
    }
  };

  useEffect(() => {
    if (connected && publicKey) {
      fetchOnchainLSTs();
      fetchNGOLSTOptions();
      fetchWalletBalance();
    }
  }, [connected, publicKey]);

  // Add this useEffect to reset percentage when LST changes
  useEffect(() => {
    if (selectedLST) {
      // Reset percentage and amount when LST changes
      setLockPercentage(0);
      setLockAmount("");
    }
  }, [selectedLST]);

  // Add this useEffect to sync percentage buttons with manual input
  useEffect(() => {
    if (donateAmount && walletBalance > 0) {
      const percentage = (parseFloat(donateAmount) / walletBalance) * 100;
      if (percentage <= 100) {
        // Find the closest percentage button or set to 0 if it doesn't match
        const closePercentages = [25, 50, 75, 100];
        const closest = closePercentages.find(
          (p) => Math.abs(p - percentage) < 1
        );
        setDonatePercentage(closest || 0);
      }
    }
  }, [donateAmount, walletBalance]);

  // Similar for lock amount
  useEffect(() => {
    if (lockAmount && selectedLST) {
      const { balance } = getAvailableBalance();
      if (balance > 0) {
        const percentage = (parseFloat(lockAmount) / balance) * 100;
        if (percentage <= 100) {
          const closePercentages = [25, 50, 75, 100];
          const closest = closePercentages.find(
            (p) => Math.abs(p - percentage) < 1
          );
          setLockPercentage(closest || 0);
        }
      }
    }
  }, [lockAmount, selectedLST]);

  // Reset percentages when switching tabs
  useEffect(() => {
    if (activeTab === "lock") {
      setDonatePercentage(0);
    } else if (activeTab === "donate") {
      setLockPercentage(0);
    }
  }, [activeTab]);

  const fetchOnchainLSTs = async () => {
    setLoadingLSTs(true);
    try {
      const userHoldings: OnchainLST[] = [
        {
          mint: "J1toso1uCk3RLmjorhTtrVwY9HJ7X8V9yYac6Y7kGCPn",
          name: "Jito Staked SOL",
          symbol: "JSOL",
          apy: 8.5,
          balance: 5.25,
          isUserHolding: true,
        },
        {
          mint: "mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So",
          name: "Marinade Staked SOL",
          symbol: "MSOL",
          apy: 7.8,
          balance: 2.5,
          isUserHolding: true,
        },
        {
          mint: "bSoLi5K3z3KZK7ytfqcJm7SozYCxHdYgdzU16g5QSh3",
          name: "SolBlaze Staked SOL",
          symbol: "BSOL",
          apy: 7.2,
          balance: 3.75,
          isUserHolding: true,
        },
      ];

      const allLSTs: OnchainLST[] = [
        ...userHoldings,
        {
          mint: "bSo13r4TkiE4KumL71LsHTPpL2euBYLFx6h9HP3piy1",
          name: "Blaze Staked SOL",
          symbol: "BSOL",
          apy: 9.2,
          isUserHolding: false,
        },
        {
          mint: "st4k3Sol1234567890abcdefghijklmnopqrstuvwxyz",
          name: "Stake Pool SOL",
          symbol: "STSOL",
          apy: 8.0,
          isUserHolding: false,
        },
      ];

      const sortedLSTs = allLSTs.sort((a, b) => {
        if (a.isUserHolding && !b.isUserHolding) return -1;
        if (!a.isUserHolding && b.isUserHolding) return 1;
        return 0;
      });

      setOnchainLSTs(sortedLSTs);
    } catch (error) {
      console.error("Error fetching onchain LSTs:", error);
      toast.error("Failed to load LST options");
    } finally {
      setLoadingLSTs(false);
    }
  };

  const fetchNGOLSTOptions = async () => {
    setLoadingNGOLSTs(true);
    try {
      console.log(
        "🔍 Fetching NGO LST options, excluding current LST:",
        lst._id
      );

      // Use the same API call pattern as your existing lstCards.tsx
      const allLSTs = await lstApi.getApproved(); // Use existing working function

      console.log("✅ Successfully fetched all LSTs:", allLSTs.length);

      // Filter out the current LST manually (since we're using existing function)
      const otherLSTs = allLSTs.filter((lstItem) => lstItem._id !== lst._id);

      console.log("🎯 Other LSTs (excluding current):", otherLSTs.length);

      // Current NGO's LST (the one we're currently viewing)
      const currentNGOLST: NGOLSTOption = {
        mint: lst._id,
        name: lst.name,
        symbol: lst.ticker || "LST",
        ngoName: lst.ngoName || lst.name,
        isCurrentNGO: true,
        lstData: lst,
      };

      // Map other LSTs from backend to NGOLSTOption format
      const otherNGOLSTs: NGOLSTOption[] = otherLSTs.map((lstItem) => ({
        mint: lstItem._id,
        name: lstItem.name,
        symbol: lstItem.ticker || "LST",
        ngoName: lstItem.ngoName || lstItem.name,
        isCurrentNGO: false,
        lstData: lstItem,
      }));

      console.log("🎯 Mapped NGO options:", otherNGOLSTs.length);

      // Set current NGO first, then others
      setNgoLSTOptions([currentNGOLST, ...otherNGOLSTs]);

      // Auto-select current LST if nothing is selected
      if (!selectedNGOLST) {
        setSelectedNGOLST(lst._id);
      }
    } catch (error) {
      console.error("❌ Error fetching NGO LST options:", error);
      toast.error("Failed to load other NGO options");

      // Fallback to current LST only
      const currentNGOLST: NGOLSTOption = {
        mint: lst._id,
        name: lst.name,
        symbol: lst.ticker || "LST",
        ngoName: lst.ngoName || lst.name,
        isCurrentNGO: true,
        lstData: lst,
      };

      setNgoLSTOptions([currentNGOLST]);
      setSelectedNGOLST(lst._id);
    } finally {
      setLoadingNGOLSTs(false);
    }
  };

  const getSelectedLSTDetails = () => {
    return onchainLSTs.find((lst) => lst.mint === selectedLST);
  };

  const calculateRewards = () => {
    const selectedLSTData = getSelectedLSTDetails();
    if (!selectedLSTData || !lockAmount || !lockingPeriod)
      return { totalReward: 0, userReward: 0, donationReward: 0 };

    const amount = parseFloat(lockAmount);
    const months = parseInt(lockingPeriod);
    const apy = selectedLSTData.apy / 100;
    const donationPct = parseFloat(yieldPercentage) / 100;

    const totalReward = amount * apy * (months / 12);
    const donationReward = totalReward * donationPct;
    const userReward = totalReward - donationReward;

    return { totalReward, userReward, donationReward };
  };

  const calculateDonationAmount = () => {
    if (!donateAmount) return { donationAmount: 0, totalDonation: 0 };

    const baseAmount = parseFloat(donateAmount);
    // Use the LST's donation percentage from database instead of user selection
    const percentage = (lst.donationPercentage || 50) / 100;
    const totalDonation = baseAmount * percentage;

    return { donationAmount: baseAmount, totalDonation };
  };

  const handleLock = async () => {
    if (!connected || !publicKey || !signTransaction) {
      toast.error("Please connect your wallet first");
      return;
    }

    if (!lockAmount || parseFloat(lockAmount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (!selectedLST) {
      toast.error("Please select an LST");
      return;
    }

    if (
      !yieldPercentage ||
      parseFloat(yieldPercentage) <= 0 ||
      parseFloat(yieldPercentage) > 100
    ) {
      toast.error("Please enter a valid yield percentage (1-100)");
      return;
    }

    setIsLocking(true);
    const toastId = toast.loading("Processing lock transaction...");

    try {
      const selectedLSTData = getSelectedLSTDetails();
      if (!selectedLSTData) {
        throw new Error("Selected LST data not found");
      }

      const rewards = calculateRewards();

      const memoProgram = new PublicKey(
        "MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr"
      );
      const transaction = new Transaction().add({
        programId: memoProgram,
        keys: [{ pubkey: publicKey, isSigner: true, isWritable: true }],
        data: Buffer.from(
          `Lock ${lockAmount} ${selectedLSTData.symbol} for ${lockingPeriod} months, donate ${yieldPercentage}% yield to ${lst.name}`,
          "utf-8"
        ),
      });

      transaction.feePayer = publicKey;
      const { blockhash } = await connection.getRecentBlockhash();
      transaction.recentBlockhash = blockhash;

      const signedTransaction = await signTransaction(transaction);
      const txid = await connection.sendRawTransaction(
        signedTransaction.serialize()
      );
      await connection.confirmTransaction(txid, "processed");

      const transactionData = {
        walletAddress: publicKey.toString(),
        type: "lock",
        lstId: lst._id,
        amount: parseFloat(lockAmount),
        selectedLSTMint: selectedLST,
        selectedLSTSymbol: selectedLSTData.symbol,
        lockingPeriod: parseInt(lockingPeriod),
        yieldPercentage: parseFloat(yieldPercentage),
        recipientNGO: lst.ngoName,
        estimatedRewards: rewards,
        transactionHash: txid,
      };

      await transactionApi.createTransaction(transactionData);

      toast.success(
        `Successfully locked ${lockAmount} ${selectedLSTData.symbol} for ${lockingPeriod} months!`,
        { id: toastId }
      );

      setLockAmount("");
      setLockingPeriod("1");
      setYieldPercentage("10");
      setSelectedLST("");
    } catch (error: any) {
      console.error("Error setting up lock:", error);
      toast.error(`Failed to set up locking: ${error.message}`, {
        id: toastId,
      });
    } finally {
      setIsLocking(false);
    }
  };

  const handleDonate = async () => {
    if (!connected || !publicKey || !signTransaction) {
      toast.error("Please connect your wallet first");
      return;
    }

    if (!donateAmount || parseFloat(donateAmount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (!selectedNGOLST) {
      toast.error("Please select an NGO to donate to");
      return;
    }

    setIsDonating(true);
    const toastId = toast.loading("Processing donation transaction...");

    try {
      const selectedNGO = ngoLSTOptions.find(
        (ngo) => ngo.mint === selectedNGOLST
      );
      if (!selectedNGO) {
        throw new Error("Selected NGO not found");
      }

      const { totalDonation } = calculateDonationAmount();

      const memoProgram = new PublicKey(
        "MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr"
      );
      const transaction = new Transaction().add({
        programId: memoProgram,
        keys: [{ pubkey: publicKey, isSigner: true, isWritable: true }],
        data: Buffer.from(
          // Updated message to reflect database percentage
          `Donate ${totalDonation} SOL (${
            lst.donationPercentage || 50
          }% of ${donateAmount} SOL) to ${selectedNGO.ngoName}`,
          "utf-8"
        ),
      });

      transaction.feePayer = publicKey;
      const { blockhash } = await connection.getRecentBlockhash();
      transaction.recentBlockhash = blockhash;

      const signedTransaction = await signTransaction(transaction);
      const txid = await connection.sendRawTransaction(
        signedTransaction.serialize()
      );
      await connection.confirmTransaction(txid, "processed");

      const transactionData = {
        walletAddress: publicKey.toString(),
        type: "donate",
        lstId: lst._id,
        amount: parseFloat(donateAmount),
        donationPercentage: lst.donationPercentage || 50, // Use database percentage
        recipientNGO: selectedNGO.ngoName,
        transactionHash: txid,
      };

      await transactionApi.createTransaction(transactionData);

      toast.success(
        `Successfully donated ${totalDonation} SOL to ${selectedNGO.ngoName}!`,
        { id: toastId }
      );

      setDonateAmount("");
      setSelectedNGOLST("");
      // Remove the manual donationPercentage reset since it's now from database
    } catch (error: any) {
      console.error("Error donating:", error);
      toast.error(`Failed to donate: ${error.message}`, { id: toastId });
    } finally {
      setIsDonating(false);
    }
  };

  if (!connected) {
    return (
      <div className="text-center p-6 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
          <svg
            className="w-6 h-6 text-blue-600 dark:text-blue-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
        </div>
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
          Connect Wallet
        </h3>
        <p className="text-xs text-gray-600 dark:text-gray-300 mb-4">
          Connect to start locking and donating
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tab Headers */}
      <div className="flex space-x-1 bg-gray-100 dark:bg-gray-900 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab("lock")}
          className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
            activeTab === "lock"
              ? "bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm"
              : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
          }`}
        >
          <span className="flex items-center justify-center">
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
            Lock
          </span>
        </button>
        <button
          onClick={() => setActiveTab("donate")}
          className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
            activeTab === "donate"
              ? "bg-white dark:bg-gray-700 text-green-600 dark:text-green-400 shadow-sm"
              : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
          }`}
        >
          <span className="flex items-center justify-center">
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
            Donate
          </span>
        </button>
      </div>

      {/* Lock Tab */}
      {activeTab === "lock" && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Lock & Support
          </h3>

          {/* LST Selection */}
          <div>
            <label
              htmlFor="lstSelect"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Select LST *
            </label>
            <select
              id="lstSelect"
              value={selectedLST}
              onChange={(e) => {
                setSelectedLST(e.target.value);
                // Reset percentage and amount when LST changes
                setLockPercentage(0);
                setLockAmount("");
              }}
              disabled={loadingLSTs}
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="">
                {loadingLSTs ? "Loading LSTs..." : "Choose an LST"}
              </option>
              {onchainLSTs
                .filter((lst) => lst.isUserHolding)
                .map((lst) => (
                  <option
                    key={lst.mint}
                    value={lst.mint}
                    className="bg-blue-50 dark:bg-blue-900/30 font-medium"
                  >
                    🔹 {lst.name} ({lst.symbol}) - {lst.balance} {lst.symbol} |
                    APY: {lst.apy}%
                  </option>
                ))}
              {onchainLSTs
                .filter((lst) => !lst.isUserHolding)
                .map((lst) => (
                  <option key={lst.mint} value={lst.mint}>
                    {lst.name} ({lst.symbol}) | APY: {lst.apy}%
                  </option>
                ))}
            </select>
          </div>

          {/* Amount Input */}
          <div>
            <label
              htmlFor="lockAmount"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Amount *
            </label>
            <div className="relative">
              <input
                type="number"
                id="lockAmount"
                value={lockAmount}
                onChange={(e) => setLockAmount(e.target.value)}
                placeholder="0.0"
                min="0"
                step="0.1"
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                  {getAvailableBalance().symbol}
                </span>
              </div>
            </div>
          </div>

          {/* Wallet Balance and Percentage Buttons for Lock Section*/}
          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Amount Selection
              </label>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {loadingBalance ? (
                  <span className="flex items-center">
                    <div className="animate-spin rounded-full h-3 w-3 border border-gray-400 border-t-transparent mr-1"></div>
                    Loading...
                  </span>
                ) : (
                  <span>
                    Balance: {getAvailableBalance().balance.toFixed(4)}{" "}
                    {getAvailableBalance().symbol}
                  </span>
                )}
              </div>
            </div>

            {/* Percentage Buttons Only */}
            <div className="grid grid-cols-4 gap-2">
              {[25, 50, 75, 100].map((percent) => (
                <button
                  key={percent}
                  onClick={() => updateLockAmountFromPercentage(percent)}
                  className={`py-2 px-3 text-sm font-medium rounded-lg transition-colors ${
                    lockPercentage === percent
                      ? "bg-blue-600 text-white shadow-md"
                      : "text-gray-700 bg-gray-100 hover:bg-gray-200 border border-gray-300 dark:text-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 dark:border-gray-600"
                  }`}
                  disabled={loadingBalance} // Remove !selectedLST condition
                >
                  {percent}%
                </button>
              ))}
            </div>

            {/* Helper text */}
            <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              {selectedLST
                ? getSelectedLSTDetails()?.isUserHolding
                  ? `Using your ${getAvailableBalance().symbol} balance`
                  : "Using your SOL balance (will be converted)"
                : "Using your SOL balance - select an LST to see specific balance"}
            </div>
          </div>

          {/* Locking Period */}
          <div>
            <label
              htmlFor="lockingPeriod"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Locking Period *
            </label>
            <select
              id="lockingPeriod"
              value={lockingPeriod}
              onChange={(e) => setLockingPeriod(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="1">1 Month</option>
              <option value="3">3 Months</option>
              <option value="6">6 Months</option>
            </select>
          </div>

          {/* Yield Donation Percentage with Input and Slider */}
          <div>
            <label
              htmlFor="yieldPercentage"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Yield to Donate (%) *
            </label>

            {/* Number Input */}
            <div className="relative mb-3">
              <input
                type="number"
                id="yieldPercentage"
                value={yieldPercentage}
                onChange={(e) => setYieldPercentage(e.target.value)}
                placeholder="10"
                min="1"
                max="100"
                step="1"
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                  %
                </span>
              </div>
            </div>

            {/* Horizontal Slider */}
            <div className="relative">
              <input
                type="range"
                min="1"
                max="100"
                step="1"
                value={yieldPercentage}
                onChange={(e) => setYieldPercentage(e.target.value)}
                className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                style={{
                  background: `linear-gradient(to right, #3B82F6 0%, #3B82F6 ${yieldPercentage}%, #E5E7EB ${yieldPercentage}%, #E5E7EB 100%)`,
                }}
              />
            </div>

            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
              <span>0%</span>
              <span>25%</span>
              <span>50%</span>
              <span>75%</span>
              <span>100%</span>
            </div>

            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Percentage of your staking rewards that will be donated to{" "}
              {lst.name}
            </p>
          </div>

          {/* Reward Calculation */}
          {lockAmount && selectedLST && lockingPeriod && (
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">
                  Selected LST APY:
                </span>
                <span className="font-medium text-blue-600 dark:text-blue-400">
                  {getSelectedLSTDetails()?.apy}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">
                  Total Estimated Rewards:
                </span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {calculateRewards().totalReward.toFixed(4)}{" "}
                  {getSelectedLSTDetails()?.symbol}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">
                  Your Rewards:
                </span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {calculateRewards().userReward.toFixed(4)}{" "}
                  {getSelectedLSTDetails()?.symbol}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">
                  Donation Amount:
                </span>
                <span className="font-medium text-green-600 dark:text-green-400">
                  {calculateRewards().donationReward.toFixed(4)}{" "}
                  {getSelectedLSTDetails()?.symbol}
                </span>
              </div>
            </div>
          )}

          {/* Lock Button */}
          <button
            onClick={handleLock}
            disabled={
              isLocking ||
              !lockAmount ||
              !selectedLST ||
              !lockingPeriod ||
              !yieldPercentage
            }
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-700 dark:to-indigo-700 text-white py-3 px-4 rounded-lg hover:from-blue-700 hover:to-indigo-700 dark:hover:from-blue-800 dark:hover:to-indigo-800 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-200 font-semibold text-sm shadow-lg hover:shadow-xl"
          >
            {isLocking ? (
              <span className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Setting up Lock...
              </span>
            ) : (
              <span className="flex items-center justify-center">
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
                Lock {lockAmount || "0"}{" "}
                {getSelectedLSTDetails()?.symbol || "LST"}
              </span>
            )}
          </button>
        </div>
      )}

      {/* Donate Tab */}
      {activeTab === "donate" && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Donate & Support
          </h3>

          {/* Amount Input */}
          <div>
            <label
              htmlFor="donateAmount"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Amount *
            </label>
            <div className="relative">
              <input
                type="number"
                id="donateAmount"
                value={donateAmount}
                onChange={(e) => setDonateAmount(e.target.value)}
                placeholder="0.0"
                min="0"
                step="0.1"
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                  SOL
                </span>
              </div>
            </div>
          </div>

          {/* Wallet Balance and Percentage Buttons for Donate Section*/}
          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Amount Selection
              </label>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {loadingBalance ? (
                  <span className="flex items-center">
                    <div className="animate-spin rounded-full h-3 w-3 border border-gray-400 border-t-transparent mr-1"></div>
                    Loading...
                  </span>
                ) : (
                  <span>Balance: {walletBalance.toFixed(4)} SOL</span>
                )}
              </div>
            </div>

            {/* Percentage Buttons Only */}
            <div className="grid grid-cols-4 gap-2">
              {[25, 50, 75, 100].map((percent) => (
                <button
                  key={percent}
                  onClick={() => updateDonateAmountFromPercentage(percent)}
                  className={`py-2 px-3 text-sm font-medium rounded-lg transition-colors ${
                    donatePercentage === percent
                      ? "bg-green-600 text-white shadow-md"
                      : "text-gray-700 bg-gray-100 hover:bg-gray-200 border border-gray-300 dark:text-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 dark:border-gray-600"
                  }`}
                  disabled={loadingBalance}
                >
                  {percent}%
                </button>
              ))}
            </div>

            {/* Helper text */}
            <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              Using your SOL balance for donation
            </div>
          </div>

          {/* Donation Percentage */}
          {/* Donation Amount Display - Fetched from Database */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Donation Settings *
            </label>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Donation Rate (set by {lst.name}):
                </span>
                <span className="text-lg font-bold text-green-600 dark:text-green-400">
                  {lst.donationPercentage || 50}%
                </span>
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                <p>
                  <strong>{lst.donationPercentage || 50}%</strong> of your
                  donation amount will go directly to{" "}
                  <strong>{lst.name}</strong>
                  {(lst.donationPercentage || 50) === 50 && (
                    <span>
                      , and <strong>50%</strong> will remain with you
                    </span>
                  )}
                  {(lst.donationPercentage || 50) === 100 && (
                    <span> (full donation mode)</span>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* NGO Selection */}
          {/* NGO Selection */}
          <div>
            <label
              htmlFor="ngoSelect"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Select NGO *
            </label>
            <select
              id="ngoSelect"
              value={selectedNGOLST}
              onChange={(e) => setSelectedNGOLST(e.target.value)}
              disabled={loadingNGOLSTs}
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
  
              {/* Current LST - Highlighted and shown first */}
              <option
                value={lst._id} // Use current LST's ID
                className="bg-green-50 dark:bg-green-900/30 font-medium"
              >
                🔹 {lst.ngoName || lst.name} ({lst.ticker || "LST"})
              </option>

              {/* Other LSTs fetched from database */}
              {ngoLSTOptions
                .filter((ngo) => !ngo.isCurrentNGO) // Only show other NGOs
                .map((ngo) => (
                  <option key={ngo.mint} value={ngo.mint}>
                    {ngo.ngoName} ({ngo.symbol})
                  </option>
                ))}
            </select>
          </div>

          {/* Selected NGO Details */}
          {/* Selected NGO Details */}
          {selectedNGOLST && donateAmount && (
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 space-y-2">
              {(() => {
                const selectedNGO = ngoLSTOptions.find(
                  (ngo) => ngo.mint === selectedNGOLST
                );
                const { donationAmount, totalDonation } =
                  calculateDonationAmount();
                return selectedNGO ? (
                  <>
                    {/* Header with Info Button */}
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                        Donation Details
                      </h4>
                      <div className="flex items-center space-x-2">
                        {selectedNGO.isCurrentNGO ? (
                          <div className="flex items-center text-xs text-green-600 dark:text-green-400">
                            <svg
                              className="w-3 h-3 mr-1"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clipRule="evenodd"
                              />
                            </svg>
                            Current NGO
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              // Navigate to the selected LST's detail page
                              const lstId =
                                selectedNGO.lstData?._id || selectedNGO.mint;
                              router.push(`/lsts/${lstId}`);
                            }}
                            className="flex items-center space-x-1 px-2 py-1 text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 rounded-full hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                          >
                            <svg
                              className="w-3 h-3"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            <span>View Details</span>
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        Base Amount:
                      </span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {donationAmount.toFixed(2)} SOL
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        Donation Rate (from {lst.name}):
                      </span>
                      <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                        {lst.donationPercentage || 50}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        Amount to {selectedNGO.ngoName}:
                      </span>
                      <span className="text-sm font-medium text-green-600 dark:text-green-400">
                        {totalDonation.toFixed(2)} SOL
                      </span>
                    </div>
                    {(lst.donationPercentage || 50) === 50 && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                          Amount you keep:
                        </span>
                        <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                          {(donationAmount - totalDonation).toFixed(2)} SOL
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        To:
                      </span>
                      <span className="text-sm font-medium text-green-600 dark:text-green-400">
                        {selectedNGO.ngoName}
                      </span>
                    </div>
                  </>
                ) : null;
              })()}
            </div>
          )}

          {/* Donate Button */}
          <button
            onClick={handleDonate}
            disabled={isDonating || !donateAmount || !selectedNGOLST}
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-700 dark:to-emerald-700 text-white py-3 px-4 rounded-lg hover:from-green-700 hover:to-emerald-700 dark:hover:from-green-800 dark:hover:to-emerald-800 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-200 font-semibold text-sm shadow-lg hover:shadow-xl"
          >
            {isDonating ? (
              <span className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Donating...
              </span>
            ) : (
              <span className="flex items-center justify-center">
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
                Donate{" "}
                {calculateDonationAmount().totalDonation.toFixed(2) || "0"} SOL
              </span>
            )}
          </button>
        </div>
      )}
    </div>
  );
}

