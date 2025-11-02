# @afribrok/lib

Utility layer shared across apps and services.

Planned modules (Milestone 1):
- `api-client/` — lightweight REST client wrappers targeting `services/core-api`.
- `auth/` — helpers for JWT parsing, role guards, tenancy context injection.
- `forms/` — zod schemas shared between frontend and backend validation.
- `queue/` — BullMQ job payload types and factories.

Do not introduce heavy abstractions; each module should solve a concrete Milestone 1 need referenced in `docs/specs/spec.md`.
