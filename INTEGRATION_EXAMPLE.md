# Integration Example: Adding Digital Signature to Existing Document Form

This file shows exactly how to add the digital signature feature to your existing document forms (Notice, Ordersheet, Judgement).

---

## Scenario

You have an existing component that creates/edits documents (Notice, Ordersheet, or Judgement). You want to add a "Finalize & Sign" button that opens the digital signature dialog.

---

## Step-by-Step Integration

### 1. Update Your Component TypeScript File

**Example: `notice-form.component.ts`**

```typescript
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

// ADD THESE IMPORTS
import { DigitalSignatureService } from '../../../shared/services/digital-signature.service';
import { 
  DigitalSignatureDialogComponent,
  SignatureDialogData,
  SignatureDialogResult
} from '../../../shared/components/digital-signature-dialog/digital-signature-dialog.component';

@Component({
  selector: 'app-notice-form',
  templateUrl: './notice-form.component.html',
  styleUrls: ['./notice-form.component.scss']
})
export class NoticeFormComponent implements OnInit {
  caseId!: number;
  noticeContent: string = '';
  isSignedindocument: boolean = false;
  signedDocumentId?: number;
  
  // Your existing properties...

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog,  // Probably already here
    private snackBar: MatSnackBar,  // Probably already here
    private digitalSignatureService: DigitalSignatureService  // ADD THIS
    // Your other services...
  ) {}

  ngOnInit(): void {
    this.caseId = +this.route.snapshot.params['caseId'];
    this.loadNoticeData();
  }

  loadNoticeData(): void {
    // Your existing logic to load notice data
  }

  saveDraft(): void {
    // Your existing save draft logic
    this.snackBar.open('Draft saved successfully', 'Close', { duration: 2000 });
  }

  // ADD THIS METHOD
  finalizeAndSign(): void {
    // Validate content
    if (!this.noticeContent || this.noticeContent.trim().length === 0) {
      this.snackBar.open(
        'Please enter notice content before signing',
        'Close',
        { duration: 3000, panelClass: ['snackbar-error'] }
      );
      return;
    }

    // Open signature dialog
    const dialogRef = this.dialog.open(DigitalSignatureDialogComponent, {
      width: '700px',
      maxWidth: '95vw',
      data: {
        caseId: this.caseId,
        moduleType: 'NOTICE',  // Change to 'ORDERSHEET' or 'JUDGEMENT' as needed
        documentContent: this.noticeContent,
        documentPreview: this.noticeContent.substring(0, 500)
      } as SignatureDialogData,
      disableClose: true
    });

    // Handle result
    dialogRef.afterClosed().subscribe((result: SignatureDialogResult) => {
      if (result?.success) {
        // Success! Document is signed
        this.isSignedDocument = true;
        this.signedDocumentId = result.signedDocumentId;
        
        this.snackBar.open(
          'Notice signed successfully! PDF downloaded.',
          'Close',
          { duration: 3000, panelClass: ['snackbar-success'] }
        );
        
        // Optional: Navigate back to case details or list
        // this.router.navigate(['/officer/cases', this.caseId]);
        
        // Or refresh the data
        this.loadNoticeData();
      } else if (result?.success === false) {
        // User cancelled or feature not available
        this.snackBar.open(
          'Signature process cancelled. Document saved as draft.',
          'Close',
          { duration: 3000 }
        );
      }
    });
  }

  // ADD THIS METHOD (Optional - for re-downloading signed PDF)
  downloadSignedPdf(): void {
    if (this.signedDocumentId) {
      this.digitalSignatureService.downloadSignedPdf(
        this.signedDocumentId,
        `Notice_Case${this.caseId}_Signed.pdf`
      );
    }
  }

  // ADD THIS METHOD (Optional - for verifying signature)
  verifySignature(): void {
    if (!this.signedDocumentId) return;

    this.digitalSignatureService.verifySignature(this.signedDocumentId).subscribe({
      next: (result) => {
        const message = result.isValid
          ? `✓ Valid signature by ${result.signedBy} on ${new Date(result.signedAt).toLocaleString()}`
          : '✗ Invalid signature or document tampered';
        
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
}
```

---

### 2. Update Your Component Template

**Example: `notice-form.component.html`**

```html
<div class="notice-form-container">
  <h2>Notice - Case #{{ caseId }}</h2>

  <!-- Document Status Badge (Optional) -->
  <mat-chip-set *ngIf="isSignedDocument" class="mb-3">
    <mat-chip class="signed-chip">
      <mat-icon>verified</mat-icon>
      Digitally Signed
    </mat-chip>
  </mat-chip-set>

  <!-- Your existing form fields... -->
  
  <!-- Rich Text Editor for Notice Content -->
  <app-rich-text-editor
    [(content)]="noticeContent"
    [placeholder]="'Enter notice content...'"
    [height]="'500px'"
    [readOnly]="isSignedDocument">
  </app-rich-text-editor>

  <!-- Action Buttons -->
  <div class="action-buttons">
    <!-- Save Draft Button (Your existing button) -->
    <button 
      mat-raised-button 
      color="primary"
      (click)="saveDraft()"
      [disabled]="isSignedDocument">
      <mat-icon>save</mat-icon>
      Save Draft
    </button>

    <!-- ADD THIS BUTTON: Finalize & Sign -->
    <button 
      mat-raised-button 
      color="accent"
      (click)="finalizeAndSign()"
      [disabled]="isSignedDocument || !noticeContent">
      <mat-icon>how_to_reg</mat-icon>
      Finalize & Sign
    </button>

    <!-- Optional: Download Signed PDF Button -->
    <button 
      *ngIf="isSignedDocument && signedDocumentId"
      mat-raised-button 
      color="primary"
      (click)="downloadSignedPdf()">
      <mat-icon>download</mat-icon>
      Download Signed PDF
    </button>

    <!-- Optional: Verify Signature Button -->
    <button 
      *ngIf="isSignedDocument && signedDocumentId"
      mat-stroked-button
      (click)="verifySignature()">
      <mat-icon>verified_user</mat-icon>
      Verify Signature
    </button>

    <!-- Cancel/Back Button (Your existing button) -->
    <button 
      mat-button
      (click)="goBack()">
      <mat-icon>arrow_back</mat-icon>
      Back
    </button>
  </div>
</div>
```

---

### 3. Add Styles (Optional)

**Example: `notice-form.component.scss`**

```scss
.notice-form-container {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;

  h2 {
    margin-bottom: 1.5rem;
    color: #333;
  }
}

.action-buttons {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
  flex-wrap: wrap;

  button {
    mat-icon {
      margin-right: 0.5rem;
    }
  }
}

.signed-chip {
  background-color: #4caf50 !important;
  color: white !important;
  font-weight: 500;

  mat-icon {
    color: white;
  }
}

// Responsive
@media (max-width: 768px) {
  .notice-form-container {
    padding: 1rem;
  }

  .action-buttons {
    flex-direction: column;
    width: 100%;

    button {
      width: 100%;
    }
  }
}
```

---

## For Ordersheet and Judgement

### Ordersheet Form (`ordersheet-form.component.ts`)

Change only this line:
```typescript
data: {
  caseId: this.caseId,
  moduleType: 'ORDERSHEET',  // <-- Change this
  documentContent: this.ordersheetContent,  // <-- Your property name
  documentPreview: this.ordersheetContent.substring(0, 500)
}
```

### Judgement Form (`judgement-form.component.ts`)

Change only this line:
```typescript
data: {
  caseId: this.caseId,
  moduleType: 'JUDGEMENT',  // <-- Change this
  documentContent: this.judgementContent,  // <-- Your property name
  documentPreview: this.judgementContent.substring(0, 500)
}
```

---

## Common Patterns

### Pattern 1: Sign After Validation

```typescript
finalizeAndSign(): void {
  // Validate all required fields
  if (!this.validateForm()) {
    this.snackBar.open('Please fill all required fields', 'Close', {
      duration: 3000,
      panelClass: ['snackbar-error']
    });
    return;
  }

  // Check word count (example)
  if (this.noticeContent.length < 100) {
    this.snackBar.open('Notice content is too short', 'Close', {
      duration: 3000,
      panelClass: ['snackbar-error']
    });
    return;
  }

  // Open signature dialog
  this.openSignatureDialog();
}
```

### Pattern 2: Save Before Signing

```typescript
finalizeAndSign(): void {
  // Save draft first
  this.saveDraft();

  // Wait a moment then sign
  setTimeout(() => {
    this.openSignatureDialog();
  }, 500);
}

private openSignatureDialog(): void {
  const dialogRef = this.dialog.open(DigitalSignatureDialogComponent, {
    width: '700px',
    data: { /* your data */ } as SignatureDialogData
  });

  dialogRef.afterClosed().subscribe((result) => {
    if (result?.success) {
      // Handle success
    }
  });
}
```

### Pattern 3: Navigate After Signing

```typescript
dialogRef.afterClosed().subscribe((result: SignatureDialogResult) => {
  if (result?.success) {
    this.snackBar.open('Document signed successfully!', 'Close', {
      duration: 2000,
      panelClass: ['snackbar-success']
    });

    // Navigate back to case details after 2 seconds
    setTimeout(() => {
      this.router.navigate(['/officer/cases', this.caseId]);
    }, 2000);
  }
});
```

---

## Testing Your Integration

### Before Backend is Ready

1. Click "Finalize & Sign" button
2. Dialog opens
3. Shows "Checking certificate status..."
4. Then shows "Digital signature feature is not yet available"
5. You can still interact with the dialog
6. When you click "Sign Document", it will show message and close

### After Backend is Ready

1. Click "Finalize & Sign" button
2. Dialog opens
3. Shows your certificate status (if you have one)
4. Select signature method
5. Enter password/OTP
6. Click "Sign Document"
7. PDF downloads automatically
8. Document marked as signed
9. Can download PDF again anytime
10. Can verify signature

---

## Troubleshooting

### Dialog doesn't open
- Check that `MatDialog` is injected in constructor
- Check that `SharedModule` is imported in your feature module

### "Digital signature feature is not yet available" always shows
- This is expected! Backend is not implemented yet
- Frontend is working correctly
- Will work automatically when backend is ready

### Styling looks wrong
- Make sure you imported Angular Material theme in `styles.scss`
- Dialog inherits global styles

### Type errors
- Make sure you imported the types:
  ```typescript
  import { 
    SignatureDialogData,
    SignatureDialogResult
  } from '../../shared/components/digital-signature-dialog/digital-signature-dialog.component';
  ```

---

## Summary

**You only need to do 3 things:**

1. **Import the service and component**
2. **Add the `finalizeAndSign()` method**
3. **Add the "Finalize & Sign" button**

That's it! The dialog handles everything else, including:
- Certificate checking
- Signature method selection
- Password/OTP handling
- Document preview
- Loading states
- Error handling
- Backend communication

Simple and clean integration! 🎉
