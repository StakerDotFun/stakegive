import axios from 'axios';
import { LST, CreateLSTData } from '../types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // Increased timeout for image uploads
});

export const lstApi = {
  create: async (data: CreateLSTData & { creatorWallet: string; signature: string; image: string }): Promise<LST> => {
    const response = await api.post('/lst', data);
    return response.data.data;
  },

  creater: async (data: CreateLSTData & { creatorWallet: string; signature: string; image: string }): Promise<LST> => {
    const response = await api.post('/lsts', data);
    return response.data.data;
  },

  getByCreator: async (wallet: string): Promise<LST[]> => {
    const response = await api.get(`/lst/creator/${wallet}`);
    return response.data.data;
  },

  getApproved: async (filters?: { category?: string; search?: string }): Promise<LST[]> => {
    const params = new URLSearchParams();
    if (filters?.category) params.append('category', filters.category);
    if (filters?.search) params.append('search', filters.search);
    
    const response = await api.get(`/lst/approved?${params.toString()}`);
    return response.data.data;
  },

  getById: async (id: string): Promise<LST> => {
    const response = await api.get(`/lst/${id}`);
    return response.data.data;
  },

  getStats: async (): Promise<any> => {
    const response = await api.get('/lst/stats/overview');
    return response.data.data;
  },

  // Get all approved LSTs with validator data
  getApprovedWithValidators: async (): Promise<LST[]> => {
    const response = await api.get('/lst/approved-with-validators');
    return response.data.data;
  },

  // Get validator APY data
  getValidatorAPY: async (voteAccount: string): Promise<{ apy: number; commission: number }> => {
    const response = await api.get(`/validator/apy/${voteAccount}`);
    return response.data.data;
  },

  // Get user's LST holdings
  getUserLSTHoldings: async (walletAddress: string): Promise<any[]> => {
    const response = await api.get(`/user/holdings/${walletAddress}`);
    return response.data.data;
  },
};

export const adminApi = {
  getPending: async (): Promise<LST[]> => {
    const response = await api.get('/admin/pending');
    return response.data.data;
  },

  updateStatus: async (id: string, status: 'approved' | 'rejected', adminNotes?: string): Promise<LST> => {
    const response = await api.patch(`/admin/${id}/status`, { status, adminNotes });
    return response.data.data;
  },
};

export const transactionApi = {
  // Create a new transaction
  createTransaction: async (transactionData: any): Promise<any> => {
    const response = await api.post('/transaction', transactionData);
    return response.data.data;
  },

  // Get user transaction history
  getUserTransactions: async (walletAddress: string, page = 1, limit = 20, type?: string): Promise<any> => {
    const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
    if (type) params.append('type', type);
    
    const response = await api.get(`/transaction/user/${walletAddress}?${params}`);
    return response.data.data;
  },

  // Get active locks
  getActiveLocks: async (walletAddress: string): Promise<any[]> => {
    const response = await api.get(`/transaction/user/${walletAddress}/active-locks`);
    return response.data.data;
  },

  // Unlock a completed lock
  unlockTransaction: async (transactionId: string, walletAddress: string): Promise<any> => {
    const response = await api.patch(`/transaction/${transactionId}/unlock`, { walletAddress });
    return response.data.data;
  },

  // Get user statistics
  getUserStats: async (walletAddress: string): Promise<any> => {
    const response = await api.get(`/transaction/user/${walletAddress}/stats`);
    return response.data.data;
  }
};

export const metricsApi = {
  // Get platform-wide metrics (collective volume)
  getPlatformMetrics: async (): Promise<any> => {
    const response = await api.get('/metrics/platform');
    return response.data.data;
  },

  // Get individual LST metrics
  getLSTMetrics: async (lstId: string): Promise<any> => {
    const response = await api.get(`/metrics/lst/${lstId}`);
    return response.data.data;
  }
};
