import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {
  SignDocumentRequest,
  SignedDocumentResponse,
  SignatureVerificationResult,
  CertificateStatusResponse,
  CertificateUploadResponse,
  ApiResponse,
  ModuleType
} from '../models/digital-signature.model';

@Injectable({
  providedIn: 'root'
})
export class DigitalSignatureService {
  private apiUrl = environment.apiUrl || 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  /**
   * Sign a document with digital signature
   * @param caseId - Case ID
   * @param moduleType - Document type (NOTICE, ORDERSHEET, JUDGEMENT)
   * @param request - Signature request data
   * @returns Observable of signed document response
   */
  signDocument(
    caseId: number,
    moduleType: ModuleType,
    request: SignDocumentRequest
  ): Observable<SignedDocumentResponse> {
    return this.http
      .post<ApiResponse<SignedDocumentResponse>>(
        `${this.apiUrl}/cases/${caseId}/documents/${moduleType}/sign`,
        request
      )
      .pipe(
        map((response) => {
          if (response.success && response.data) {
            return response.data;
          }
          throw new Error(response.message || 'Failed to sign document');
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Download signed PDF document
   * @param signedDocumentId - Signed document ID
   * @returns Observable of PDF blob
   */
  downloadSignedDocument(signedDocumentId: number): Observable<Blob> {
    return this.http
      .get(`${this.apiUrl}/documents/signed/${signedDocumentId}/download`, {
        responseType: 'blob'
      })
      .pipe(catchError(this.handleError));
  }

  /**
   * Trigger browser download of signed PDF
   * @param signedDocumentId - Signed document ID
   * @param fileName - Optional custom filename
   */
  downloadSignedPdf(signedDocumentId: number, fileName?: string): void {
    this.downloadSignedDocument(signedDocumentId).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName || `Signed_Document_${signedDocumentId}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      },
      error: (error) => {
        console.error('Download failed:', error);
      }
    });
  }

  /**
   * Verify digital signature on a document
   * @param signedDocumentId - Signed document ID
   * @returns Observable of verification result
   */
  verifySignature(signedDocumentId: number): Observable<SignatureVerificationResult> {
    return this.http
      .get<ApiResponse<SignatureVerificationResult>>(
        `${this.apiUrl}/documents/signed/${signedDocumentId}/verify`
      )
      .pipe(
        map((response) => {
          if (response.success && response.data) {
            return response.data;
          }
          throw new Error(response.message || 'Failed to verify signature');
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Get current officer's certificate status
   * @returns Observable of certificate status
   */
  getCertificateStatus(): Observable<CertificateStatusResponse> {
    return this.http
      .get<ApiResponse<CertificateStatusResponse>>(
        `${this.apiUrl}/officers/me/certificate`
      )
      .pipe(
        map((response) => {
          if (response.success && response.data) {
            return response.data;
          }
          throw new Error(response.message || 'Failed to get certificate status');
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Upload officer's digital certificate (Admin)
   * @param officerId - Officer ID
   * @param file - Certificate file (.pfx or .p12)
   * @param password - Certificate password
   * @returns Observable of upload response
   */
  uploadCertificate(
    officerId: number,
    file: File,
    password: string
  ): Observable<CertificateUploadResponse> {
    const formData = new FormData();
    formData.append('certificateFile', file);
    formData.append('password', password);

    return this.http
      .post<ApiResponse<CertificateUploadResponse>>(
        `${this.apiUrl}/admin/officers/${officerId}/certificate`,
        formData
      )
      .pipe(
        map((response) => {
          if (response.success && response.data) {
            return response.data;
          }
          throw new Error(response.message || 'Failed to upload certificate');
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Check if digital signature feature is available
   * @returns Observable of boolean indicating availability
   */
  isFeatureAvailable(): Observable<boolean> {
    return this.getCertificateStatus().pipe(
      map(() => true),
      catchError((error: HttpErrorResponse) => {
        if (error.status === 503) {
          // Feature not implemented yet
          return throwError(() => ({
            status: 503,
            message: 'Digital signature feature is not yet available. This feature is currently under development.'
          }));
        }
        return throwError(() => error);
      })
    );
  }

  /**
   * Error handler
   * @param error - HTTP error response
   * @returns Observable error
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An error occurred';

    if (error.status === 503) {
      errorMessage = 'Digital signature feature is not yet available. This feature is currently under development.';
    } else if (error.status === 401) {
      errorMessage = 'Unauthorized. Please log in again.';
    } else if (error.status === 400) {
      errorMessage = error.error?.message || 'Invalid request. Please check your input.';
    } else if (error.status === 404) {
      errorMessage = 'Resource not found.';
    } else if (error.error?.message) {
      errorMessage = error.error.message;
    } else if (error.message) {
      errorMessage = error.message;
    }

    return throwError(() => ({
      status: error.status,
      message: errorMessage,
      error: error.error
    }));
  }
}
