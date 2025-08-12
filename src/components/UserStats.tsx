'use client';

interface UserStatsProps {
  stats: any;
  activeLocks: any[];
}

export default function UserStats({ stats, activeLocks }: UserStatsProps) {
  const getStatValue = (type: string, field: 'count' | 'totalAmount') => {
    const stat = stats?.stats?.find((s: any) => s._id === type);
    return stat?.[field] || 0;
  };

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-blue-600 to-blue-900 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Total Locks</p>
              <p className="text-3xl font-bold">{getStatValue('lock', 'count')}</p>
            </div>
            <div className="bg-blue-400 bg-opacity-30 rounded-lg p-3">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-600 to-green-900 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Total Donations</p>
              <p className="text-3xl font-bold">{getStatValue('donate', 'count')}</p>
            </div>
            <div className="bg-green-400 bg-opacity-30 rounded-lg p-3">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-600 to-purple-900 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Active Locks</p>
              <p className="text-3xl font-bold">{stats?.activeLocks || 0}</p>
            </div>
            <div className="bg-purple-400 bg-opacity-30 rounded-lg p-3">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-600 to-orange-900 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">Total Volume</p>
              <p className="text-3xl font-bold">
                {(getStatValue('lock', 'totalAmount') + getStatValue('donate', 'totalAmount')).toFixed(2)}
              </p>
              <p className="text-orange-100 text-xs">SOL</p>
            </div>
            <div className="bg-orange-400 bg-opacity-30 rounded-lg p-3">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity Preview */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Quick Overview</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h4 className="text-lg font-medium text-blue-700 mb-3">Active Locks Status</h4>
            {activeLocks.length > 0 ? (
              <div className="space-y-2">
                {activeLocks.slice(0, 3).map((lock: any) => (
                  <div key={lock._id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                      <span className="text-sm dark:text-gray-800 font-medium">{lock.amount} {lock.selectedLSTSymbol}</span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {Math.ceil((new Date(lock.lockEndDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days left
                    </span>
                  </div>
                ))}
                <p className="text-sm text-gray-500">
                  Top 3 locks with minimal remaining time
                </p>
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No active locks</p>
            )}
          </div>
          
          <div>
            <h4 className="text-lg font-medium text-blue-700 mb-3">Impact Summary</h4>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total Locked Value:</span>
                <span className="text-sm dark:text-gray-800 font-medium">{getStatValue('lock', 'totalAmount').toFixed(2)} SOL</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total Donated:</span>
                <span className="text-sm dark:text-gray-800 font-medium">{getStatValue('donate', 'totalAmount').toFixed(2)} SOL</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">NGOs Supported:</span>
                <span className="text-sm font-medium">{getStatValue('donate', 'count')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
