-- Add orgType and orgTypeNotes fields to BrokerApplication table
-- Migration: add_org_type_to_broker_application

ALTER TABLE "BrokerApplication" 
ADD COLUMN "orgType" TEXT,
ADD COLUMN "orgTypeNotes" TEXT;

-- Add comments for documentation
COMMENT ON COLUMN "BrokerApplication"."orgType" IS 'Organization type: "Government / Public", "Private / Association", or "Other"';
COMMENT ON COLUMN "BrokerApplication"."orgTypeNotes" IS 'Notes when orgType is "Other"';

