import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DigitalSignatureService } from '../../services/digital-signature.service';
import { SignatureMethod } from '../../models/digital-signature.model';

export interface SignatureDialogData {
  caseId: number;
  moduleType: 'NOTICE' | 'ORDERSHEET' | 'JUDGEMENT';
  documentContent: string;
  documentPreview?: string;
}

export interface SignatureDialogResult {
  success: boolean;
  signedDocumentId?: number;
  pdfUrl?: string;
  fileName?: string;
}

@Component({
  selector: 'app-digital-signature-dialog',
  templateUrl: './digital-signature-dialog.component.html',
  styleUrls: ['./digital-signature-dialog.component.scss']
})
export class DigitalSignatureDialogComponent {
  signatureMethod: SignatureMethod = 'DSC';
  certificatePassword: string = '';
  aadhaarNumber: string = '';
  otp: string = '';
  otpSent: boolean = false;
  transactionId?: string;
  reason: string = 'Document finalized and approved';
  location: string = '';
  
  loading: boolean = false;
  certificateStatus: any = null;
  hasCertificate: boolean = false;

  constructor(
    public dialogRef: MatDialogRef<DigitalSignatureDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: SignatureDialogData,
    private digitalSignatureService: DigitalSignatureService,
    private snackBar: MatSnackBar
  ) {
    this.checkCertificateStatus();
  }

  checkCertificateStatus(): void {
    this.digitalSignatureService.getCertificateStatus().subscribe({
      next: (status) => {
        this.certificateStatus = status;
        this.hasCertificate = status.hasCertificate && status.status === 'ACTIVE';
        
        if (!this.hasCertificate) {
          this.signatureMethod = 'AADHAAR_OTP';
        }
      },
      error: (error) => {
        console.error('Failed to check certificate status:', error);
        if (error.status === 503) {
          this.showMessage(
            'Digital signature feature is not yet available. This feature is currently under development.',
            'warning'
          );
        }
        // Default to Aadhaar if certificate check fails
        this.signatureMethod = 'AADHAAR_OTP';
      }
    });
  }

  canSign(): boolean {
    if (this.loading) return false;

    switch (this.signatureMethod) {
      case 'DSC':
        return this.certificatePassword.length >= 4 && this.reason.length > 0;
      case 'AADHAAR_OTP':
        if (!this.otpSent) {
          return this.aadhaarNumber.length === 12;
        }
        return this.otp.length === 6 && this.reason.length > 0;
      case 'BIOMETRIC':
        return this.reason.length > 0;
      default:
        return false;
    }
  }

  requestAadhaarOtp(): void {
    if (this.aadhaarNumber.length !== 12) {
      this.showMessage('Please enter a valid 12-digit Aadhaar number', 'error');
      return;
    }

    this.loading = true;
    
    // TODO: Implement Aadhaar OTP request API
    // For now, simulate success after 2 seconds
    setTimeout(() => {
      this.otpSent = true;
      this.transactionId = 'TXN_' + Date.now();
      this.loading = false;
      this.showMessage('OTP sent to registered mobile number', 'success');
    }, 2000);
  }

  sign(): void {
    if (!this.canSign()) return;

    this.loading = true;

    const signRequest = {
      documentContent: this.data.documentContent,
      signatureMethod: this.signatureMethod,
      certificatePassword: this.signatureMethod === 'DSC' ? this.certificatePassword : undefined,
      reason: this.reason,
      location: this.location || 'Court Office'
    };

    this.digitalSignatureService.signDocument(
      this.data.caseId,
      this.data.moduleType,
      signRequest
    ).subscribe({
      next: (response) => {
        this.loading = false;
        this.showMessage('Document signed successfully!', 'success');
        
        const result: SignatureDialogResult = {
          success: true,
          signedDocumentId: response.signedDocumentId,
          pdfUrl: response.pdfUrl,
          fileName: response.fileName
        };
        
        this.dialogRef.close(result);
      },
      error: (error) => {
        this.loading = false;
        
        if (error.status === 503) {
          this.showMessage(
            'Digital signature feature is not yet available. Your document has been saved as draft.',
            'warning'
          );
          // Close dialog anyway since backend is not ready
          this.dialogRef.close({ success: false });
        } else {
          this.showMessage(
            error.message || 'Failed to sign document. Please try again.',
            'error'
          );
        }
      }
    });
  }

  cancel(): void {
    this.dialogRef.close({ success: false });
  }

  private showMessage(message: string, type: 'success' | 'error' | 'warning'): void {
    this.snackBar.open(message, 'Close', {
      duration: type === 'error' ? 5000 : 3000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: [`snackbar-${type}`]
    });
  }
}
