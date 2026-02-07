# Digital Signature Architecture for Documents

## Overview
Implementation plan for digital signatures on Notice, Ordersheet, and Judgement documents before finalization.

## System Architecture

### High-Level Flow
```
1. Officer creates document (Notice/Ordersheet/Judgement)
   ↓
2. Officer reviews and clicks "Finalize & Sign"
   ↓
3. System prompts for digital signature (OTP/Certificate/Biometric)
   ↓
4. Backend applies digital signature to document
   ↓
5. Document is converted to PDF with embedded signature
   ↓
6. Signed PDF is stored permanently
   ↓
7. Document status changes to "FINALIZED"
   ↓
8. Document can be downloaded with valid signature
```

## Components Required

### Frontend Components

#### 1. Digital Signature Dialog Component
**File**: `src/app/shared/components/digital-signature-dialog/`
```typescript
@Component({
  selector: 'app-digital-signature-dialog',
  template: `
    <!-- Signature method selection -->
    <!-- OTP verification OR Certificate upload OR Biometric -->
    <!-- Preview document before signing -->
    <!-- Sign button -->
  `
})
export class DigitalSignatureDialogComponent {
  signatureMethods = ['AADHAAR_OTP', 'DSC_CERTIFICATE', 'BIOMETRIC'];
  selectedMethod: string;
  
  // Handle signature verification
  verifyAndSign(): void {
    // Send to backend for signing
  }
}
```

#### 2. Document Editor Component (Enhanced)
**Update**: `src/app/officer/document-editor/document-editor.component.ts`

```typescript
export class DocumentEditorComponent {
  documentStatus: 'DRAFT' | 'READY_FOR_SIGN' | 'SIGNED' | 'FINALIZED';
  
  // Finalize button triggers signature dialog
  finalizeDocument(): void {
    if (this.validateDocument()) {
      this.openSignatureDialog();
    }
  }
  
  openSignatureDialog(): void {
    const dialogRef = this.dialog.open(DigitalSignatureDialogComponent, {
      data: {
        documentId: this.documentId,
        documentType: this.moduleType,
        documentContent: this.content
      }
    });
    
    dialogRef.afterClosed().subscribe(result => {
      if (result?.success) {
        this.handleSignedDocument(result.signedDocumentId);
      }
    });
  }
}
```

### Backend Components (Java)

#### 1. Digital Signature Service
```java
@Service
public class DigitalSignatureService {
    
    /**
     * Sign document with officer's digital signature
     */
    public SignedDocumentResponse signDocument(
        Long documentId,
        Long officerId,
        SignatureMethod method,
        SignatureCredentials credentials
    ) throws SignatureException {
        // 1. Retrieve document content
        // 2. Generate PDF from HTML content
        // 3. Apply digital signature
        // 4. Store signed PDF
        // 5. Update document status
        // 6. Return signed document info
    }
    
    /**
     * Verify digital signature
     */
    public boolean verifySignature(Long signedDocumentId) {
        // Verify certificate validity
        // Check signature integrity
        // Return verification status
    }
}
```

#### 2. PDF Generation Service
```java
@Service
public class PdfGenerationService {
    
    /**
     * Convert HTML content to PDF
     */
    public byte[] htmlToPdf(String htmlContent, DocumentMetadata metadata) {
        // Use iText or Apache PDFBox
        // Apply template styling
        // Add headers/footers
        // Return PDF bytes
    }
    
    /**
     * Apply digital signature to PDF
     */
    public byte[] signPdf(
        byte[] pdfBytes,
        X509Certificate certificate,
        PrivateKey privateKey,
        String reason,
        String location
    ) throws Exception {
        // Use iText PDF signing
        // Embed certificate
        // Add signature metadata
        // Return signed PDF
    }
}
```

#### 3. Certificate Management Service
```java
@Service
public class CertificateManagementService {
    
    /**
     * Get officer's certificate
     */
    public OfficerCertificate getCertificate(Long officerId) {
        // Retrieve from database or HSM
        // Validate expiry
        // Return certificate
    }
    
    /**
     * Upload and store certificate
     */
    public void storeCertificate(
        Long officerId,
        MultipartFile certificateFile,
        String password
    ) {
        // Validate certificate
        // Store securely (encrypted)
        // Link to officer
    }
}
```

## Database Schema

### New Tables Required

#### 1. Officer Certificates Table
```sql
CREATE TABLE officer_certificates (
    id BIGSERIAL PRIMARY KEY,
    officer_id BIGINT NOT NULL REFERENCES officers(id),
    certificate_type VARCHAR(50) NOT NULL, -- DSC, AADHAAR_BASED, BIOMETRIC
    certificate_data BYTEA, -- Encrypted certificate
    certificate_password_hash VARCHAR(255),
    issuer VARCHAR(255),
    subject VARCHAR(255),
    valid_from TIMESTAMP NOT NULL,
    valid_until TIMESTAMP NOT NULL,
    serial_number VARCHAR(255),
    thumbprint VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 2. Digital Signatures Table
```sql
CREATE TABLE digital_signatures (
    id BIGSERIAL PRIMARY KEY,
    document_id BIGINT NOT NULL,
    document_type VARCHAR(50) NOT NULL, -- NOTICE, ORDERSHEET, JUDGEMENT
    officer_id BIGINT NOT NULL REFERENCES officers(id),
    certificate_id BIGINT REFERENCES officer_certificates(id),
    signature_method VARCHAR(50) NOT NULL, -- DSC, AADHAAR_OTP, BIOMETRIC
    signature_data BYTEA, -- Digital signature bytes
    signature_timestamp TIMESTAMP NOT NULL,
    signature_reason VARCHAR(500),
    signature_location VARCHAR(255),
    verification_status VARCHAR(50) DEFAULT 'PENDING',
    verified_at TIMESTAMP,
    ip_address VARCHAR(50),
    user_agent VARCHAR(500),
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 3. Signed Documents Table
```sql
CREATE TABLE signed_documents (
    id BIGSERIAL PRIMARY KEY,
    original_document_id BIGINT NOT NULL,
    document_type VARCHAR(50) NOT NULL,
    case_id BIGINT NOT NULL REFERENCES cases(id),
    signed_pdf_path VARCHAR(500) NOT NULL,
    signed_pdf_hash VARCHAR(255) NOT NULL,
    file_size BIGINT,
    signature_id BIGINT REFERENCES digital_signatures(id),
    status VARCHAR(50) DEFAULT 'SIGNED',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT REFERENCES officers(id)
);
```

## Signature Methods

### Method 1: DSC (Digital Signature Certificate)
**Best for**: Government officers with official DSC

```
Flow:
1. Officer uploads DSC (.pfx/.p12 file) once
2. Stores encrypted in database
3. At signing: Enter password → Unlock certificate → Sign
4. Most secure and legally valid
```

### Method 2: Aadhaar-based e-Sign
**Best for**: Officers without DSC

```
Flow:
1. Officer enters Aadhaar number
2. System sends OTP to registered mobile
3. Officer enters OTP
4. Backend calls e-Sign API (ESP provider)
5. Document is signed with Aadhaar e-Sign
```

### Method 3: Biometric (Future)
**Best for**: Court premises with biometric devices

```
Flow:
1. Officer places finger on device
2. Biometric captured
3. Verified against registered fingerprint
4. Document signed with biometric-linked certificate
```

## API Endpoints (Backend)

### 1. Certificate Management

```java
// Upload officer certificate
POST /api/admin/officers/{officerId}/certificate
Content-Type: multipart/form-data
Body: {
  certificateFile: <.pfx/.p12 file>,
  password: "encrypted_password",
  certificateType: "DSC"
}

Response: {
  "success": true,
  "message": "Certificate uploaded successfully",
  "data": {
    "certificateId": 1,
    "validFrom": "2024-01-01",
    "validUntil": "2026-12-31",
    "issuer": "Controller of Certifying Authorities"
  }
}
```

```java
// Get officer certificate status
GET /api/officers/me/certificate

Response: {
  "success": true,
  "data": {
    "hasCertificate": true,
    "certificateType": "DSC",
    "validUntil": "2026-12-31",
    "status": "ACTIVE"
  }
}
```

### 2. Document Signing

```java
// Initiate document signing
POST /api/cases/{caseId}/documents/{documentType}/sign
Headers: {
  "X-Officer-Id": "123"
}
Body: {
  "documentContent": "<html>...</html>",
  "signatureMethod": "DSC",
  "certificatePassword": "encrypted_password",  // For DSC
  "reason": "Document finalized and approved",
  "location": "Court Name"
}

Response: {
  "success": true,
  "message": "Document signed successfully",
  "data": {
    "signedDocumentId": 456,
    "signatureId": 789,
    "pdfUrl": "/api/documents/signed/456/download",
    "signatureTimestamp": "2026-01-26T10:30:00",
    "status": "SIGNED"
  }
}
```

```java
// For Aadhaar e-Sign: Request OTP
POST /api/cases/{caseId}/documents/{documentType}/sign/request-otp
Body: {
  "aadhaarNumber": "XXXX-XXXX-1234",
  "documentContent": "<html>...</html>"
}

Response: {
  "success": true,
  "message": "OTP sent to registered mobile",
  "data": {
    "transactionId": "TXN123456",
    "expiresIn": 300  // seconds
  }
}

// Verify OTP and sign
POST /api/cases/{caseId}/documents/{documentType}/sign/verify-otp
Body: {
  "transactionId": "TXN123456",
  "otp": "123456"
}

Response: {
  "success": true,
  "message": "Document signed with Aadhaar e-Sign",
  "data": {
    "signedDocumentId": 456,
    "signatureId": 789,
    "pdfUrl": "/api/documents/signed/456/download"
  }
}
```

### 3. Download Signed Document

```java
// Download signed PDF
GET /api/documents/signed/{signedDocumentId}/download

Response: Binary PDF file with digital signature embedded
Content-Type: application/pdf
Content-Disposition: attachment; filename="Notice_Case123_Signed.pdf"
```

### 4. Verify Signature

```java
// Verify document signature
GET /api/documents/signed/{signedDocumentId}/verify

Response: {
  "success": true,
  "data": {
    "isValid": true,
    "signedBy": "Officer Name",
    "signedAt": "2026-01-26T10:30:00",
    "certificateValid": true,
    "certificateExpiry": "2026-12-31",
    "tamperedStatus": "NOT_TAMPERED"
  }
}
```

## Security Considerations

### 1. Certificate Storage
```java
// Encrypt certificates before storing
@Service
public class EncryptionService {
    
    @Value("${signature.encryption.key}")
    private String encryptionKey;
    
    public byte[] encryptCertificate(byte[] certificate) {
        // Use AES-256 encryption
        // Store IV separately
        // Return encrypted bytes
    }
    
    public byte[] decryptCertificate(byte[] encrypted, byte[] iv) {
        // Decrypt for signing operation
        // Never expose decrypted cert
        // Use only in memory
    }
}
```

### 2. Password Handling
```java
// Never store plain passwords
@Service
public class PasswordService {
    
    public String hashPassword(String password) {
        // Use BCrypt or Argon2
        return BCrypt.hashpw(password, BCrypt.gensalt());
    }
    
    public boolean verifyPassword(String password, String hash) {
        return BCrypt.checkpw(password, hash);
    }
}
```

### 3. Audit Trail
```java
// Log all signature operations
@Entity
public class SignatureAuditLog {
    private Long id;
    private Long documentId;
    private Long officerId;
    private String action; // SIGN_INITIATED, SIGN_SUCCESS, SIGN_FAILED, VERIFY
    private String ipAddress;
    private String userAgent;
    private LocalDateTime timestamp;
    private String details; // JSON
}
```

## Integration Options

### Option 1: Government e-Sign (Recommended)
**Provider**: e-Sign from e-Mudhra, NCode, eMudhra etc.
**Standard**: Government of India e-Sign framework

**Advantages:**
- ✅ Government approved
- ✅ Legally valid
- ✅ Aadhaar-based (no certificate needed)
- ✅ Easy for officers

**Implementation:**
- Integrate with ESP (e-Sign Service Provider)
- Use their SDK/API
- Pay per signature

### Option 2: Traditional DSC
**Provider**: Licensed CA (Certifying Authority)
**Standard**: X.509 certificates

**Advantages:**
- ✅ Offline signing possible
- ✅ Organization-controlled
- ✅ No per-signature cost

**Disadvantages:**
- ❌ Officers need to obtain DSC
- ❌ Certificate management overhead
- ❌ Renewal required

### Option 3: Hybrid (Best Approach)
**Support both methods:**
- DSC for officers who have it
- Aadhaar e-Sign for others
- Flexibility for users

## Workflow States

### Document Lifecycle with Signing

```
DRAFT
  ↓ (Officer edits)
READY_FOR_REVIEW
  ↓ (Officer reviews)
PENDING_SIGNATURE
  ↓ (Digital signature applied)
SIGNED
  ↓ (Auto-transition)
FINALIZED
  ↓ (Optional: Send to party)
DELIVERED
```

### Status Transitions

```java
public enum DocumentStatus {
    DRAFT,              // Being edited
    READY_FOR_REVIEW,   // Content complete
    PENDING_SIGNATURE,  // Waiting for signature
    SIGNED,             // Digitally signed
    FINALIZED,          // Final and immutable
    DELIVERED,          // Sent to concerned party
    ARCHIVED            // Old version archived
}
```

## Document Format

### Storage Strategy

#### Option A: Dual Storage (Recommended)
```
1. Store HTML content (editable, in database)
   - For display/preview
   - For regeneration if needed
   
2. Store signed PDF (immutable, in file storage)
   - With embedded digital signature
   - Legal copy
   - For download/print
```

#### Option B: PDF Only
```
1. Convert HTML to PDF immediately after signing
2. Store only signed PDF
3. Extract text for search/display if needed
```

### File Storage Structure
```
/documents/
  /{year}/
    /{month}/
      /signed/
        /notice/
          Case_123_Notice_20260126_Signed.pdf
        /ordersheet/
          Case_123_Ordersheet_20260126_Signed.pdf
        /judgement/
          Case_123_Judgement_20260126_Signed.pdf
```

## Frontend Implementation

### 1. Document Editor with Sign Button

```typescript
// document-editor.component.ts
export class DocumentEditorComponent {
  documentId?: number;
  content: string = '';
  status: DocumentStatus = 'DRAFT';
  isSigned: boolean = false;
  signedPdfUrl?: string;
  
  canFinalize(): boolean {
    return this.content && 
           this.content.length > 0 && 
           this.status !== 'FINALIZED' &&
           !this.isSigned;
  }
  
  async finalizeAndSign(): Promise<void> {
    // Step 1: Validate document
    if (!this.validateDocument()) {
      return;
    }
    
    // Step 2: Check officer has certificate/signature method
    const hasCertificate = await this.checkOfficerCertificate();
    
    // Step 3: Open signature dialog
    const signatureData = await this.openSignatureDialog();
    
    if (signatureData) {
      // Step 4: Send to backend for signing
      this.signDocument(signatureData);
    }
  }
  
  private signDocument(signatureData: any): void {
    this.loading = true;
    
    this.documentService.signDocument(
      this.caseId,
      this.moduleType,
      {
        content: this.content,
        signatureMethod: signatureData.method,
        credentials: signatureData.credentials
      }
    ).subscribe({
      next: (response) => {
        this.isSigned = true;
        this.status = 'SIGNED';
        this.signedPdfUrl = response.data.pdfUrl;
        this.showMessage('Document signed successfully!', 'success');
        this.loading = false;
      },
      error: (error) => {
        this.showMessage('Signature failed: ' + error.message, 'error');
        this.loading = false;
      }
    });
  }
}
```

### 2. Signature Dialog Component

```typescript
// digital-signature-dialog.component.ts
export class DigitalSignatureDialogComponent {
  signatureMethod: 'DSC' | 'AADHAAR' | 'BIOMETRIC' = 'DSC';
  
  // For DSC
  certificatePassword: string = '';
  
  // For Aadhaar
  aadhaarNumber: string = '';
  otp: string = '';
  otpSent: boolean = false;
  transactionId?: string;
  
  // For document preview
  documentContent: string = '';
  
  async requestAadhaarOtp(): Promise<void> {
    // Call backend to send OTP
    const response = await this.signatureService.requestAadhaarOtp(
      this.data.documentId,
      this.aadhaarNumber
    );
    
    this.otpSent = true;
    this.transactionId = response.transactionId;
  }
  
  async signWithDSC(): Promise<void> {
    // Verify password and sign
    this.dialogRef.close({
      method: 'DSC',
      credentials: {
        password: this.certificatePassword
      }
    });
  }
  
  async signWithAadhaar(): Promise<void> {
    // Verify OTP and sign
    this.dialogRef.close({
      method: 'AADHAAR',
      credentials: {
        aadhaarNumber: this.aadhaarNumber,
        otp: this.otp,
        transactionId: this.transactionId
      }
    });
  }
}
```

### 3. Service Integration

```typescript
// digital-signature.service.ts
@Injectable()
export class DigitalSignatureService {
  
  signDocument(
    caseId: number,
    documentType: string,
    signatureRequest: SignatureRequest
  ): Observable<SignatureResponse> {
    return this.http.post<SignatureResponse>(
      `${this.apiUrl}/cases/${caseId}/documents/${documentType}/sign`,
      signatureRequest
    );
  }
  
  requestAadhaarOtp(
    documentId: number,
    aadhaarNumber: string
  ): Observable<OtpResponse> {
    return this.http.post<OtpResponse>(
      `${this.apiUrl}/documents/${documentId}/sign/request-otp`,
      { aadhaarNumber }
    );
  }
  
  verifySignature(signedDocumentId: number): Observable<VerificationResponse> {
    return this.http.get<VerificationResponse>(
      `${this.apiUrl}/documents/signed/${signedDocumentId}/verify`
    );
  }
  
  downloadSignedDocument(signedDocumentId: number): Observable<Blob> {
    return this.http.get(
      `${this.apiUrl}/documents/signed/${signedDocumentId}/download`,
      { responseType: 'blob' }
    );
  }
}
```

## UI/UX Design

### Document Editor with Sign Button

```html
<!-- document-editor.component.html -->
<div class="document-editor">
  
  <!-- Rich Text Editor -->
  <app-rich-text-editor
    [(content)]="content"
    [placeholder]="'Enter document content...'"
    [height]="'600px'"
    [readOnly]="isSigned"
  ></app-rich-text-editor>
  
  <!-- Document Status -->
  <div class="status-bar">
    <span class="status-badge" [ngClass]="status">
      {{ status }}
    </span>
    
    <span *ngIf="isSigned" class="signed-indicator">
      <mat-icon>verified</mat-icon>
      Digitally Signed
    </span>
  </div>
  
  <!-- Actions -->
  <div class="action-buttons">
    <!-- Save Draft -->
    <button 
      mat-raised-button 
      color="primary"
      (click)="saveDraft()"
      [disabled]="isSigned || loading">
      <mat-icon>save</mat-icon>
      Save Draft
    </button>
    
    <!-- Finalize & Sign -->
    <button 
      mat-raised-button 
      color="accent"
      (click)="finalizeAndSign()"
      [disabled]="!canFinalize() || loading">
      <mat-icon>how_to_reg</mat-icon>
      Finalize & Sign
    </button>
    
    <!-- Download Signed PDF -->
    <button 
      *ngIf="isSigned && signedPdfUrl"
      mat-raised-button 
      color="primary"
      (click)="downloadSignedPdf()">
      <mat-icon>download</mat-icon>
      Download Signed PDF
    </button>
    
    <!-- Verify Signature -->
    <button 
      *ngIf="isSigned"
      mat-stroked-button
      (click)="verifySignature()">
      <mat-icon>verified_user</mat-icon>
      Verify Signature
    </button>
  </div>
</div>
```

### Digital Signature Dialog

```html
<!-- digital-signature-dialog.component.html -->
<h2 mat-dialog-title>Digital Signature</h2>

<mat-dialog-content>
  
  <!-- Signature Method Selection -->
  <mat-radio-group [(ngModel)]="signatureMethod">
    <mat-radio-button value="DSC">
      Digital Signature Certificate (DSC)
    </mat-radio-button>
    <mat-radio-button value="AADHAAR">
      Aadhaar e-Sign
    </mat-radio-button>
  </mat-radio-group>
  
  <!-- DSC Method -->
  <div *ngIf="signatureMethod === 'DSC'" class="method-section">
    <mat-form-field>
      <mat-label>Certificate Password</mat-label>
      <input matInput type="password" [(ngModel)]="certificatePassword">
      <mat-hint>Enter your DSC password to unlock certificate</mat-hint>
    </mat-form-field>
  </div>
  
  <!-- Aadhaar Method -->
  <div *ngIf="signatureMethod === 'AADHAAR'" class="method-section">
    <mat-form-field>
      <mat-label>Aadhaar Number</mat-label>
      <input matInput [(ngModel)]="aadhaarNumber" maxlength="12">
    </mat-form-field>
    
    <button 
      mat-raised-button 
      color="primary"
      (click)="requestAadhaarOtp()"
      [disabled]="!aadhaarNumber || otpSent">
      Send OTP
    </button>
    
    <mat-form-field *ngIf="otpSent">
      <mat-label>Enter OTP</mat-label>
      <input matInput [(ngModel)]="otp" maxlength="6">
    </mat-form-field>
  </div>
  
  <!-- Document Preview -->
  <div class="document-preview">
    <h4>Document Preview</h4>
    <div [innerHTML]="documentContent" class="preview-content"></div>
  </div>
  
</mat-dialog-content>

<mat-dialog-actions align="end">
  <button mat-button (click)="cancel()">Cancel</button>
  <button 
    mat-raised-button 
    color="accent"
    (click)="sign()"
    [disabled]="!canSign()">
    <mat-icon>how_to_reg</mat-icon>
    Sign Document
  </button>
</mat-dialog-actions>
```

## Configuration Required

### application.properties (or application.yml)

```properties
# Digital Signature Configuration
signature.enabled=true
signature.provider=DSC  # or ESIGN or BOTH
signature.storage.path=/var/documents/signed/

# Certificate Encryption
signature.encryption.key=${SIGNATURE_ENCRYPTION_KEY}
signature.encryption.algorithm=AES-256-GCM

# e-Sign Configuration (if using Aadhaar)
esign.provider.url=https://esign-provider.com/api
esign.provider.key=${ESIGN_API_KEY}
esign.provider.secret=${ESIGN_API_SECRET}

# PDF Generation
pdf.generator=ITEXT  # or PDFBOX
pdf.embed.fonts=true
pdf.signature.visible=true
pdf.signature.position=BOTTOM_RIGHT
```

## Third-Party Libraries

### Java Dependencies

```xml
<!-- pom.xml -->
<dependencies>
    <!-- iText for PDF generation and signing -->
    <dependency>
        <groupId>com.itextpdf</groupId>
        <artifactId>itext7-core</artifactId>
        <version>7.2.5</version>
    </dependency>
    
    <!-- Bouncy Castle for cryptography -->
    <dependency>
        <groupId>org.bouncycastle</groupId>
        <artifactId>bcprov-jdk15on</artifactId>
        <version>1.70</version>
    </dependency>
    
    <dependency>
        <groupId>org.bouncycastle</groupId>
        <artifactId>bcpkix-jdk15on</artifactId>
        <version>1.70</version>
    </dependency>
    
    <!-- HTML to PDF conversion -->
    <dependency>
        <groupId>com.itextpdf</groupId>
        <artifactId>html2pdf</artifactId>
        <version>4.0.5</version>
    </dependency>
</dependencies>
```

## Sample Code Structure

### Document Controller
```java
@RestController
@RequestMapping("/api/cases/{caseId}/documents")
public class DocumentController {
    
    @Autowired
    private DigitalSignatureService signatureService;
    
    @Autowired
    private DocumentService documentService;
    
    /**
     * Sign document with digital signature
     */
    @PostMapping("/{documentType}/sign")
    public ResponseEntity<ApiResponse<SignedDocumentResponse>> signDocument(
        @PathVariable Long caseId,
        @PathVariable String documentType,
        @RequestBody SignDocumentRequest request,
        @RequestHeader("X-Officer-Id") Long officerId
    ) {
        try {
            // Validate officer permissions
            // Generate PDF from HTML
            // Apply digital signature
            // Store signed PDF
            // Update document status
            
            SignedDocumentResponse response = signatureService.signDocument(
                caseId, 
                documentType, 
                officerId, 
                request
            );
            
            return ResponseEntity.ok(
                ApiResponse.success("Document signed successfully", response)
            );
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                ApiResponse.error("Signature failed: " + e.getMessage())
            );
        }
    }
    
    /**
     * Download signed PDF
     */
    @GetMapping("/signed/{signedDocumentId}/download")
    public ResponseEntity<Resource> downloadSignedDocument(
        @PathVariable Long signedDocumentId
    ) {
        SignedDocument doc = documentService.getSignedDocument(signedDocumentId);
        
        Resource resource = new FileSystemResource(doc.getFilePath());
        
        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION, 
                "attachment; filename=\"" + doc.getFileName() + "\"")
            .contentType(MediaType.APPLICATION_PDF)
            .body(resource);
    }
}
```

## Testing Checklist

### Backend Testing
```
☐ Upload officer certificate
☐ Sign document with DSC
☐ Sign document with Aadhaar (if integrated)
☐ Verify signature validity
☐ Download signed PDF
☐ Test with expired certificate
☐ Test with tampered document
☐ Test concurrent signing
☐ Test file storage and retrieval
☐ Test signature audit logs
```

### Frontend Testing
```
☐ Create document with rich text editor
☐ Click "Finalize & Sign"
☐ Sign with DSC
☐ Download signed PDF
☐ Open PDF in Adobe Reader - verify signature
☐ Verify signature from UI
☐ Test voice typing in document
☐ Test translation in document
☐ Test placeholder replacement
☐ Test editing after sign (should be disabled)
```

## Security Best Practices

### 1. Certificate Security
- ✅ Encrypt certificates at rest
- ✅ Use HSM (Hardware Security Module) for production
- ✅ Never log certificate passwords
- ✅ Clear sensitive data from memory after use

### 2. Signature Verification
- ✅ Verify certificate chain
- ✅ Check certificate revocation (CRL/OCSP)
- ✅ Validate timestamp authority
- ✅ Detect document tampering

### 3. Access Control
- ✅ Only document creator can sign
- ✅ Verify officer role/permissions
- ✅ Log all signature attempts
- ✅ Rate limit signature operations

### 4. Audit Trail
- ✅ Log who signed what when
- ✅ Store IP address and user agent
- ✅ Immutable audit logs
- ✅ Legal compliance (IT Act 2000)

## Compliance

### Legal Requirements (India)

#### Information Technology Act, 2000
- ✅ Digital signatures must follow IT Act guidelines
- ✅ Certificates from licensed CA
- ✅ Secure key management
- ✅ Audit trail maintenance

#### Controller of Certifying Authorities (CCA)
- ✅ Use CCA-approved certificates
- ✅ Follow prescribed algorithms (RSA 2048+, SHA-256+)
- ✅ Certificate validity checks

#### Evidence Act, 1872 (Amendment)
- ✅ Digital signatures on court documents
- ✅ Electronic records admissibility
- ✅ Proper authentication

## Cost Considerations

### DSC Approach
- **One-time**: Certificate purchase (~₹1000-2000 per officer)
- **Annual**: Renewal (~₹1000 per officer)
- **No per-signature cost**

### e-Sign Approach
- **No upfront cost**
- **Per signature**: ₹2-5 per signature
- **Monthly**: Based on volume

### Recommendation
- Start with DSC (one-time cost)
- Add Aadhaar e-Sign later (scalability)
- Hybrid approach (officer choice)

---

## Summary

**Yes, backend changes needed:**

1. ✅ Add `RICH_TEXT` field type to enum
2. ✅ Create Digital Signature Service
3. ✅ Create PDF Generation Service  
4. ✅ Create Certificate Management
5. ✅ Add database tables for certificates & signatures
6. ✅ Implement signing APIs
7. ✅ Add download signed PDF endpoint
8. ✅ Add signature verification endpoint

**Main work**: Implementing digital signature infrastructure in Java backend.

**Timeline**: 3-5 days for core implementation + testing.
