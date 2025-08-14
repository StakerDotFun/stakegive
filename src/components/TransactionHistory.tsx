"use client";

import { useState, useEffect } from "react";
import { transactionApi } from "../lib/api";
import toast from "react-hot-toast";

interface TransactionHistoryProps {
  walletAddress?: string;
}

export default function TransactionHistory({
  walletAddress,
}: TransactionHistoryProps) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "lock" | "donate" | "unlock">(
    "all"
  );
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  useEffect(() => {
    if (walletAddress) {
      fetchTransactions();
    }
  }, [walletAddress, filter, page]);

  const fetchTransactions = async () => {
    if (!walletAddress) return;

    setLoading(true);
    try {
      const data = await transactionApi.getUserTransactions(
        walletAddress,
        page,
        20,
        filter === "all" ? undefined : filter
      );
      setTransactions(data.transactions);
      setPagination(data.pagination);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      toast.error("Failed to load transaction history");
    } finally {
      setLoading(false);
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "lock":
        return (
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <svg
              className="w-5 h-5 text-blue-600"
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
        );
      case "donate":
        return (
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
            <svg
              className="w-5 h-5 text-green-600"
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
          </div>
        );
      case "unlock":
        return (
          <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
            <svg
              className="w-5 h-5 text-yellow-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"
              />
            </svg>
          </div>
        );
      default:
        return (
          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
            <svg
              className="w-5 h-5 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
          </div>
        );
    }
  };

  const getTransactionDescription = (tx: any) => {
    switch (tx.type) {
      case "lock":
        return `Locked ${tx.amount} ${tx.selectedLSTSymbol} for ${tx.lockingPeriod} months (${tx.yieldPercentage}% yield donation)`;
      case "donate":
        // Updated to show donation percentage
        return `Donated ${(tx.amount * (tx.donationPercentage / 100)).toFixed(
          2
        )} SOL (${tx.donationPercentage}% of ${tx.amount} SOL) to ${
          tx.recipientNGO
        }`;
      case "unlock":
        return `Unlocked ${tx.amount} ${tx.selectedLSTSymbol}`;
      default:
        return "Unknown transaction";
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filter Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Transaction History
        </h2>
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg max-w-md">
          {[
            { key: "all", label: "All" },
            { key: "lock", label: "Locks" },
            { key: "donate", label: "Donations" },
            { key: "unlock", label: "Unlocks" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => {
                setFilter(tab.key as any);
                setPage(1);
              }}
              className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
                filter === tab.key
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Transactions List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {transactions.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No Transactions Found
            </h3>
            <p className="text-gray-600">
              You haven't made any {filter === "all" ? "" : filter} transactions
              yet.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {transactions.map((tx: any) => (
              <div
                key={tx._id}
                className="p-6 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start space-x-4">
                  {getTransactionIcon(tx.type)}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900 capitalize">
                        {tx.type} Transaction
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(tx.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>

                    <p className="text-sm text-gray-600 mt-1">
                      {getTransactionDescription(tx)}
                    </p>

                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center space-x-4">
                        <span className="text-sm text-gray-500">
                          Supporting:{" "}
                          <span className="font-medium text-gray-900">
                            {tx.lstId?.name}
                          </span>
                        </span>
                        {tx.transactionHash && (
                          <a
                            href={`https://solscan.io/tx/${tx.transactionHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:text-blue-700 flex items-center"
                          >
                            <svg
                              className="w-3 h-3 mr-1"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                              />
                            </svg>
                            View TX
                          </a>
                        )}
                      </div>

                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-900">
                          {tx.type === "donate"
                            ? `${(
                                tx.amount *
                                (tx.donationPercentage / 100)
                              ).toFixed(2)} SOL`
                            : `${tx.amount} ${tx.selectedLSTSymbol || "SOL"}`}
                        </p>
                        {tx.type === "lock" && (
                          <p className="text-xs text-green-600">
                            {tx.yieldPercentage}% donated to charity
                          </p>
                        )}
                        {/* Add this new section for donate transactions */}
                        {tx.type === "donate" && (
                          <div className="text-xs text-gray-600">
                            <p className="text-green-600">
                              {tx.donationPercentage}% of {tx.amount} SOL donated to Charity
                            </p>
                            
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
      </div>
    </div>
  );
}

