CREATE INDEX "assets_status_registration_idx"
  ON "assets"("status", "registration");

CREATE INDEX "drivers_status_full_name_idx"
  ON "drivers"("status", "fullName");
