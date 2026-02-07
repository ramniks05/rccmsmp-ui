// Digital Signature API Types

export type SignatureMethod = 'DSC' | 'AADHAAR_OTP' | 'BIOMETRIC';
export type ModuleType = 'NOTICE' | 'ORDERSHEET' | 'JUDGEMENT';

export interface SignDocumentRequest {
  documentContent: string;
  signatureMethod: SignatureMethod;
  certificatePassword?: string;
  reason: string;
  location: string;
}

export interface SignedDocumentResponse {
  signedDocumentId: number;
  signatureId: number;
  pdfUrl: string;
  signatureTimestamp: string;
  status: string;
  fileName: string;
  fileSize: number;
}

export interface SignatureVerificationResult {
  isValid: boolean;
  signedBy: string;
  signedAt: string;
  certificateValid: boolean;
  certificateExpiry: string;
  documentTampered: boolean;
}

export interface CertificateStatusResponse {
  hasCertificate: boolean;
  certificateType: string;
  validUntil: string;
  status: 'ACTIVE' | 'EXPIRED' | 'INACTIVE';
}

export interface CertificateUploadResponse {
  certificateId: number;
  issuer: string;
  validFrom: string;
  validUntil: string;
  status: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T | null;
  timestamp: string;
}
