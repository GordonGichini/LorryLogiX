-- PostgreSQL enforces invariants that cannot safely be delegated to the API.
CREATE EXTENSION IF NOT EXISTS btree_gist;

ALTER TABLE "contract_routes"
  ADD CONSTRAINT "contract_routes_rate_non_negative" CHECK (rate >= 0),
  ADD CONSTRAINT "contract_routes_date_range_valid" CHECK (active_to IS NULL OR active_to >= active_from);

ALTER TABLE "trips"
  ADD CONSTRAINT "trips_agreed_rate_non_negative" CHECK (agreed_rate >= 0),
  ADD CONSTRAINT "trips_cargo_quantity_positive" CHECK (cargo_quantity IS NULL OR cargo_quantity > 0);

ALTER TABLE "fuel_coverage_policies"
  ADD CONSTRAINT "fuel_coverage_policy_cycle_positive" CHECK (cycle_months > 0),
  ADD CONSTRAINT "fuel_coverage_policy_partitions_cycle" CHECK (
    operator_coverage_months >= 0 AND client_coverage_months >= 0
    AND operator_coverage_months + client_coverage_months = cycle_months
  );

ALTER TABLE "fuel_coverage_periods"
  ADD CONSTRAINT "fuel_coverage_period_dates_valid" CHECK (period_end >= period_start),
  ADD CONSTRAINT "fuel_coverage_periods_do_not_overlap"
    EXCLUDE USING gist (
      policy_id WITH =,
      daterange(period_start, period_end + 1, '[)') WITH &&
    );

ALTER TABLE "fuel_transactions"
  ADD CONSTRAINT "fuel_transaction_amount_positive" CHECK (total_amount > 0),
  ADD CONSTRAINT "fuel_transaction_litres_positive" CHECK (litres IS NULL OR litres > 0);

ALTER TABLE "fuel_obligations"
  ADD CONSTRAINT "fuel_obligation_amount_positive" CHECK (amount > 0),
  ADD CONSTRAINT "fuel_obligation_settled_amount_valid" CHECK (settled_amount >= 0 AND settled_amount <= amount);

ALTER TABLE "fuel_settlements"
  ADD CONSTRAINT "fuel_settlement_amount_positive" CHECK (total_amount > 0);

ALTER TABLE "fuel_settlement_allocations"
  ADD CONSTRAINT "fuel_settlement_allocation_amount_positive" CHECK (amount > 0);

ALTER TABLE "expenses"
  ADD CONSTRAINT "expense_amount_positive" CHECK (amount > 0);

ALTER TABLE "maintenance_records"
  ADD CONSTRAINT "maintenance_cost_non_negative" CHECK (cost IS NULL OR cost >= 0);

ALTER TABLE "invoices"
  ADD CONSTRAINT "invoice_amount_non_negative" CHECK (amount >= 0),
  ADD CONSTRAINT "invoice_due_date_valid" CHECK (due_at IS NULL OR due_at >= issued_at);

ALTER TABLE "payments"
  ADD CONSTRAINT "payment_amount_positive" CHECK (amount > 0);
