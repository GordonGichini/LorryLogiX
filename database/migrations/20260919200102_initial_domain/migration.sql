-- CreateEnum
CREATE TYPE "public"."RecordStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "public"."ContractStatus" AS ENUM ('DRAFT', 'ACTIVE', 'SUSPENDED', 'EXPIRED', 'TERMINATED');

-- CreateEnum
CREATE TYPE "public"."AssetStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'UNDER_MAINTENANCE');

-- CreateEnum
CREATE TYPE "public"."TripStatus" AS ENUM ('PLANNED', 'DISPATCHED', 'IN_TRANSIT', 'DELIVERED', 'COMPLETED', 'CANCELLED', 'FAILED');

-- CreateEnum
CREATE TYPE "public"."DeliveryNoteStatus" AS ENUM ('PENDING', 'DELIVERED', 'SIGNED', 'REJECTED');

-- CreateEnum
CREATE TYPE "public"."ExpenseCategory" AS ENUM ('PARKING', 'WEIGHBRIDGE', 'DRIVER_SALARY', 'GARAGE', 'MAINTENANCE', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."FinancialPartyType" AS ENUM ('OPERATOR', 'CLIENT', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."ObligationStatus" AS ENUM ('OUTSTANDING', 'PARTIALLY_SETTLED', 'SETTLED', 'CANCELLED');

-- CreateTable
CREATE TABLE "public"."clients" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "status" "public"."RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."contracts" (
    "id" UUID NOT NULL,
    "client_id" UUID NOT NULL,
    "reference" TEXT NOT NULL,
    "cargo_default" TEXT,
    "currency" CHAR(3) NOT NULL DEFAULT 'KES',
    "starts_on" DATE NOT NULL,
    "ends_on" DATE,
    "status" "public"."ContractStatus" NOT NULL DEFAULT 'DRAFT',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contracts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."assets" (
    "id" UUID NOT NULL,
    "registration" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" "public"."AssetStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "assets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."drivers" (
    "id" UUID NOT NULL,
    "fullName" TEXT NOT NULL,
    "phone_number" TEXT,
    "status" "public"."RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "drivers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."routes" (
    "id" UUID NOT NULL,
    "origin" TEXT NOT NULL,
    "destination" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "routes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."contract_routes" (
    "id" UUID NOT NULL,
    "contract_id" UUID NOT NULL,
    "route_id" UUID NOT NULL,
    "rate" DECIMAL(14,2) NOT NULL,
    "currency" CHAR(3) NOT NULL DEFAULT 'KES',
    "active_from" DATE NOT NULL,
    "active_to" DATE,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contract_routes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."trips" (
    "id" UUID NOT NULL,
    "contract_route_id" UUID NOT NULL,
    "lorry_id" UUID NOT NULL,
    "driver_id" UUID,
    "occurred_at" TIMESTAMP(3) NOT NULL,
    "cargoDescription" TEXT NOT NULL,
    "cargo_quantity" DECIMAL(14,3),
    "cargo_unit" TEXT,
    "agreed_rate" DECIMAL(14,2) NOT NULL,
    "currency" CHAR(3) NOT NULL DEFAULT 'KES',
    "status" "public"."TripStatus" NOT NULL DEFAULT 'PLANNED',
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "trips_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."delivery_notes" (
    "id" UUID NOT NULL,
    "trip_id" UUID NOT NULL,
    "note_number" TEXT NOT NULL,
    "delivered_at" TIMESTAMP(3),
    "sender_company" TEXT NOT NULL,
    "receiver_company" TEXT NOT NULL,
    "sender_signed_at" TIMESTAMP(3),
    "receiver_signed_at" TIMESTAMP(3),
    "status" "public"."DeliveryNoteStatus" NOT NULL DEFAULT 'PENDING',
    "document_url" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "delivery_notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."fuel_coverage_policies" (
    "id" UUID NOT NULL,
    "contract_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "cycle_months" INTEGER NOT NULL,
    "operator_coverage_months" INTEGER NOT NULL,
    "client_coverage_months" INTEGER NOT NULL,
    "cycle_start_date" DATE NOT NULL,
    "status" "public"."RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fuel_coverage_policies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."fuel_coverage_periods" (
    "id" UUID NOT NULL,
    "policy_id" UUID NOT NULL,
    "period_number" INTEGER NOT NULL,
    "period_start" DATE NOT NULL,
    "period_end" DATE NOT NULL,
    "responsible_party" "public"."FinancialPartyType" NOT NULL,
    "status" "public"."RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "fuel_coverage_periods_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."fuel_transactions" (
    "id" UUID NOT NULL,
    "trip_id" UUID NOT NULL,
    "purchased_at" TIMESTAMP(3) NOT NULL,
    "litres" DECIMAL(14,3),
    "total_amount" DECIMAL(14,2) NOT NULL,
    "currency" CHAR(3) NOT NULL DEFAULT 'KES',
    "payment_party" "public"."FinancialPartyType" NOT NULL,
    "receipt_ref" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "fuel_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."fuel_obligations" (
    "id" UUID NOT NULL,
    "fuel_transaction_id" UUID NOT NULL,
    "coverage_period_id" UUID NOT NULL,
    "responsible_party" "public"."FinancialPartyType" NOT NULL,
    "amount" DECIMAL(14,2) NOT NULL,
    "settled_amount" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "status" "public"."ObligationStatus" NOT NULL DEFAULT 'OUTSTANDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fuel_obligations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."fuel_settlements" (
    "id" UUID NOT NULL,
    "settled_at" TIMESTAMP(3) NOT NULL,
    "paid_by" "public"."FinancialPartyType" NOT NULL,
    "total_amount" DECIMAL(14,2) NOT NULL,
    "currency" CHAR(3) NOT NULL DEFAULT 'KES',
    "reference" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "fuel_settlements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."fuel_settlement_allocations" (
    "id" UUID NOT NULL,
    "settlement_id" UUID NOT NULL,
    "obligation_id" UUID NOT NULL,
    "amount" DECIMAL(14,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "fuel_settlement_allocations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."expenses" (
    "id" UUID NOT NULL,
    "trip_id" UUID,
    "category" "public"."ExpenseCategory" NOT NULL,
    "amount" DECIMAL(14,2) NOT NULL,
    "currency" CHAR(3) NOT NULL DEFAULT 'KES',
    "responsible_party" "public"."FinancialPartyType" NOT NULL,
    "incurred_at" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "expenses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."maintenance_records" (
    "id" UUID NOT NULL,
    "lorry_id" UUID NOT NULL,
    "performed_at" TIMESTAMP(3) NOT NULL,
    "description" TEXT NOT NULL,
    "cost" DECIMAL(14,2),
    "currency" CHAR(3) NOT NULL DEFAULT 'KES',
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "maintenance_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."invoices" (
    "id" UUID NOT NULL,
    "contract_id" UUID NOT NULL,
    "trip_id" UUID,
    "invoice_number" TEXT NOT NULL,
    "issued_at" TIMESTAMP(3) NOT NULL,
    "due_at" TIMESTAMP(3),
    "amount" DECIMAL(14,2) NOT NULL,
    "currency" CHAR(3) NOT NULL DEFAULT 'KES',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "invoices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."payments" (
    "id" UUID NOT NULL,
    "invoice_id" UUID NOT NULL,
    "paid_at" TIMESTAMP(3) NOT NULL,
    "amount" DECIMAL(14,2) NOT NULL,
    "currency" CHAR(3) NOT NULL DEFAULT 'KES',
    "reference" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."asset_documents" (
    "id" UUID NOT NULL,
    "lorry_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "asset_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."driver_assignments" (
    "id" UUID NOT NULL,
    "lorry_id" UUID NOT NULL,
    "driver_id" UUID NOT NULL,
    "starts_on" DATE NOT NULL,
    "ends_on" DATE,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "driver_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "clients_name_key" ON "public"."clients"("name");

-- CreateIndex
CREATE UNIQUE INDEX "contracts_reference_key" ON "public"."contracts"("reference");

-- CreateIndex
CREATE INDEX "contracts_client_id_status_idx" ON "public"."contracts"("client_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "assets_registration_key" ON "public"."assets"("registration");

-- CreateIndex
CREATE UNIQUE INDEX "drivers_phone_number_key" ON "public"."drivers"("phone_number");

-- CreateIndex
CREATE UNIQUE INDEX "routes_origin_destination_key" ON "public"."routes"("origin", "destination");

-- CreateIndex
CREATE INDEX "contract_routes_contract_id_active_from_idx" ON "public"."contract_routes"("contract_id", "active_from");

-- CreateIndex
CREATE INDEX "trips_lorry_id_occurred_at_idx" ON "public"."trips"("lorry_id", "occurred_at");

-- CreateIndex
CREATE INDEX "trips_contract_route_id_occurred_at_idx" ON "public"."trips"("contract_route_id", "occurred_at");

-- CreateIndex
CREATE INDEX "trips_status_occurred_at_idx" ON "public"."trips"("status", "occurred_at");

-- CreateIndex
CREATE UNIQUE INDEX "delivery_notes_trip_id_key" ON "public"."delivery_notes"("trip_id");

-- CreateIndex
CREATE UNIQUE INDEX "delivery_notes_note_number_key" ON "public"."delivery_notes"("note_number");

-- CreateIndex
CREATE UNIQUE INDEX "fuel_coverage_policies_contract_id_name_key" ON "public"."fuel_coverage_policies"("contract_id", "name");

-- CreateIndex
CREATE INDEX "fuel_coverage_periods_policy_id_period_start_period_end_idx" ON "public"."fuel_coverage_periods"("policy_id", "period_start", "period_end");

-- CreateIndex
CREATE UNIQUE INDEX "fuel_coverage_periods_policy_id_period_number_key" ON "public"."fuel_coverage_periods"("policy_id", "period_number");

-- CreateIndex
CREATE INDEX "fuel_transactions_trip_id_purchased_at_idx" ON "public"."fuel_transactions"("trip_id", "purchased_at");

-- CreateIndex
CREATE UNIQUE INDEX "fuel_obligations_fuel_transaction_id_key" ON "public"."fuel_obligations"("fuel_transaction_id");

-- CreateIndex
CREATE INDEX "fuel_obligations_coverage_period_id_status_idx" ON "public"."fuel_obligations"("coverage_period_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "fuel_settlements_reference_key" ON "public"."fuel_settlements"("reference");

-- CreateIndex
CREATE INDEX "fuel_settlements_settled_at_idx" ON "public"."fuel_settlements"("settled_at");

-- CreateIndex
CREATE INDEX "fuel_settlement_allocations_obligation_id_idx" ON "public"."fuel_settlement_allocations"("obligation_id");

-- CreateIndex
CREATE UNIQUE INDEX "fuel_settlement_allocations_settlement_id_obligation_id_key" ON "public"."fuel_settlement_allocations"("settlement_id", "obligation_id");

-- CreateIndex
CREATE INDEX "expenses_trip_id_incurred_at_idx" ON "public"."expenses"("trip_id", "incurred_at");

-- CreateIndex
CREATE INDEX "maintenance_records_lorry_id_performed_at_idx" ON "public"."maintenance_records"("lorry_id", "performed_at");

-- CreateIndex
CREATE UNIQUE INDEX "invoices_trip_id_key" ON "public"."invoices"("trip_id");

-- CreateIndex
CREATE UNIQUE INDEX "invoices_invoice_number_key" ON "public"."invoices"("invoice_number");

-- CreateIndex
CREATE INDEX "invoices_contract_id_issued_at_idx" ON "public"."invoices"("contract_id", "issued_at");

-- CreateIndex
CREATE UNIQUE INDEX "payments_reference_key" ON "public"."payments"("reference");

-- CreateIndex
CREATE INDEX "payments_invoice_id_paid_at_idx" ON "public"."payments"("invoice_id", "paid_at");

-- CreateIndex
CREATE INDEX "driver_assignments_lorry_id_starts_on_idx" ON "public"."driver_assignments"("lorry_id", "starts_on");

-- CreateIndex
CREATE INDEX "driver_assignments_driver_id_starts_on_idx" ON "public"."driver_assignments"("driver_id", "starts_on");

-- AddForeignKey
ALTER TABLE "public"."contracts" ADD CONSTRAINT "contracts_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."contract_routes" ADD CONSTRAINT "contract_routes_contract_id_fkey" FOREIGN KEY ("contract_id") REFERENCES "public"."contracts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."contract_routes" ADD CONSTRAINT "contract_routes_route_id_fkey" FOREIGN KEY ("route_id") REFERENCES "public"."routes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."trips" ADD CONSTRAINT "trips_contract_route_id_fkey" FOREIGN KEY ("contract_route_id") REFERENCES "public"."contract_routes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."trips" ADD CONSTRAINT "trips_lorry_id_fkey" FOREIGN KEY ("lorry_id") REFERENCES "public"."assets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."trips" ADD CONSTRAINT "trips_driver_id_fkey" FOREIGN KEY ("driver_id") REFERENCES "public"."drivers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."delivery_notes" ADD CONSTRAINT "delivery_notes_trip_id_fkey" FOREIGN KEY ("trip_id") REFERENCES "public"."trips"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."fuel_coverage_policies" ADD CONSTRAINT "fuel_coverage_policies_contract_id_fkey" FOREIGN KEY ("contract_id") REFERENCES "public"."contracts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."fuel_coverage_periods" ADD CONSTRAINT "fuel_coverage_periods_policy_id_fkey" FOREIGN KEY ("policy_id") REFERENCES "public"."fuel_coverage_policies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."fuel_transactions" ADD CONSTRAINT "fuel_transactions_trip_id_fkey" FOREIGN KEY ("trip_id") REFERENCES "public"."trips"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."fuel_obligations" ADD CONSTRAINT "fuel_obligations_fuel_transaction_id_fkey" FOREIGN KEY ("fuel_transaction_id") REFERENCES "public"."fuel_transactions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."fuel_obligations" ADD CONSTRAINT "fuel_obligations_coverage_period_id_fkey" FOREIGN KEY ("coverage_period_id") REFERENCES "public"."fuel_coverage_periods"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."fuel_settlement_allocations" ADD CONSTRAINT "fuel_settlement_allocations_settlement_id_fkey" FOREIGN KEY ("settlement_id") REFERENCES "public"."fuel_settlements"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."fuel_settlement_allocations" ADD CONSTRAINT "fuel_settlement_allocations_obligation_id_fkey" FOREIGN KEY ("obligation_id") REFERENCES "public"."fuel_obligations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."expenses" ADD CONSTRAINT "expenses_trip_id_fkey" FOREIGN KEY ("trip_id") REFERENCES "public"."trips"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."maintenance_records" ADD CONSTRAINT "maintenance_records_lorry_id_fkey" FOREIGN KEY ("lorry_id") REFERENCES "public"."assets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."invoices" ADD CONSTRAINT "invoices_contract_id_fkey" FOREIGN KEY ("contract_id") REFERENCES "public"."contracts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."invoices" ADD CONSTRAINT "invoices_trip_id_fkey" FOREIGN KEY ("trip_id") REFERENCES "public"."trips"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."payments" ADD CONSTRAINT "payments_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."asset_documents" ADD CONSTRAINT "asset_documents_lorry_id_fkey" FOREIGN KEY ("lorry_id") REFERENCES "public"."assets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."driver_assignments" ADD CONSTRAINT "driver_assignments_lorry_id_fkey" FOREIGN KEY ("lorry_id") REFERENCES "public"."assets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."driver_assignments" ADD CONSTRAINT "driver_assignments_driver_id_fkey" FOREIGN KEY ("driver_id") REFERENCES "public"."drivers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
