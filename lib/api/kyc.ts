import apiClient from './client';
import { ApiResponse } from './types';

// Document types supported
export type DocumentType = 'nin' | 'drivers_license' | 'voters_card' | 'passport';

// Supported document info
export interface SupportedDocument {
  id: DocumentType;
  label: string;
  productCode: string;
  description: string;
}

// KYC Status response
export interface KycStatusResponse {
  status: 'Pending' | 'Verified' | 'Rejected' | 'Suspended';
  steps: {
    personal: {
      completed: boolean;
      submittedAt?: string;
    };
    document: {
      completed: boolean;
      submittedAt?: string;
      documentType?: DocumentType;
      verificationMethod?: 'sdk' | 'manual';
    };
    verification: {
      completed: boolean;
      status: string;
      verifiedAt?: string;
      rejectionReason?: string;
    };
  };
  estimatedTime?: string;
}

// QoreID verification initiation response
export interface QoreIdInitiateResponse {
  sdkToken: string;
  customerReference: string;
  documentType: DocumentType;
  productCode: string;
  applicantData: {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber?: string;
  };
}

// QoreID verification complete input
export interface QoreIdCompleteInput {
  documentType: DocumentType;
  verificationId: string;
  status: 'success' | 'failed' | 'pending';
  data?: {
    firstName?: string;
    lastName?: string;
    dateOfBirth?: string;
    documentNumber?: string;
  };
}

// Personal info input
export interface PersonalInfoInput {
  dateOfBirth: string;
  phoneNumber: string;
  address: {
    street: string;
    city: string;
    state: string;
    postalCode?: string;
    country?: string;
  };
}

// Document upload input (manual)
export interface DocumentUploadInput {
  documentType: DocumentType;
  frontImageUrl: string;
  backImageUrl?: string;
}

// Direct verification input
export interface DirectVerificationInput {
  documentType: DocumentType;
  idNumber: string;
  dateOfBirth?: string;
}

/**
 * Get supported document types
 */
export const getSupportedDocuments = async (): Promise<SupportedDocument[]> => {
  const response = await apiClient.get<ApiResponse<SupportedDocument[]>>('/kyc/documents');
  return response.data.data;
};

/**
 * Get KYC status
 */
export const getKycStatus = async (): Promise<KycStatusResponse> => {
  const response = await apiClient.get<ApiResponse<KycStatusResponse>>('/kyc/status');
  return response.data.data;
};

/**
 * Submit personal information (KYC Step 1)
 */
export const submitPersonalInfo = async (data: PersonalInfoInput): Promise<{ message: string; step: string; completed: boolean }> => {
  const response = await apiClient.post<ApiResponse<{ message: string; step: string; completed: boolean }>>('/kyc/personal', data);
  return response.data.data;
};

/**
 * Submit document (manual upload)
 */
export const submitDocument = async (data: DocumentUploadInput): Promise<{ message: string; step: string; completed: boolean; estimatedTime: string }> => {
  const response = await apiClient.post<ApiResponse<{ message: string; step: string; completed: boolean; estimatedTime: string }>>('/kyc/document', data);
  return response.data.data;
};

/**
 * Initiate QoreID SDK verification
 */
export const initiateQoreIdVerification = async (documentType: DocumentType): Promise<QoreIdInitiateResponse> => {
  const response = await apiClient.post<ApiResponse<QoreIdInitiateResponse>>('/kyc/verify/initiate', { documentType });
  return response.data.data;
};

/**
 * Complete QoreID SDK verification
 */
export const completeQoreIdVerification = async (data: QoreIdCompleteInput): Promise<{ message: string; status: string; verificationId: string }> => {
  const response = await apiClient.post<ApiResponse<{ message: string; status: string; verificationId: string }>>('/kyc/verify/complete', data);
  return response.data.data;
};

/**
 * Direct ID verification (server-side lookup)
 */
export const verifyIdDirect = async (data: DirectVerificationInput): Promise<{ message: string; verificationId: string; status: string }> => {
  const response = await apiClient.post<ApiResponse<{ message: string; verificationId: string; status: string }>>('/kyc/verify/direct', data);
  return response.data.data;
};
