# @afribrok/env

Environment configuration schemas validated via Zod.

Milestone 1 deliverables:
- `schema.ts` — defines required environment variables for apps/services (OIDC endpoints, database URLs, storage buckets, Telebirr sandbox keys).
- `server.ts` — helper to parse `process.env`, throw on missing values, and expose typed config.
- `client.ts` — returns safe variables consumable by frontend bundles.

Keep secrets out of the repository. Sample values will live in `infrastructure/compose/.env.example`.
