0) First-run checklist (sticky until done)
	•	✅ Verify business profile (logo, business name, phone, office address)
	•	✅ Upload/confirm required docs (KYC, tax, trade license)
	•	✅ Generate Referral Link + QR
	•	✅ Create first listing (or import)
	•	✅ Set notification preferences (SMS/Email/WhatsApp)

1) Home (overview)
	•	License status pill: APPROVED / SUSPENDED / EXPIRED + expiry date + “Renew” CTA
	•	Verification assets:
	•	Public broker page link (copy)
	•	Verify URL: /verify/{qrCodeId} (copy)
	•	Download QR sticker (SVG/PDF) + “Print pack”
	•	KPIs (tenant-scoped): Active listings, Leads (new), Views last 7d, Saves, Inquiries, QR scans
	•	Tasks: “3 docs expiring soon”, “2 leads uncontacted >24h”

2) Leads (seller & buyer)
	•	Tabs: New, Contacted, Qualified, Listed, Closed, Rejected
	•	Columns: Name, Phone, City, Source (Public/Referral refCode), Property Type, Created, SLA
	•	Row actions: Call/Copy, Add note, Advance status, Convert to Listing
	•	Filters: city, source, date, status
	•	SLA: flag if New >24h uncontacted

3) Referral (growth)
	•	Generate my referral link → signed URL …/sell?ref=<code>&sig=<hmac>&tenant=<tenant>
	•	QR for referral (download SVG) to use on flyers/WhatsApp
	•	Attribution metrics: leads by source, conversion to listing, closed deals
	•	One-click share buttons (WhatsApp, SMS, email)

4) Listings
	•	Status groups: Draft / Under Review / Published / Unlisted / Flagged / Expired
	•	Create/Edit listing:
	•	Required fields per tenant policy (category, address/area, price, attributes)
	•	Media uploads (presigned to MinIO), reorder, cover
	•	Validation: only APPROVED brokers can publish; blocked if license expired/suspended
	•	Preview public page; Request review; Unlist

5) QR & Verification
	•	Show stable broker QR (server-rendered SVG) + deep link
	•	Scan analytics: total scans, last scan, recent scan timeline
	•	Reprint request; Rotate QR (if compromised) → old code revoked

6) Messages / Inquiries (optional M1.5)
	•	Threaded conversations with buyers
	•	Quick replies; attach brochure; mark resolved

7) Documents & Compliance
	•	KYC doc vault (view/upload/replace)
	•	License renewal flow (request, pay, upload proof)
	•	Compliance warnings (watermark on listings if near expiry)

8) Billing (if applicable)
	•	Plan/subscription status, invoices, receipts
	•	Usage: listings quota, media storage

9) Settings
	•	Business profile (public page fields)
	•	Contact methods; notification prefs (Email/SMS/WhatsApp)
	•	Team members (optional): add “Agent” seats under the broker
	•	API keys (future)

10) States & guards
	•	SUSPENDED: dashboard read-only; banners explain reason; contact admin
	•	EXPIRED: create/publish disabled; renewal CTA
	•	Tenant-scoped: broker only sees data where tenantId = theirs

⸻

Minimal backend contracts this needs
	•	GET /v1/broker/overview → license, counters, tasks
	•	GET /v1/broker/leads + PATCH /v1/broker/leads/:id
	•	POST /v1/broker/referrals → { url }
	•	GET /v1/broker/qrcode → { code, svg, verifyUrl, scans }
	•	POST /v1/broker/qrcode/rotate (optional)
	•	GET /v1/broker/listings + POST/PUT /v1/broker/listings
	•	GET /v1/broker/docs + POST /v1/broker/docs
	•	(Optional) GET/POST /v1/broker/messages*
	•	All require role BROKER and enforce tenantId
