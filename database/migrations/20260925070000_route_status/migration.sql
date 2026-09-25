ALTER TABLE "routes"
  ADD COLUMN "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE';

CREATE INDEX "routes_status_idx" ON "routes"("status");
