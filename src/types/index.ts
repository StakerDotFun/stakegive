export interface LST {
  totalStaked: number;
  ngoId: any;
  createdBy: any;
  donationPercentage: number;
  _id: string;
  name: string;
  ticker: string;
  description: string;
  validator: string;
  fundingWallet: string;
  creatorWallet: string;
  ngoName: string;
  contactEmail: string;
  website?: string;
  category: 'Education' | 'Healthcare' | 'Environment' | 'Poverty' | 'Animal Welfare' | 'Other';
  customCategory?: string;
  socialHandles: {
    twitter?: string;
    instagram?: string;
    facebook?: string;
    linkedin?: string;
  };
  image: string; // Now this is a URL string instead of base64
  status: 'pending' | 'approved' | 'rejected';
  adminNotes?: string;
  signature: string;
  createdAt: string;
  approvedAt?: string;
}

export interface CreateLSTData {
  name: string;
  ticker: string;
  description: string;
  validator: string;
  fundingWallet: string;
  ngoName: string;
  contactEmail: string;
  website?: string;
  category: string;
  customCategory?: string;
  donationPercentage: number;
  socialHandles: {
    twitter?: string;
    instagram?: string;
    facebook?: string;
    linkedin?: string;
  };
  image?: string; // Now this is a URL string instead of base64
}