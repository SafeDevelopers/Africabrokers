# @afribrok/ui

Shared React component kit built with shadcn/ui and Tailwind, themed via `@afribrok/design-tokens`.

Milestone 1 components to implement:
- Layout primitives (PageShell, SidebarNav, ContentHeader).
- Form controls (Input, Select, FileUploadCard) wrapping shadcn.
- Status indicators (Badge variants for Verified, Warning, Suspended).
- Data display (StatsTile, ReviewTable, ListingCard).

Guidelines:
- Consume CSS variables from the Tailwind preset; do not hardcode hex values.
- Export components as typed `tsx` modules (ESM + CJS support).
- Provide Storybook stories or MDX docs once the monorepo bootstrap is complete.
