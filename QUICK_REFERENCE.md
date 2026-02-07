# Digital Signature - Quick Reference Card

## 🚀 Quick Start (Copy-Paste Ready)

### 1. Import in Your Component

```typescript
import { MatDialog } from '@angular/material/dialog';
import { DigitalSignatureService } from '../../shared/services/digital-signature.service';
import { 
  DigitalSignatureDialogComponent,
  SignatureDialogData,
  SignatureDialogResult
} from '../../shared/components/digital-signature-dialog/digital-signature-dialog.component';
```

### 2. Inject in Constructor

```typescript
constructor(
  private dialog: MatDialog,
  private digitalSignatureService: DigitalSignatureService
) {}
```

### 3. Open Dialog Method

```typescript
finalizeAndSign(): void {
  const dialogRef = this.dialog.open(DigitalSignatureDialogComponent, {
    width: '700px',
    data: {
      caseId: this.caseId,
      moduleType: 'NOTICE', // or 'ORDERSHEET', 'JUDGEMENT'
      documentContent: this.content,
      documentPreview: this.content.substring(0, 500)
    } as SignatureDialogData
  });

  dialogRef.afterClosed().subscribe((result: SignatureDialogResult) => {
    if (result?.success) {
      console.log('Signed!', result.signedDocumentId);
    }
  });
}
```

### 4. Template Button

```html
<button mat-raised-button color="accent" (click)="finalizeAndSign()">
  <mat-icon>how_to_reg</mat-icon>
  Finalize & Sign
</button>
```

---

## 📋 API Methods

### Sign Document
```typescript
this.digitalSignatureService.signDocument(caseId, moduleType, request)
  .subscribe(response => {
    console.log('Signed:', response.signedDocumentId);
  });
```

### Download PDF
```typescript
this.digitalSignatureService.downloadSignedPdf(signedDocumentId, 'filename.pdf');
```

### Verify Signature
```typescript
this.digitalSignatureService.verifySignature(signedDocumentId)
  .subscribe(result => {
    console.log('Valid:', result.isValid);
  });
```

### Check Certificate
```typescript
this.digitalSignatureService.getCertificateStatus()
  .subscribe(status => {
    console.log('Has cert:', status.hasCertificate);
  });
```

---

## 🎨 Dialog Data Structure

```typescript
// Input data
interface SignatureDialogData {
  caseId: number;                 // Required
  moduleType: 'NOTICE' | 'ORDERSHEET' | 'JUDGEMENT';  // Required
  documentContent: string;        // Required - HTML content to sign
  documentPreview?: string;       // Optional - Preview text
}

// Output result
interface SignatureDialogResult {
  success: boolean;               // Was signing successful?
  signedDocumentId?: number;      // ID of signed document
  pdfUrl?: string;                // URL to download PDF
  fileName?: string;              // Suggested filename
}
```

---

## ⚙️ Service Methods Reference

| Method | Parameters | Returns | Purpose |
|--------|-----------|---------|---------|
| `signDocument()` | caseId, moduleType, request | Observable<SignedDocumentResponse> | Sign document |
| `downloadSignedDocument()` | signedDocumentId | Observable<Blob> | Get PDF blob |
| `downloadSignedPdf()` | signedDocumentId, fileName | void | Trigger download |
| `verifySignature()` | signedDocumentId | Observable<VerificationResult> | Verify signature |
| `getCertificateStatus()` | - | Observable<CertificateStatus> | Check certificate |
| `uploadCertificate()` | officerId, file, password | Observable<UploadResponse> | Upload cert (Admin) |

---

## 🔧 Common Patterns

### Pattern: With Validation
```typescript
finalizeAndSign(): void {
  if (!this.content || this.content.length < 50) {
    this.snackBar.open('Content too short', 'Close', { duration: 3000 });
    return;
  }
  this.openSignatureDialog();
}
```

### Pattern: Navigate After Success
```typescript
dialogRef.afterClosed().subscribe(result => {
  if (result?.success) {
    this.snackBar.open('Signed!', 'Close', { duration: 2000 });
    setTimeout(() => {
      this.router.navigate(['/officer/cases', this.caseId]);
    }, 2000);
  }
});
```

### Pattern: Download Again
```typescript
redownloadPdf(): void {
  if (this.signedDocumentId) {
    this.digitalSignatureService.downloadSignedPdf(
      this.signedDocumentId,
      `Document_${this.signedDocumentId}.pdf`
    );
  }
}
```

---

## 🎯 Module Types

```typescript
type ModuleType = 'NOTICE' | 'ORDERSHEET' | 'JUDGEMENT';

// Use in dialog:
data: {
  moduleType: 'NOTICE',  // For notice
  // or
  moduleType: 'ORDERSHEET',  // For ordersheet
  // or
  moduleType: 'JUDGEMENT'  // For judgement
}
```

---

## 🛡️ Error Handling

```typescript
this.digitalSignatureService.signDocument(caseId, moduleType, request)
  .subscribe({
    next: (response) => {
      // Success
      console.log('Signed:', response);
    },
    error: (error) => {
      // Error
      if (error.status === 503) {
        // Feature not implemented
        this.snackBar.open('Feature not yet available', 'Close');
      } else {
        // Other error
        this.snackBar.open(error.message, 'Close');
      }
    }
  });
```

---

## 📱 Responsive Dialog

```typescript
// Default (Desktop)
this.dialog.open(DigitalSignatureDialogComponent, {
  width: '700px'
});

// Responsive (Mobile-friendly)
this.dialog.open(DigitalSignatureDialogComponent, {
  width: '700px',
  maxWidth: '95vw',  // Add this for mobile
  maxHeight: '95vh'  // Add this for mobile
});
```

---

## 🎨 Custom Styling

Add to your component SCSS:

```scss
::ng-deep .signature-dialog {
  .mat-dialog-container {
    padding: 0;
  }
}
```

---

## ✅ Checklist

Before using digital signature:
- [ ] `SharedModule` imported in your feature module
- [ ] `MatDialog` injected in component
- [ ] `DigitalSignatureService` injected in component
- [ ] Dialog data includes `caseId`, `moduleType`, `documentContent`
- [ ] Handle `afterClosed()` subscription
- [ ] Test with backend unavailable (503 error)

---

## 🐛 Common Issues

| Issue | Solution |
|-------|----------|
| Dialog doesn't open | Check `MatDialog` injection |
| "Feature not available" | Expected - backend not ready yet |
| Type errors | Import `SignatureDialogData` and `SignatureDialogResult` |
| Dialog too small | Add `maxWidth: '95vw'` for mobile |
| Can't inject service | `DigitalSignatureService` is `providedIn: 'root'` - should work |

---

## 📚 Documentation Files

1. **`INTEGRATION_EXAMPLE.md`** - Step-by-step integration example
2. **`DIGITAL_SIGNATURE_FRONTEND_GUIDE.md`** - Complete implementation guide
3. **`DIGITAL_SIGNATURE_INTEGRATION_SUMMARY.md`** - High-level summary
4. **`BACKEND_IMPLEMENTATION_PROMPT.md`** - Backend implementation guide
5. **`DIGITAL_SIGNATURE_ARCHITECTURE.md`** - System architecture
6. **`QUICK_REFERENCE.md`** - This file

---

## 💡 Pro Tips

1. **Validate before signing** - Check content is complete
2. **Save draft first** - Save before opening dialog
3. **Show loading states** - Use MatProgressSpinner during operations
4. **Handle 503 gracefully** - Backend may not be ready
5. **Test error cases** - Invalid password, expired certificate, etc.
6. **Mobile-friendly** - Use `maxWidth: '95vw'` for dialog
7. **Accessibility** - Dialog handles keyboard navigation
8. **Type-safe** - Always use provided interfaces

---

## 🚀 Production Checklist

Before going to production:
- [ ] Backend APIs implemented and tested
- [ ] Officers have uploaded certificates
- [ ] Test with real certificates
- [ ] Test PDF download in Adobe Reader
- [ ] Test signature verification
- [ ] Test on mobile devices
- [ ] Test error scenarios
- [ ] HTTPS enabled
- [ ] Certificate expiry notifications
- [ ] Audit logging enabled

---

## 📞 Need Help?

1. Check `INTEGRATION_EXAMPLE.md` for examples
2. Check `DIGITAL_SIGNATURE_FRONTEND_GUIDE.md` for details
3. Check console for error messages
4. Verify backend endpoints with Postman

---

**That's it! You're ready to integrate digital signatures! 🎉**
