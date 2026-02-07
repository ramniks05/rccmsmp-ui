# Backend Implementation Prompt - Digital Signature for Court Documents

## Context
We have a Court Case Management System with:
- **Frontend**: Angular 16
- **Backend**: Java (Spring Boot assumed)
- **Documents**: Notice, Ordersheet, Judgement created with rich text editor
- **Requirement**: Digital signature before document finalization

---

## Task: Implement Digital Signature Feature

### Objective
Implement digital signature functionality that allows officers to digitally sign court documents (Notice, Ordersheet, Judgement) before finalization. The signed documents should be converted to PDF with embedded digital signatures.

---

## Requirements

### 1. Accept New Field Type
**Update**: Field type enum to include `RICH_TEXT`

**Current Enum** (assumed):
```java
public enum FieldType {
    TEXT, TEXTAREA, NUMBER, DATE, DATETIME, 
    SELECT, MULTISELECT, CHECKBOX, RADIO, FILE
}
```

**Required Change**:
```java
public enum FieldType {
    TEXT, TEXTAREA, RICH_TEXT, NUMBER, DATE, DATETIME,  // ← Add RICH_TEXT
    SELECT, MULTISELECT, CHECKBOX, RADIO, FILE
}
```

**Why**: Frontend now supports rich text editor fields that store HTML content.

---

### 2. Implement Digital Signature Service

#### Core Service Class
```java
package com.rccms.service;

import com.itextpdf.kernel.pdf.*;
import com.itextpdf.signatures.*;
import org.springframework.stereotype.Service;
import java.security.*;
import java.security.cert.Certificate;

@Service
public class DigitalSignatureService {
    
    /**
     * Sign document with officer's digital signature
     * 
     * @param documentId - ID of the document to sign
     * @param officerId - ID of the officer signing
     * @param signatureMethod - DSC, AADHAAR, BIOMETRIC
     * @param credentials - Password/OTP for signature verification
     * @return SignedDocumentResponse with signed PDF details
     */
    public SignedDocumentResponse signDocument(
        Long documentId,
        Long officerId,
        SignatureMethod signatureMethod,
        SignatureCredentials credentials
    ) throws SignatureException {
        
        // Step 1: Validate officer has permission to sign
        validateOfficerPermission(officerId, documentId);
        
        // Step 2: Retrieve document content (HTML)
        Document document = documentRepository.findById(documentId)
            .orElseThrow(() -> new DocumentNotFoundException("Document not found"));
        
        // Step 3: Convert HTML to PDF
        byte[] pdfBytes = pdfGenerationService.htmlToPdf(
            document.getContentHtml(),
            document.getMetadata()
        );
        
        // Step 4: Get officer's certificate
        OfficerCertificate cert = getCertificate(officerId, signatureMethod, credentials);
        
        // Step 5: Apply digital signature to PDF
        byte[] signedPdfBytes = signPdf(
            pdfBytes,
            cert.getCertificate(),
            cert.getPrivateKey(),
            "Document finalized by officer",
            document.getCourt().getName()
        );
        
        // Step 6: Store signed PDF
        String filePath = storeSignedPdf(signedPdfBytes, document);
        
        // Step 7: Create signature record
        DigitalSignature signature = createSignatureRecord(
            document, officerId, cert, signatureMethod
        );
        
        // Step 8: Update document status
        document.setStatus(DocumentStatus.SIGNED);
        document.setSignatureId(signature.getId());
        documentRepository.save(document);
        
        // Step 9: Return response
        return SignedDocumentResponse.builder()
            .signedDocumentId(signature.getId())
            .pdfUrl("/api/documents/signed/" + signature.getId() + "/download")
            .signatureTimestamp(signature.getCreatedAt())
            .status("SIGNED")
            .build();
    }
    
    /**
     * Sign PDF with digital certificate
     */
    private byte[] signPdf(
        byte[] pdfBytes,
        Certificate certificate,
        PrivateKey privateKey,
        String reason,
        String location
    ) throws Exception {
        
        // Load PDF
        PdfReader reader = new PdfReader(new ByteArrayInputStream(pdfBytes));
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        PdfSigner signer = new PdfSigner(reader, baos, new StampingProperties());
        
        // Signature appearance
        PdfSignatureAppearance appearance = signer.getSignatureAppearance();
        appearance.setReason(reason);
        appearance.setLocation(location);
        appearance.setReuseAppearance(false);
        
        // Position signature (bottom right)
        Rectangle rect = new Rectangle(450, 50, 150, 50);
        appearance.setPageRect(rect);
        appearance.setPageNumber(1);
        
        // Create signature
        IExternalSignature pks = new PrivateKeySignature(
            privateKey, 
            DigestAlgorithms.SHA256, 
            "BC"
        );
        
        IExternalDigest digest = new BouncyCastleDigest();
        
        // Sign PDF
        signer.signDetached(digest, pks, new Certificate[]{certificate}, null, null, null, 0, PdfSigner.CryptoStandard.CMS);
        
        return baos.toByteArray();
    }
    
    /**
     * Verify digital signature
     */
    public SignatureVerificationResult verifySignature(Long signedDocumentId) {
        // Load signed PDF
        // Verify signature
        // Check certificate validity
        // Detect tampering
        // Return verification result
    }
}
```

---

### 3. PDF Generation Service

```java
package com.rccms.service;

import com.itextpdf.html2pdf.HtmlConverter;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.kernel.pdf.PdfDocument;
import org.springframework.stereotype.Service;

@Service
public class PdfGenerationService {
    
    /**
     * Convert HTML content to PDF
     * 
     * @param htmlContent - Rich text HTML from frontend
     * @param metadata - Document metadata (case number, officer, etc.)
     * @return PDF as byte array
     */
    public byte[] htmlToPdf(String htmlContent, DocumentMetadata metadata) {
        try {
            // Create output stream
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            
            // Create PDF writer and document
            PdfWriter writer = new PdfWriter(baos);
            PdfDocument pdfDoc = new PdfDocument(writer);
            
            // Add metadata
            pdfDoc.getDocumentInfo().setTitle(metadata.getTitle());
            pdfDoc.getDocumentInfo().setAuthor(metadata.getOfficerName());
            pdfDoc.getDocumentInfo().setSubject(metadata.getCaseNumber());
            
            // Build complete HTML with styling
            String fullHtml = buildHtmlDocument(htmlContent, metadata);
            
            // Convert HTML to PDF
            HtmlConverter.convertToPdf(fullHtml, pdfDoc);
            
            pdfDoc.close();
            
            return baos.toByteArray();
            
        } catch (Exception e) {
            throw new PdfGenerationException("Failed to generate PDF", e);
        }
    }
    
    /**
     * Build complete HTML document with headers, footers, and styling
     */
    private String buildHtmlDocument(String content, DocumentMetadata metadata) {
        return String.format("""
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    @page {
                        size: A4;
                        margin: 2cm;
                    }
                    body {
                        font-family: 'Times New Roman', serif;
                        font-size: 12pt;
                        line-height: 1.6;
                    }
                    .header {
                        text-align: center;
                        margin-bottom: 20px;
                        border-bottom: 2px solid #000;
                        padding-bottom: 10px;
                    }
                    .footer {
                        margin-top: 40px;
                        text-align: right;
                    }
                    h1, h2, h3 { font-weight: bold; }
                    p { margin-bottom: 10px; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h2>%s</h2>
                    <p>Case Number: %s</p>
                    <p>Date: %s</p>
                </div>
                
                <div class="content">
                    %s
                </div>
                
                <div class="footer">
                    <p>%s</p>
                    <p>%s</p>
                </div>
            </body>
            </html>
            """,
            metadata.getDocumentType(),
            metadata.getCaseNumber(),
            metadata.getCurrentDate(),
            content,  // Rich text HTML content
            metadata.getOfficerName(),
            metadata.getCourtName()
        );
    }
}
```

---

### 4. Certificate Management Service

```java
package com.rccms.service;

import org.springframework.stereotype.Service;
import java.security.KeyStore;
import java.security.PrivateKey;
import java.security.cert.X509Certificate;

@Service
public class CertificateManagementService {
    
    @Autowired
    private EncryptionService encryptionService;
    
    /**
     * Store officer's digital certificate
     */
    public OfficerCertificate storeCertificate(
        Long officerId,
        byte[] certificateBytes,  // .pfx/.p12 file
        String password
    ) {
        try {
            // Load certificate from bytes
            KeyStore keyStore = KeyStore.getInstance("PKCS12");
            keyStore.load(
                new ByteArrayInputStream(certificateBytes),
                password.toCharArray()
            );
            
            // Extract certificate and key
            String alias = keyStore.aliases().nextElement();
            X509Certificate cert = (X509Certificate) keyStore.getCertificate(alias);
            PrivateKey key = (PrivateKey) keyStore.getKey(alias, password.toCharArray());
            
            // Validate certificate
            validateCertificate(cert);
            
            // Encrypt certificate for storage
            byte[] encryptedCert = encryptionService.encrypt(certificateBytes);
            String passwordHash = BCrypt.hashpw(password, BCrypt.gensalt());
            
            // Store in database
            OfficerCertificate officerCert = new OfficerCertificate();
            officerCert.setOfficerId(officerId);
            officerCert.setCertificateType("DSC");
            officerCert.setCertificateData(encryptedCert);
            officerCert.setPasswordHash(passwordHash);
            officerCert.setIssuer(cert.getIssuerDN().getName());
            officerCert.setSubject(cert.getSubjectDN().getName());
            officerCert.setValidFrom(cert.getNotBefore());
            officerCert.setValidUntil(cert.getNotAfter());
            officerCert.setSerialNumber(cert.getSerialNumber().toString());
            officerCert.setIsActive(true);
            
            return certificateRepository.save(officerCert);
            
        } catch (Exception e) {
            throw new CertificateStorageException("Failed to store certificate", e);
        }
    }
    
    /**
     * Retrieve and decrypt officer's certificate for signing
     */
    public CertificateWithKey getCertificate(Long officerId, String password) {
        OfficerCertificate officerCert = certificateRepository
            .findByOfficerIdAndIsActiveTrue(officerId)
            .orElseThrow(() -> new CertificateNotFoundException("Certificate not found"));
        
        // Verify password
        if (!BCrypt.checkpw(password, officerCert.getPasswordHash())) {
            throw new InvalidPasswordException("Invalid certificate password");
        }
        
        // Decrypt certificate
        byte[] decryptedCert = encryptionService.decrypt(officerCert.getCertificateData());
        
        // Load certificate and private key
        KeyStore keyStore = KeyStore.getInstance("PKCS12");
        keyStore.load(new ByteArrayInputStream(decryptedCert), password.toCharArray());
        
        String alias = keyStore.aliases().nextElement();
        X509Certificate cert = (X509Certificate) keyStore.getCertificate(alias);
        PrivateKey key = (PrivateKey) keyStore.getKey(alias, password.toCharArray());
        
        return new CertificateWithKey(cert, key);
    }
    
    /**
     * Validate certificate is not expired and is from authorized CA
     */
    private void validateCertificate(X509Certificate cert) throws Exception {
        // Check expiry
        cert.checkValidity();
        
        // Check issuer is from CCA-approved list
        String issuer = cert.getIssuerDN().getName();
        if (!isAuthorizedCA(issuer)) {
            throw new InvalidCertificateException("Certificate not from authorized CA");
        }
        
        // Check key algorithm
        if (!cert.getPublicKey().getAlgorithm().equals("RSA")) {
            throw new InvalidCertificateException("Only RSA certificates supported");
        }
        
        // Check key length (minimum 2048 bits)
        // Additional validations...
    }
}
```

---

## API Endpoints to Implement

### Endpoint 1: Sign Document
```java
/**
 * POST /api/cases/{caseId}/documents/{documentType}/sign
 * 
 * Purpose: Sign document with digital signature and convert to PDF
 * 
 * Request Body:
 * {
 *   "documentContent": "<p><strong>Notice content...</strong></p>",
 *   "signatureMethod": "DSC",
 *   "certificatePassword": "password123",
 *   "reason": "Document finalized",
 *   "location": "District Court, Imphal"
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "message": "Document signed successfully",
 *   "data": {
 *     "signedDocumentId": 456,
 *     "signatureId": 789,
 *     "pdfUrl": "/api/documents/signed/456/download",
 *     "signatureTimestamp": "2026-01-26T10:30:00",
 *     "fileSize": 245678,
 *     "documentHash": "sha256hash..."
 *   }
 * }
 */
@PostMapping("/{documentType}/sign")
public ResponseEntity<ApiResponse<SignedDocumentResponse>> signDocument(...) {
    // Implementation here
}
```

### Endpoint 2: Download Signed PDF
```java
/**
 * GET /api/documents/signed/{signedDocumentId}/download
 * 
 * Purpose: Download signed PDF document
 * 
 * Response: PDF file with embedded digital signature
 * Headers:
 *   Content-Type: application/pdf
 *   Content-Disposition: attachment; filename="Notice_Case123_Signed.pdf"
 */
@GetMapping("/signed/{signedDocumentId}/download")
public ResponseEntity<Resource> downloadSignedDocument(...) {
    // Implementation here
}
```

### Endpoint 3: Verify Signature
```java
/**
 * GET /api/documents/signed/{signedDocumentId}/verify
 * 
 * Purpose: Verify digital signature validity
 * 
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "isValid": true,
 *     "signedBy": "Officer Name",
 *     "signedAt": "2026-01-26T10:30:00",
 *     "certificateIssuer": "Controller of Certifying Authorities",
 *     "certificateValid": true,
 *     "certificateExpiry": "2026-12-31",
 *     "documentTampered": false,
 *     "verificationTime": "2026-01-27T09:00:00"
 *   }
 * }
 */
@GetMapping("/signed/{signedDocumentId}/verify")
public ResponseEntity<ApiResponse<SignatureVerificationResult>> verifySignature(...) {
    // Implementation here
}
```

### Endpoint 4: Upload Officer Certificate
```java
/**
 * POST /api/admin/officers/{officerId}/certificate
 * 
 * Purpose: Upload and store officer's digital certificate
 * 
 * Request: multipart/form-data
 *   - certificateFile: .pfx or .p12 file
 *   - password: certificate password (will be hashed)
 *   - certificateType: DSC
 * 
 * Response:
 * {
 *   "success": true,
 *   "message": "Certificate uploaded successfully",
 *   "data": {
 *     "certificateId": 1,
 *     "issuer": "CCA India",
 *     "validFrom": "2024-01-01",
 *     "validUntil": "2026-12-31",
 *     "status": "ACTIVE"
 *   }
 * }
 */
@PostMapping("/{officerId}/certificate")
public ResponseEntity<ApiResponse<CertificateUploadResponse>> uploadCertificate(...) {
    // Implementation here
}
```

---

## Database Schema

### SQL Scripts to Execute

```sql
-- 1. Add RICH_TEXT to field_type if using enum/constraint
-- If you have a CHECK constraint:
ALTER TABLE module_form_fields 
DROP CONSTRAINT IF EXISTS check_field_type;

ALTER TABLE module_form_fields 
ADD CONSTRAINT check_field_type 
CHECK (field_type IN ('TEXT', 'TEXTAREA', 'RICH_TEXT', 'NUMBER', 'DATE', 'DATETIME', 'SELECT', 'MULTISELECT', 'CHECKBOX', 'RADIO', 'FILE'));

-- 2. Officer Certificates Table
CREATE TABLE officer_certificates (
    id BIGSERIAL PRIMARY KEY,
    officer_id BIGINT NOT NULL,
    certificate_type VARCHAR(50) NOT NULL DEFAULT 'DSC',
    certificate_data BYTEA NOT NULL,  -- Encrypted .pfx/.p12
    password_hash VARCHAR(255) NOT NULL,
    issuer VARCHAR(500),
    subject VARCHAR(500),
    serial_number VARCHAR(255),
    thumbprint VARCHAR(255),
    valid_from TIMESTAMP NOT NULL,
    valid_until TIMESTAMP NOT NULL,
    key_algorithm VARCHAR(50) DEFAULT 'RSA',
    key_size INTEGER,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_officer FOREIGN KEY (officer_id) REFERENCES officers(id) ON DELETE CASCADE
);

CREATE INDEX idx_officer_cert ON officer_certificates(officer_id, is_active);

-- 3. Digital Signatures Table
CREATE TABLE digital_signatures (
    id BIGSERIAL PRIMARY KEY,
    document_id BIGINT NOT NULL,
    document_type VARCHAR(50) NOT NULL,  -- NOTICE, ORDERSHEET, JUDGEMENT
    case_id BIGINT NOT NULL,
    officer_id BIGINT NOT NULL,
    certificate_id BIGINT,
    signature_method VARCHAR(50) NOT NULL,  -- DSC, AADHAAR, BIOMETRIC
    signature_algorithm VARCHAR(50) DEFAULT 'SHA256withRSA',
    signature_data BYTEA,  -- Signature bytes
    signature_timestamp TIMESTAMP NOT NULL,
    reason VARCHAR(500),
    location VARCHAR(255),
    ip_address VARCHAR(50),
    user_agent VARCHAR(500),
    verification_status VARCHAR(50) DEFAULT 'VALID',
    verified_at TIMESTAMP,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_document FOREIGN KEY (document_id) REFERENCES documents(id),
    CONSTRAINT fk_case FOREIGN KEY (case_id) REFERENCES cases(id),
    CONSTRAINT fk_officer_sig FOREIGN KEY (officer_id) REFERENCES officers(id),
    CONSTRAINT fk_certificate FOREIGN KEY (certificate_id) REFERENCES officer_certificates(id)
);

CREATE INDEX idx_signature_document ON digital_signatures(document_id, document_type);
CREATE INDEX idx_signature_case ON digital_signatures(case_id);

-- 4. Signed Documents Table
CREATE TABLE signed_documents (
    id BIGSERIAL PRIMARY KEY,
    original_document_id BIGINT NOT NULL,
    document_type VARCHAR(50) NOT NULL,
    case_id BIGINT NOT NULL,
    module_type VARCHAR(50),
    signed_pdf_path VARCHAR(500) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_size BIGINT,
    pdf_hash VARCHAR(255) NOT NULL,  -- SHA-256 hash
    signature_id BIGINT NOT NULL,
    status VARCHAR(50) DEFAULT 'SIGNED',
    is_tampered BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT NOT NULL,
    CONSTRAINT fk_original_doc FOREIGN KEY (original_document_id) REFERENCES documents(id),
    CONSTRAINT fk_case_signed FOREIGN KEY (case_id) REFERENCES cases(id),
    CONSTRAINT fk_signature FOREIGN KEY (signature_id) REFERENCES digital_signatures(id),
    CONSTRAINT fk_creator FOREIGN KEY (created_by) REFERENCES officers(id)
);

CREATE INDEX idx_signed_case ON signed_documents(case_id, document_type);

-- 5. Update existing documents table (if not exists)
ALTER TABLE documents 
ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'DRAFT';

ALTER TABLE documents 
ADD COLUMN IF NOT EXISTS is_signed BOOLEAN DEFAULT false;

ALTER TABLE documents 
ADD COLUMN IF NOT EXISTS signature_id BIGINT REFERENCES digital_signatures(id);

ALTER TABLE documents 
ADD COLUMN IF NOT EXISTS signed_document_id BIGINT REFERENCES signed_documents(id);

-- 6. Signature Audit Log
CREATE TABLE signature_audit_logs (
    id BIGSERIAL PRIMARY KEY,
    document_id BIGINT,
    officer_id BIGINT NOT NULL,
    action VARCHAR(100) NOT NULL,  -- SIGN_INITIATED, SIGN_SUCCESS, SIGN_FAILED, VERIFY_SUCCESS, VERIFY_FAILED
    signature_method VARCHAR(50),
    ip_address VARCHAR(50),
    user_agent VARCHAR(500),
    request_data JSONB,
    response_status VARCHAR(50),
    error_message TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_officer_audit FOREIGN KEY (officer_id) REFERENCES officers(id)
);

CREATE INDEX idx_audit_officer ON signature_audit_logs(officer_id, timestamp);
CREATE INDEX idx_audit_document ON signature_audit_logs(document_id, action);
```

---

## Maven Dependencies

```xml
<!-- Add to pom.xml -->

<!-- iText 7 for PDF generation and signing -->
<dependency>
    <groupId>com.itextpdf</groupId>
    <artifactId>itext7-core</artifactId>
    <version>7.2.5</version>
</dependency>

<dependency>
    <groupId>com.itextpdf</groupId>
    <artifactId>html2pdf</artifactId>
    <version>4.0.5</version>
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

<!-- BCrypt for password hashing -->
<dependency>
    <groupId>org.springframework.security</groupId>
    <artifactId>spring-security-crypto</artifactId>
</dependency>

<!-- Apache Commons Codec (for hashing) -->
<dependency>
    <groupId>commons-codec</groupId>
    <artifactId>commons-codec</artifactId>
</dependency>
```

---

## Entity Classes

```java
// OfficerCertificate.java
@Entity
@Table(name = "officer_certificates")
public class OfficerCertificate {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "officer_id", nullable = false)
    private Long officerId;
    
    @Column(name = "certificate_type", nullable = false)
    private String certificateType;  // DSC, AADHAAR, BIOMETRIC
    
    @Lob
    @Column(name = "certificate_data", nullable = false)
    private byte[] certificateData;  // Encrypted
    
    @Column(name = "password_hash", nullable = false)
    private String passwordHash;
    
    @Column(name = "issuer")
    private String issuer;
    
    @Column(name = "subject")
    private String subject;
    
    @Column(name = "serial_number")
    private String serialNumber;
    
    @Column(name = "valid_from", nullable = false)
    private LocalDateTime validFrom;
    
    @Column(name = "valid_until", nullable = false)
    private LocalDateTime validUntil;
    
    @Column(name = "is_active")
    private Boolean isActive = true;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    // Getters and setters
}

// DigitalSignature.java
@Entity
@Table(name = "digital_signatures")
public class DigitalSignature {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "document_id", nullable = false)
    private Long documentId;
    
    @Column(name = "document_type", nullable = false)
    private String documentType;
    
    @Column(name = "case_id", nullable = false)
    private Long caseId;
    
    @Column(name = "officer_id", nullable = false)
    private Long officerId;
    
    @Column(name = "certificate_id")
    private Long certificateId;
    
    @Column(name = "signature_method", nullable = false)
    private String signatureMethod;
    
    @Lob
    @Column(name = "signature_data")
    private byte[] signatureData;
    
    @Column(name = "signature_timestamp", nullable = false)
    private LocalDateTime signatureTimestamp;
    
    @Column(name = "reason")
    private String reason;
    
    @Column(name = "location")
    private String location;
    
    @Column(name = "ip_address")
    private String ipAddress;
    
    @Column(name = "verification_status")
    private String verificationStatus;
    
    // Getters and setters
}

// SignedDocument.java
@Entity
@Table(name = "signed_documents")
public class SignedDocument {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "original_document_id", nullable = false)
    private Long originalDocumentId;
    
    @Column(name = "document_type", nullable = false)
    private String documentType;
    
    @Column(name = "case_id", nullable = false)
    private Long caseId;
    
    @Column(name = "signed_pdf_path", nullable = false)
    private String signedPdfPath;
    
    @Column(name = "file_name", nullable = false)
    private String fileName;
    
    @Column(name = "file_size")
    private Long fileSize;
    
    @Column(name = "pdf_hash", nullable = false)
    private String pdfHash;
    
    @Column(name = "signature_id", nullable = false)
    private Long signatureId;
    
    @Column(name = "status")
    private String status;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "created_by", nullable = false)
    private Long createdBy;
    
    // Getters and setters
}
```

---

## Configuration

### application.properties
```properties
# Digital Signature Configuration
digital.signature.enabled=true
digital.signature.default.method=DSC
digital.signature.require.before.finalize=true

# Certificate Storage
certificate.storage.encryption.enabled=true
certificate.storage.encryption.key=${CERT_ENCRYPTION_KEY}
certificate.storage.encryption.algorithm=AES/GCM/NoPadding

# PDF Configuration
pdf.generator=ITEXT
pdf.signature.visible=true
pdf.signature.position.x=450
pdf.signature.position.y=50
pdf.signature.position.width=150
pdf.signature.position.height=50
pdf.signature.page=1  # First page

# File Storage
file.storage.signed.documents.path=/var/rccms/documents/signed/
file.storage.max.size=10485760  # 10MB

# Security
signature.password.min.length=8
signature.otp.validity.seconds=300
signature.max.attempts=3
```

---

## Implementation Steps

### Phase 1: Basic Setup (Week 1)
```
Day 1-2:
☐ Add RICH_TEXT to field type enum
☐ Update validation to accept RICH_TEXT
☐ Test module forms API with RICH_TEXT
☐ Create database tables (certificates, signatures, signed_documents)

Day 3-4:
☐ Add Maven dependencies (iText, Bouncy Castle)
☐ Create PdfGenerationService
☐ Test HTML to PDF conversion
☐ Verify PDF quality and formatting

Day 5:
☐ Create CertificateManagementService
☐ Implement certificate upload
☐ Implement certificate encryption/decryption
☐ Test with sample .pfx certificate
```

### Phase 2: Signature Implementation (Week 2)
```
Day 1-2:
☐ Create DigitalSignatureService
☐ Implement PDF signing with DSC
☐ Test signature embedding
☐ Verify signature in Adobe Reader

Day 3-4:
☐ Create API endpoints (sign, download, verify)
☐ Implement file storage for signed PDFs
☐ Add error handling and validation
☐ Test complete flow

Day 5:
☐ Add audit logging
☐ Implement signature verification
☐ Add security measures
☐ Performance testing
```

### Phase 3: Frontend Integration (Week 3)
```
Day 1-2:
☐ Create Digital Signature Dialog
☐ Update Document Editor component
☐ Add sign button and workflow
☐ Test UI flow

Day 3-4:
☐ Implement download signed PDF
☐ Add signature verification display
☐ Test with real certificates
☐ Handle edge cases

Day 5:
☐ User acceptance testing
☐ Bug fixes
☐ Documentation
☐ Deployment prep
```

---

## Testing Checklist

### Unit Tests
```java
@Test
public void testSignDocument_WithValidCertificate_Success() {
    // Test successful signing
}

@Test
public void testSignDocument_WithExpiredCertificate_ThrowsException() {
    // Test expired certificate handling
}

@Test
public void testVerifySignature_WithValidSignature_ReturnsTrue() {
    // Test signature verification
}

@Test
public void testVerifySignature_WithTamperedDocument_ReturnsFalse() {
    // Test tamper detection
}
```

### Integration Tests
```
☐ Upload certificate via API
☐ Sign document via API
☐ Download signed PDF via API
☐ Verify signature via API
☐ Test with invalid password
☐ Test with expired certificate
☐ Test concurrent signing
☐ Test file storage limits
```

### Manual Tests
```
☐ Sign Notice document
☐ Download signed PDF
☐ Open in Adobe Reader - verify signature shows
☐ Sign Ordersheet document
☐ Sign Judgement document
☐ Test signature verification
☐ Test document cannot be edited after signing
☐ Test placeholder replacement in PDF
```

---

## Security Checklist

### Must Implement
```
☐ Encrypt certificates at rest (AES-256)
☐ Hash certificate passwords (BCrypt/Argon2)
☐ Validate certificate before accepting
☐ Check certificate expiry
☐ Verify certificate is from authorized CA
☐ Store private keys securely (never expose)
☐ Clear sensitive data from memory after use
☐ Log all signature operations
☐ Implement rate limiting
☐ Add IP whitelist (if applicable)
☐ Implement 2FA for certificate upload
☐ Use HTTPS only
☐ Validate file uploads
☐ Prevent path traversal
☐ Implement access control
```

---

## Error Handling

### Common Errors to Handle
```java
// Certificate errors
- CertificateNotFoundException
- CertificateExpiredException
- InvalidCertificateException
- CertificatePasswordException

// Signature errors
- SignatureException
- InvalidSignatureException
- DocumentTamperedException

// PDF errors
- PdfGenerationException
- PdfSigningException

// Storage errors
- FileStorageException
- InsufficientStorageException
```

### Error Response Format
```json
{
  "success": false,
  "message": "Certificate expired",
  "error": {
    "code": "CERT_EXPIRED",
    "details": "Certificate validity ended on 2025-12-31",
    "field": "certificate",
    "timestamp": "2026-01-26T10:30:00"
  }
}
```

---

## Performance Considerations

### 1. PDF Generation
- Cache compiled templates
- Use async processing for large documents
- Optimize HTML structure
- Compress images

### 2. File Storage
- Use CDN for signed documents (if allowed)
- Implement file archival (move old files to cold storage)
- Set up backup strategy
- Monitor disk usage

### 3. Database
- Index frequently queried columns
- Archive old signatures
- Partition large tables by year

---

## Compliance & Legal

### Information Technology Act, 2000
```
☐ Use CCA-approved certificates only
☐ Minimum 2048-bit RSA keys
☐ SHA-256 or better hashing
☐ Maintain audit trails (7 years minimum)
☐ Secure key storage
☐ Time-stamping authority (recommended)
```

### Evidence Act (Amendment)
```
☐ Digital signatures have same legal validity as physical
☐ Proper authentication required
☐ Certificate from recognized authority
☐ Maintain digital signature records
```

---

## Sample Request/Response

### Complete Sign Document Flow

**Request:**
```http
POST /api/cases/123/documents/NOTICE/sign
Content-Type: application/json
X-Officer-Id: 456

{
  "documentContent": "<p><strong>OFFICIAL NOTICE</strong></p><p>Case Number: {{caseNumber}}</p><p>To: {{applicantName}}</p><p>This is to inform you...</p>",
  "signatureMethod": "DSC",
  "certificatePassword": "MySecurePass123!",
  "reason": "Notice finalized and approved",
  "location": "District Court, Imphal East"
}
```

**Response:**
```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "success": true,
  "message": "Document signed successfully",
  "data": {
    "signedDocumentId": 789,
    "signatureId": 1011,
    "pdfUrl": "/api/documents/signed/789/download",
    "fileName": "Notice_Case123_20260126_Signed.pdf",
    "fileSize": 245678,
    "documentHash": "a8f5f167f44f4964e6c998dee827110c",
    "signatureTimestamp": "2026-01-26T15:30:45",
    "signedBy": "Officer Name",
    "certificateIssuer": "CCA India",
    "certificateExpiry": "2026-12-31",
    "status": "SIGNED"
  },
  "timestamp": "2026-01-26T15:30:45"
}
```

---

## Next Steps

### Immediate Actions
1. Add `RICH_TEXT` to FieldType enum - **15 minutes**
2. Set up database tables - **30 minutes**
3. Add Maven dependencies - **10 minutes**
4. Create basic service classes (empty) - **30 minutes**
5. Test API accepts RICH_TEXT fields - **15 minutes**

### Core Implementation
1. Implement PDF generation from HTML - **2 days**
2. Implement DSC signing - **3 days**
3. Implement certificate management - **2 days**
4. Create REST APIs - **2 days**
5. Testing and bug fixes - **3 days**

### Optional Enhancements
1. Aadhaar e-Sign integration - **5 days**
2. Biometric signing - **7 days**
3. Time-stamping authority - **2 days**
4. Advanced verification - **2 days**

---

## Summary

**Backend needs to implement:**

1. **Field Type**: Accept `RICH_TEXT` ✅ (Simple)
2. **PDF Generation**: Convert HTML to PDF ⚠️ (Moderate)
3. **Digital Signature**: Sign PDF with certificate ⚠️ (Complex)
4. **Certificate Management**: Store and manage certificates ⚠️ (Complex)
5. **File Storage**: Store signed PDFs ✅ (Simple)
6. **APIs**: Signing, download, verification endpoints ✅ (Moderate)

**Complexity**: Moderate to High
**Timeline**: 2-3 weeks for complete implementation
**Priority**: High (legal requirement for court documents)

**Start with**: Add RICH_TEXT support first (15 min), then tackle digital signature (2-3 weeks).
