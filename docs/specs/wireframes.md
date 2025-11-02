# AfriBrok — M1 Wireframe Notes

These low-fidelity wireframe outlines map the key Milestone 1 journeys. They reference the design tokens defined in `packages/config/design-tokens` and should be mirrored in Figma when visual mocks are produced.

## 1. Auth & Role Selection
- **Viewport:** centered card on light neutral background (`color.neutral.50`), width 480px.
- **Header:** AfriBrok logo (tenant-specific) + headline “Choose how you use AfriBrok”.
- **Copy:** one-line description clarifying multi-role support.
- **Role grid:** three primary cards per row (Certified Broker, Real-Estate Agency, Individual Seller) with secondary row (Inspector, Admin/Regulator, Public). Each card:
  - uses `radii.lg`, `shadows.card`.
  - Includes icon placeholder, title, bullet list (2 items max).
  - Primary CTA button (`color.primary`) within selected card; non-selected cards use outline (`color.neutral.border`).
- **Footer:** link to learn more about roles + tenant support contact.

## 2. Broker Onboarding — Web Marketplace
- **Hero section:** split layout (left copy, right illustration placeholder). Background gradient from `color.primary` 4% tint to `color.neutral.50`.
- **Progress tracker:** horizontal steps (Account → Business Info → Documents → Submit) with active state highlighted using `color.accent`.
- **Form layout:** two-column grid on desktop, single column on mobile. Inputs grouped with labels, helper text.
- **Document upload cards:** each card shows required doc, description, upload button (secondary). Success state with green check (`color.success`), error with `color.danger`.
- **Selfie/liveness placeholder:** guidance text + “Launch verification” button (disabled in stub with tooltip).
- **Summary panel:** right-hand sticky card listing requirements, showing readiness checklist using badge tokens.
- **Submit section:** final CTA button anchored bottom-right, with disclaimer text referencing legal terms.

## 3. Admin Dashboard — KYC Queue (`apps/web-admin`)
- **Top navigation:** left-aligned logo, nav items (Dashboard, Reviews, Listings, Complaints, Settings), right-aligned user menu.
- **Header strip:** metrics tiles (Pending Reviews, Approved Brokers, Suspended Accounts) using `color.neutral.surface` backgrounds.
- **Main content:** two columns.
  - **Left:** filter panel (search, status chips, tenant dropdown) inside card.
  - **Right:** table with sticky header (Broker, Tenant, Submitted, Risk Flags, Actions). Table rows highlight on hover.
- **Drawer / modal:** selecting a broker opens side panel with sections (Profile, Documents preview with thumbnails, Audit trail). Approve/Deny buttons at bottom, requiring confirmation modal.
- **QR preview:** once approved, panel shows QR SVG mock with “Download print pack” secondary button.

## 4. Marketplace Listing Detail (`apps/web-marketplace`)
- **Header:** hero image carousel (ratio 3:2) with overlayed verification badge (uses badge tokens).
- **Info grid:** left column (property summary, price, broker card with QR badge, contact CTA), right column (map iframe placeholder, key facts list).
- **Tabs:** Details, Documents, Complaints. Tabs use underline accent.
- **Complaint CTA:** inline link opening modal form (simple fields, reason dropdown).

## 5. Inspector Mobile Stub (`apps/mobile-inspector`)
- **Home screen:** top app bar with tenant switcher; central QR scan button (circular), last synced timestamp.
- **Offline cache list:** cards showing recent scans, status pill color-coded.
- **Issue action sheet:** buttons for “Issue Warning”, “Request Suspension”, each opening stub form (textarea + photo attachment placeholder).

## Wireframe Handoff Checklist
- Translate each section into Figma frames using the token palette.
- Annotate states (default, hover, focus, error) for primary components.
- Provide assets: logos, QR badge iconography, illustration placeholders.
- Review with product + regulator stakeholders before high-fidelity UI build.
