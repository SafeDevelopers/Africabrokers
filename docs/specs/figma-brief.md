# AfriBrok — Figma Hand-off Brief (Milestone 1)

This brief accompanies `docs/specs/wireframes.md` and the design tokens in `packages/config/design-tokens`. Use it when creating the first Figma exploration so engineering can implement screens without rework.

## Project Setup
- File name: `AfriBrok M1 – Registry & Marketplace`.
- Create one page per surface:
  1. Auth & Role Selection
  2. Broker Onboarding (Marketplace)
  3. Admin Dashboard (web-admin)
  4. Marketplace Listing Detail
  5. Inspector Mobile Stub
- Add a shared `Styles` page containing color styles, text styles, and effect styles sourced from the design tokens.

## Color & Typography Styles
- Define color styles with the CSS variable names to keep parity (`Primary / Default`, `Secondary / Success`, `Neutral / 50`, etc.).
- Text styles:
  - Heading XL (36px / 44px / Inter SemiBold)
  - Heading L (30px / 38px / SemiBold)
  - Heading M (24px / 32px / SemiBold)
  - Body (16px / 24px / Medium)
  - Caption (14px / 20px / Regular)
- Effect styles:
  - Card Shadow (`0px 10px 30px rgba(24, 76, 140, 0.08)`)
  - Popover Shadow (`0px 20px 40px rgba(15, 23, 42, 0.12)`)
- Components should honour the radii (`lg` = 12px) and spacing scale (4px increments).

## Screen Requirements
### 1. Auth & Role Selection
- Layout: 1440px desktop frame, centered modal card (480px width).
- Include hover & focus states for role cards and primary CTA.
- Provide responsive variant (mobile 375px width) showing stacked role cards.

### 2. Broker Onboarding
- Break screens into steps: Welcome, Business Info, Documents, Review + Submit.
- Each step should have annotations for validation states and inline helper text.
- Document upload modules need success, error, and pending states.
- Include a component spec for the progress tracker (default, active, completed).

### 3. Admin Dashboard
- Dashboard overview frame: metrics cards + KYC queue table.
- Detail drawer frame showing document thumbnails (use placeholder images).
- Approve/Deny modal frames with confirmation copy and button hierarchy.
- Add variant demonstrating suspended broker badge state.

### 4. Marketplace Listing
- Desktop and mobile variants.
- Carousel component spec (image ratio, navigation bullets).
- Broker verification badge usage guidelines (placement, color, spacing).
- Complaint modal frame with form fields and validation states.

### 5. Inspector Mobile Stub
- 360x780 frame (generic Android).
- Include QR scan button default/pressed, offline list items, and action sheet prototypes.
- Document offline badge colour usage (warning vs success).

## Assets & Exports
- Place the AfriBrok logotype and tentative tenant logos in an assets section.
- Export SVG for the verification badge and QR frame icon for developers.
- Ensure all icons are vector-based and adopt 24px grid.

## Collaboration & Review
- Share the Figma file with Product, Engineering, and Regulatory stakeholders.
- Track comments per page and resolve before moving to high-fidelity polish.
- Once approved, hand engineering the Figma link plus summary of component names to sync with `packages/ui`.
