"use client";

import { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { transactionApi } from "../../lib/api";
import toast from "react-hot-toast";
import TransactionHistory from "../../components/TransactionHistory";
import ActiveLocks from "../../components/ActiveLocks";
import UserStats from "../../components/UserStats";

export default function UserDashboard() {
  const { connected, publicKey } = useWallet();
  const [activeTab, setActiveTab] = useState<"overview" | "locks" | "history">(
    "overview"
  );
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [activeLocks, setActiveLocks] = useState<any[]>([]);
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    if (connected && publicKey) {
      fetchDashboardData();
    }
  }, [connected, publicKey]);

  const fetchDashboardData = async () => {
    if (!publicKey) return;

    setLoading(true);
    try {
      const [statsData, locksData, transactionsData] = await Promise.all([
        transactionApi.getUserStats(publicKey.toString()),
        transactionApi.getActiveLocks(publicKey.toString()),
        transactionApi.getUserTransactions(publicKey.toString(), 1, 10),
      ]);

      setStats(statsData);
      setActiveLocks(locksData);
      setTransactions(transactionsData.transactions);
    } catch (error) {
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  if (!connected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
        {/* Hero Pattern Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-32 w-80 h-80 border border-blue-200 dark:border-blue-800 rounded-full opacity-30 dark:opacity-10"></div>
          <div className="absolute -bottom-40 -left-32 w-80 h-80 border border-purple-200 dark:border-purple-800 rounded-full opacity-30 dark:opacity-10"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 border border-blue-300 dark:border-blue-700 rounded-full opacity-20 dark:opacity-10"></div>
        </div>

        <div className="relative flex items-center justify-center min-h-screen px-4">
          <div className="text-center max-w-md w-full">
            <div className="w-24 h-24 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-2xl">
              <svg
                className="w-12 h-12 text-white"
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
            <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
              Connect Your Wallet
            </h2>
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-8">
              Please connect your wallet to view your personal dashboard and
              track your impact.
            </p>
            <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border border-white/20 dark:border-gray-700 rounded-2xl p-6 shadow-xl">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                <span className="font-semibold text-blue-600 dark:text-blue-400">
                  Dashboard Features:
                </span>{" "}
                View your locks, donations, countdown timers, and transaction
                history all in one place.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center">
          <div className="relative h-16 w-16">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 dark:border-gray-700"></div>
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 dark:border-blue-500 border-t-transparent absolute inset-0 m-auto"></div>
          </div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-32 w-80 h-80 border border-blue-200 dark:border-blue-800 rounded-full opacity-30 dark:opacity-10"></div>
        <div className="absolute -bottom-40 -left-32 w-80 h-80 border border-purple-200 dark:border-purple-800 rounded-full opacity-30 dark:opacity-10"></div>
        <div className="absolute top-1/3 left-1/4 w-64 h-64 border border-blue-300 dark:border-blue-700 rounded-full opacity-20 dark:opacity-10"></div>
        <div className="absolute bottom-1/3 right-1/4 w-48 h-48 border border-purple-300 dark:border-purple-700 rounded-full opacity-20 dark:opacity-10"></div>
      </div>

      {/* Header */}
      <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm shadow-sm border-b border-white/20 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-6 md:py-8 flex justify-center">
          <h1 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            My Dashboard
          </h1>
        </div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Tab Navigation */}
        <div className="flex justify-center mb-8 md:mb-12">
          <div className="flex flex-wrap justify-center gap-2 sm:gap-1 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm p-1 rounded-2xl border border-white/30 dark:border-gray-700 shadow-xl">
            {[
              {
                key: "overview",
                label: "Overview",
                icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
                gradient: "from-blue-600 to-indigo-600",
              },
              {
                key: "locks",
                label: "Active Locks",
                icon: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z",
                gradient: "from-blue-600 to-indigo-600",
              },
              {
                key: "history",
                label: "History",
                icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
                gradient: "from-blue-600 to-indigo-600",
              },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`py-2 px-4 sm:py-3 sm:px-6 text-sm font-semibold rounded-xl transition-all duration-300 flex items-center justify-center min-w-[100px] sm:min-w-[120px] ${
                  activeTab === tab.key
                    ? `bg-gradient-to-r ${tab.gradient} text-white shadow-lg transform scale-105`
                    : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-gray-700/50"
                }`}
              >
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
                    d={tab.icon}
                  />
                </svg>
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.label.split(" ")[0]}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="relative">
          {activeTab === "overview" && (
            <UserStats stats={stats} activeLocks={activeLocks} />
          )}
          {activeTab === "locks" && (
            <ActiveLocks locks={activeLocks} onRefresh={fetchDashboardData} />
          )}
          {activeTab === "history" && (
            <TransactionHistory walletAddress={publicKey?.toString()} />
          )}
        </div>
      </div>
    </div>
  );
}

