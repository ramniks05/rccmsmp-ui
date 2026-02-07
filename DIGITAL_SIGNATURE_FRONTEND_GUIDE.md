# Digital Signature Frontend Implementation - Complete Guide

This guide explains how to use the digital signature feature in your Angular application.

---

## Overview

The digital signature feature allows officers to digitally sign documents (Notice, Ordersheet, Judgement) before finalization. The signed documents are converted to PDF with embedded digital signatures.

### Features Implemented

✅ **Digital Signature Service** - Complete API integration  
✅ **Digital Signature Dialog** - User-friendly signature UI  
✅ **Type-safe Models** - TypeScript interfaces for all data  
✅ **Three Signature Methods**:
  - DSC (Digital Signature Certificate)
  - Aadhaar e-Sign (with OTP)
  - Biometric (placeholder for future)

✅ **Certificate Management** - Upload and manage officer certificates  
✅ **PDF Download** - Download signed documents  
✅ **Signature Verification** - Verify signature validity  

---

## Files Created

### 1. Models (Type Definitions)
**Location**: `src/app/shared/models/digital-signature.model.ts`

Defines all TypeScript interfaces for:
- `SignDocumentRequest`
- `SignedDocumentResponse`
- `SignatureVerificationResult`
- `CertificateStatusResponse`
- `ApiResponse<T>`

### 2. Service (API Integration)
**Location**: `src/app/shared/services/digital-signature.service.ts`

Provides methods for:
- `signDocument()` - Sign a document
- `downloadSignedDocument()` - Download signed PDF
- `verifySignature()` - Verify digital signature
- `getCertificateStatus()` - Check officer's certificate status
- `uploadCertificate()` - Upload certificate (Admin)

### 3. Dialog Component (UI)
**Location**: `src/app/shared/components/digital-signature-dialog/`

Files:
- `digital-signature-dialog.component.ts` - Component logic
- `digital-signature-dialog.component.html` - Template
- `digital-signature-dialog.component.scss` - Styles

Provides UI for:
- Signature method selection
- Certificate password input
- Aadhaar OTP verification
- Document preview
- Signature details (reason, location)

---

## How to Use

### Step 1: Import in Your Module

The `DigitalSignatureDialogComponent` is already declared in `SharedModule`, so you just need to import `SharedModule` in your feature module.

**Example (Officer Module):**

```typescript
import { SharedModule } from '../shared/shared.module';

@NgModule({
  declarations: [
    // your components
  ],
  imports: [
    SharedModule,  // This includes the digital signature dialog
    // other imports
  ]
})
export class OfficerModule { }
```

### Step 2: Inject Service and Dialog in Component

**Example Component (`hearing-form.component.ts`):**

```typescript
import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DigitalSignatureService } from '../../shared/services/digital-signature.service';
import { 
  DigitalSignatureDialogComponent,
  SignatureDialogData,
  SignatureDialogResult
} from '../../shared/components/digital-signature-dialog/digital-signature-dialog.component';

@Component({
  selector: 'app-hearing-form',
  templateUrl: './hearing-form.component.html',
  styleUrls: ['./hearing-form.component.scss']
})
export class HearingFormComponent {
  caseId: number = 123; // from route params
  moduleType: 'NOTICE' | 'ORDERSHEET' | 'JUDGEMENT' = 'NOTICE';
  documentContent: string = '<p>Your document content here...</p>';
  
  constructor(
    private dialog: MatDialog,
    private digitalSignatureService: DigitalSignatureService,
    private snackBar: MatSnackBar
  ) {}

  finalizeAndSign(): void {
    // Open signature dialog
    const dialogRef = this.dialog.open(DigitalSignatureDialogComponent, {
      width: '700px',
      data: {
        caseId: this.caseId,
        moduleType: this.moduleType,
        documentContent: this.documentContent,
        documentPreview: this.documentContent.substring(0, 500) // Optional preview
      } as SignatureDialogData,
      disableClose: true
    });

    // Handle result
    dialogRef.afterClosed().subscribe((result: SignatureDialogResult) => {
      if (result?.success) {
        this.snackBar.open('Document signed successfully!', 'Close', {
          duration: 3000,
          panelClass: ['snackbar-success']
        });
        
        // Download signed PDF
        if (result.signedDocumentId) {
          this.digitalSignatureService.downloadSignedPdf(
            result.signedDocumentId,
            result.fileName
          );
        }
        
        // Refresh or navigate
        this.loadDocumentDetails();
      }
    });
  }

  loadDocumentDetails(): void {
    // Refresh your document data
  }
}
```

### Step 3: Add Button in Template

**Example Template (`hearing-form.component.html`):**

```html
<div class="form-actions">
  <!-- Save Draft Button -->
  <button 
    mat-raised-button 
    color="primary"
    (click)="saveDraft()">
    <mat-icon>save</mat-icon>
    Save Draft
  </button>

  <!-- Finalize & Sign Button -->
  <button 
    mat-raised-button 
    color="accent"
    (click)="finalizeAndSign()"
    [disabled]="!isValid()">
    <mat-icon>how_to_reg</mat-icon>
    Finalize & Sign
  </button>
</div>
```

---

## Complete Integration Example

### Officer Document Editor Component

```typescript
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DigitalSignatureService } from '../../shared/services/digital-signature.service';
import { 
  DigitalSignatureDialogComponent,
  SignatureDialogData 
} from '../../shared/components/digital-signature-dialog/digital-signature-dialog.component';

@Component({
  selector: 'app-document-editor',
  templateUrl: './document-editor.component.html',
  styleUrls: ['./document-editor.component.scss']
})
export class DocumentEditorComponent implements OnInit {
  caseId!: number;
  moduleType: 'NOTICE' | 'ORDERSHEET' | 'JUDGEMENT' = 'NOTICE';
  documentContent: string = '';
  isDocumentSigned: boolean = false;
  signedDocumentId?: number;
  signedPdfUrl?: string;

  constructor(
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private digitalSignatureService: DigitalSignatureService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.caseId = +this.route.snapshot.params['caseId'];
    this.moduleType = this.route.snapshot.params['moduleType'];
    this.loadDocument();
  }

  loadDocument(): void {
    // Load document from backend
    // Check if already signed
  }

  saveDraft(): void {
    // Save document as draft
    this.snackBar.open('Draft saved successfully', 'Close', {
      duration: 2000
    });
  }

  canFinalize(): boolean {
    return this.documentContent && 
           this.documentContent.length > 0 && 
           !this.isDocumentSigned;
  }

  finalizeAndSign(): void {
    if (!this.canFinalize()) {
      this.snackBar.open('Please complete the document before signing', 'Close', {
        duration: 3000,
        panelClass: ['snackbar-error']
      });
      return;
    }

    const dialogRef = this.dialog.open(DigitalSignatureDialogComponent, {
      width: '700px',
      maxWidth: '95vw',
      data: {
        caseId: this.caseId,
        moduleType: this.moduleType,
        documentContent: this.documentContent,
        documentPreview: this.stripHtmlTags(this.documentContent).substring(0, 500)
      } as SignatureDialogData,
      disableClose: true
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result?.success) {
        this.isDocumentSigned = true;
        this.signedDocumentId = result.signedDocumentId;
        this.signedPdfUrl = result.pdfUrl;
        
        this.snackBar.open(
          'Document signed successfully! PDF is downloading...',
          'Close',
          { duration: 3000, panelClass: ['snackbar-success'] }
        );
        
        // Optional: Navigate back or refresh
        // this.router.navigate(['/officer/cases', this.caseId]);
      } else if (result?.success === false) {
        // User cancelled or feature not available
        this.snackBar.open(
          'Signature cancelled. Document saved as draft.',
          'Close',
          { duration: 3000 }
        );
      }
    });
  }

  downloadSignedPdf(): void {
    if (this.signedDocumentId) {
      this.digitalSignatureService.downloadSignedPdf(
        this.signedDocumentId,
        `${this.moduleType}_Case${this.caseId}_Signed.pdf`
      );
    }
  }

  verifySignature(): void {
    if (!this.signedDocumentId) return;

    this.digitalSignatureService.verifySignature(this.signedDocumentId).subscribe({
      next: (result) => {
        const message = result.isValid
          ? `Valid signature by ${result.signedBy} on ${result.signedAt}`
          : 'Invalid signature or document has been tampered';
        
        this.snackBar.open(message, 'Close', {
          duration: 5000,
          panelClass: [result.isValid ? 'snackbar-success' : 'snackbar-error']
        });
      },
      error: (error) => {
        this.snackBar.open(
          error.message || 'Failed to verify signature',
          'Close',
          { duration: 3000, panelClass: ['snackbar-error'] }
        );
      }
    });
  }

  private stripHtmlTags(html: string): string {
    const tmp = document.createElement('DIV');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  }
}
```

### Template

```html
<div class="document-editor">
  <h2>{{ moduleType }} - Case #{{ caseId }}</h2>

  <!-- Document Status Badge -->
  <mat-chip-set *ngIf="isDocumentSigned" class="status-chips">
    <mat-chip class="status-signed">
      <mat-icon>verified</mat-icon>
      Digitally Signed
    </mat-chip>
  </mat-chip-set>

  <!-- Rich Text Editor -->
  <app-rich-text-editor
    [(content)]="documentContent"
    [placeholder]="'Enter ' + moduleType + ' content...'"
    [height]="'600px'"
    [readOnly]="isDocumentSigned">
  </app-rich-text-editor>

  <!-- Actions -->
  <div class="action-buttons">
    <!-- Save Draft -->
    <button 
      mat-raised-button 
      color="primary"
      (click)="saveDraft()"
      [disabled]="isDocumentSigned">
      <mat-icon>save</mat-icon>
      Save Draft
    </button>

    <!-- Finalize & Sign -->
    <button 
      mat-raised-button 
      color="accent"
      (click)="finalizeAndSign()"
      [disabled]="!canFinalize()">
      <mat-icon>how_to_reg</mat-icon>
      Finalize & Sign
    </button>

    <!-- Download Signed PDF -->
    <button 
      *ngIf="isDocumentSigned && signedDocumentId"
      mat-raised-button 
      color="primary"
      (click)="downloadSignedPdf()">
      <mat-icon>download</mat-icon>
      Download Signed PDF
    </button>

    <!-- Verify Signature -->
    <button 
      *ngIf="isDocumentSigned"
      mat-stroked-button
      (click)="verifySignature()">
      <mat-icon>verified_user</mat-icon>
      Verify Signature
    </button>
  </div>
</div>
```

---

## Admin: Upload Officer Certificate

### Admin Component Example

```typescript
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DigitalSignatureService } from '../../shared/services/digital-signature.service';

@Component({
  selector: 'app-officer-certificate-upload',
  templateUrl: './officer-certificate-upload.component.html'
})
export class OfficerCertificateUploadComponent {
  uploadForm: FormGroup;
  selectedFile: File | null = null;
  uploading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private digitalSignatureService: DigitalSignatureService,
    private snackBar: MatSnackBar
  ) {
    this.uploadForm = this.fb.group({
      officerId: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(4)]]
    });
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file && (file.name.endsWith('.pfx') || file.name.endsWith('.p12'))) {
      this.selectedFile = file;
    } else {
      this.snackBar.open('Please select a valid .pfx or .p12 certificate file', 'Close', {
        duration: 3000,
        panelClass: ['snackbar-error']
      });
    }
  }

  uploadCertificate(): void {
    if (!this.uploadForm.valid || !this.selectedFile) return;

    this.uploading = true;
    const { officerId, password } = this.uploadForm.value;

    this.digitalSignatureService.uploadCertificate(officerId, this.selectedFile, password)
      .subscribe({
        next: (response) => {
          this.uploading = false;
          this.snackBar.open('Certificate uploaded successfully!', 'Close', {
            duration: 3000,
            panelClass: ['snackbar-success']
          });
          this.uploadForm.reset();
          this.selectedFile = null;
        },
        error: (error) => {
          this.uploading = false;
          this.snackBar.open(
            error.message || 'Failed to upload certificate',
            'Close',
            { duration: 3000, panelClass: ['snackbar-error'] }
          );
        }
      });
  }
}
```

---

## API Endpoints Reference

### 1. Sign Document
```
POST /api/cases/{caseId}/documents/{moduleType}/sign
```

### 2. Download Signed PDF
```
GET /api/documents/signed/{signedDocumentId}/download
```

### 3. Verify Signature
```
GET /api/documents/signed/{signedDocumentId}/verify
```

### 4. Get Certificate Status
```
GET /api/officers/me/certificate
```

### 5. Upload Certificate (Admin)
```
POST /api/admin/officers/{officerId}/certificate
```

---

## Error Handling

The service automatically handles:
- **503 Service Unavailable** - Feature not yet implemented
- **401 Unauthorized** - Invalid/expired token
- **400 Bad Request** - Validation errors
- **404 Not Found** - Resource not found

All errors are gracefully handled and user-friendly messages are displayed.

---

## Backend Status

⚠️ **Important**: The backend endpoints are currently scaffolded and return **503 Service Unavailable**. The frontend is fully implemented and ready to work once the backend implements the actual digital signature logic.

When the backend is ready:
1. Implement PDF generation from HTML
2. Implement digital signature embedding
3. Implement certificate management
4. Update endpoints to return actual responses

The frontend will automatically work without any changes once the backend is ready.

---

## Testing Checklist

### Frontend Testing (Before Backend Ready)

- ☑ Dialog opens correctly
- ☑ Certificate status check handles 503 error gracefully
- ☑ Signature method selection works
- ☑ DSC password field validation
- ☑ Aadhaar OTP flow (simulated)
- ☑ Document preview displays correctly
- ☑ Sign button enables/disables correctly
- ☑ Error messages display properly
- ☑ Dialog closes on cancel
- ☑ Loading states work correctly

### Integration Testing (After Backend Ready)

- ☐ Actual certificate upload
- ☐ Real certificate status retrieval
- ☐ Document signing with DSC
- ☐ PDF download
- ☐ Signature verification
- ☐ Aadhaar e-Sign integration (if available)
- ☐ Error handling for various scenarios
- ☐ Concurrent signing attempts
- ☐ Certificate expiry handling

---

## Styling Notes

The dialog uses Angular Material theming and is fully responsive. Custom styles are in `digital-signature-dialog.component.scss`.

Color scheme:
- Primary: `#1e88e5` (Blue)
- Accent: As per your theme
- Success: `#4caf50`
- Warning: `#ff9800`
- Error: `#f44336`

---

## Next Steps

1. ✅ Frontend implementation complete
2. ⏳ Backend implementation (refer to `BACKEND_IMPLEMENTATION_PROMPT.md`)
3. ⏳ Testing with real certificates
4. ⏳ Aadhaar e-Sign integration (optional)
5. ⏳ Biometric integration (future)

---

## Support & Questions

For questions or issues:
1. Check this documentation first
2. Refer to `BACKEND_IMPLEMENTATION_PROMPT.md` for backend details
3. Check `DIGITAL_SIGNATURE_ARCHITECTURE.md` for overall architecture

---

## Changelog

**v1.0.0** - Initial Implementation
- Digital signature service
- Signature dialog component
- Type-safe models
- Complete API integration
- Error handling
- Graceful degradation for unimplemented backend
