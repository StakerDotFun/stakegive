'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { transactionApi } from '../lib/api';
import toast from 'react-hot-toast';

interface ActiveLocksProps {
  locks: any[];
  onRefresh: () => void;
}

export default function ActiveLocks({ locks, onRefresh }: ActiveLocksProps) {
  const { publicKey } = useWallet();
  const [localLocks, setLocalLocks] = useState(locks);
  const [unlocking, setUnlocking] = useState<string | null>(null);

  useEffect(() => {
    setLocalLocks(locks);
  }, [locks]);

  // Countdown timer effect
  useEffect(() => {
    const interval = setInterval(() => {
      setLocalLocks(current => [...current]); // Force re-render for countdown update
      
      // Check for completed locks and send notifications
      localLocks.forEach(lock => {
        const timeLeft = new Date(lock.lockEndDate).getTime() - Date.now();
        if (timeLeft <= 0 && !lock.isUnlocked) {
          // Browser notification
          if (Notification.permission === 'granted') {
            new Notification('🔓 Lock Completed!', {
              body: `Your ${lock.amount} ${lock.selectedLSTSymbol} lock is ready to unlock!`,
              icon: '/logo-removed-bg.png'
            });
          }
          
          // In-app toast notification
          toast.success(`🔓 Lock completed! ${lock.amount} ${lock.selectedLSTSymbol} is ready to unlock!`, {
            duration: 6000,
            position: 'top-right'
          });
        }
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [localLocks]);

  // Request notification permission on component mount
  useEffect(() => {
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const handleUnlock = async (lockId: string) => {
    if (!publicKey) return;
    
    setUnlocking(lockId);
    try {
      await transactionApi.unlockTransaction(lockId, publicKey.toString());
      toast.success('Lock unlocked successfully! 🎉');
      onRefresh();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to unlock');
    } finally {
      setUnlocking(null);
    }
  };

  const formatTimeLeft = (endDate: string) => {
    const timeLeft = new Date(endDate).getTime() - Date.now();
    
    if (timeLeft <= 0) {
      return { text: 'Ready to unlock', color: 'text-green-600', isReady: true };
    }
    
    const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) {
      return { text: `${days}d ${hours}h`, color: 'text-gray-600', isReady: false };
    } else if (hours > 0) {
      return { text: `${hours}h ${minutes}m`, color: 'text-orange-600', isReady: false };
    } else {
      return { text: `${minutes}m`, color: 'text-red-600', isReady: false };
    }
  };

  const getProgressPercentage = (startDate: string, endDate: string) => {
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();
    const now = Date.now();
    
    const total = end - start;
    const elapsed = now - start;
    
    return Math.min(Math.max((elapsed / total) * 100, 0), 100);
  };

  if (localLocks.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8 text-center shadow-sm">
        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Active Positions</h3>
        <p className="text-gray-600">You don't have any active locked positions at the moment.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Active Positions</h2>
        <div className="flex items-center text-sm text-gray-500">
          <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
          Live status
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {localLocks.map((lock) => {
          const timeLeft = formatTimeLeft(lock.lockEndDate);
          const progress = getProgressPercentage(lock.lockStartDate, lock.lockEndDate);
          
          return (
            <div key={lock._id} className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
              {/* Status Badge */}
              <div className="relative">
                <div className="absolute top-3 right-3 z-10">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    timeLeft.isReady 
                      ? 'bg-green-100 text-green-800 border border-green-300'
                      : 'bg-blue-100 text-blue-800 border border-blue-300'
                  }`}>
                    {timeLeft.isReady ? '✓ Ready' : '⏳ Active'}
                  </span>
                </div>

                {/* Progress Image/Icon Area */}
                <div className="w-full h-32 bg-gray-50 rounded-t-lg flex items-center justify-center relative overflow-hidden">
                  {/* Progress Background */}
                  <div 
                    className="absolute inset-0 bg-gray-900 transition-all duration-1000 ease-out"
                    style={{ width: `${progress}%`, opacity: 0.1 }}
                  ></div>
                  
                  <div className="relative z-10 text-center">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                      <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <div className="text-xs text-gray-500">
                      {progress.toFixed(0)}% Complete
                    </div>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {lock.amount} {lock.selectedLSTSymbol}
                </h3>
                <p className="text-sm text-blue-600 font-medium mb-3">{lock.lstId?.name}</p>
                
                {/* Time Remaining */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Time Remaining:</span>
                    <span className={`text-sm font-semibold ${timeLeft.color}`}>
                      {timeLeft.text}
                    </span>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div 
                      className="bg-gray-900 h-1.5 rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>

                {/* Key Info */}
                <div className="space-y-2 text-sm mb-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Lock Period:</span>
                    <span className="font-medium text-gray-900">{lock.lockingPeriod} months</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Yield Donation:</span>
                    <span className="font-medium text-gray-900">{lock.yieldPercentage}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Supporting:</span>
                    <span className="font-medium text-gray-900">{lock.recipientNGO}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Started:</span>
                    <span className="font-medium text-gray-900">
                      {new Date(lock.lockStartDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Estimated Rewards */}
                <div className="bg-gray-50 rounded-lg p-3 mb-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Estimated Rewards</h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-gray-600">Your Share:</span>
                      <p className="font-medium text-gray-900">
                        {lock.estimatedRewards?.userReward?.toFixed(4) || '0'} {lock.selectedLSTSymbol}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600">Donated:</span>
                      <p className="font-medium text-gray-900">
                        {lock.estimatedRewards?.donationReward?.toFixed(4) || '0'} {lock.selectedLSTSymbol}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                {timeLeft.isReady ? (
                  <button
                    onClick={() => handleUnlock(lock._id)}
                    disabled={unlocking === lock._id}
                    className="w-full bg-gray-900 text-white py-2 px-3 rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-sm"
                  >
                    {unlocking === lock._id ? (
                      <span className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-3 w-3 border border-white border-t-transparent mr-2"></div>
                        Unlocking...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                        </svg>
                        Unlock Position
                      </span>
                    )}
                  </button>
                ) : (
                  <div className="w-full bg-gray-100 text-gray-600 py-2 px-3 rounded-lg text-center font-medium text-sm">
                    <span className="flex items-center justify-center">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Position Active
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
