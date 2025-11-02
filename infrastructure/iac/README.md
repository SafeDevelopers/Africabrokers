# Infrastructure as Code (Skeleton)

Holds Terraform and Kubernetes manifests for AfriBrok deployments. For Milestone 1:

- Provide Terraform modules for foundational resources (state bucket, VPC, RDS stub, ECR repositories) without applying them.
- Capture Kubernetes Helm chart placeholders pointing to the Docker images built by CI (`apps/web-admin`, `apps/web-marketplace`, `services/core-api`, `services/media-service`).
- Document environment promotion strategy (Dev → Pilot Addis) but defer implementation until post-M1.

Keep configs DRY and reference tenant-specific overrides via variables rather than duplicating modules.
