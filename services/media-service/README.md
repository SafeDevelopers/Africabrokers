# Media Service

Lightweight NestJS service handling broker document uploads for AfriBrok Milestone 1.

Responsibilities:
- Validate uploaded file metadata (size, MIME type) before handing to S3.
- Issue presigned URLs and short-lived view signatures.
- Run pluggable scanning hooks (anti-virus stub, image dedupe hash placeholder).
- Store audit entries for every upload.

The core API calls this service to manage KYC documents. Future phases will add OCR, dedupe workers, and retention policies per tenant.
