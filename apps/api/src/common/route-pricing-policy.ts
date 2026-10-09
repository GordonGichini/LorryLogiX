import { BadRequestException } from "@nestjs/common";
import { Prisma, RecordStatus } from "@prisma/client";

export interface ExistingRoutePricing {
  contractId: string;
  rate: Prisma.Decimal;
  currency: string;
  activeFrom: Date;
  activeTo: Date | null;
}

export interface RoutePricingChange {
  contractId: string;
  rate?: string;
  currency?: string;
  activeFrom?: string;
  activeTo?: string;
}

export function getInactiveRoutePricingCloseDate(
  status: RecordStatus,
  existing: ExistingRoutePricing | undefined,
  change: RoutePricingChange,
): Date | undefined {
  if (status !== RecordStatus.INACTIVE) return undefined;

  if (!existing || change.contractId !== existing.contractId) {
    throw new BadRequestException(
      "Cannot add or reassign pricing for an inactive route.",
    );
  }

  if (
    (change.rate !== undefined &&
      new Prisma.Decimal(change.rate).comparedTo(existing.rate) !== 0) ||
    (change.currency !== undefined && change.currency !== existing.currency) ||
    (change.activeFrom !== undefined &&
      change.activeFrom.slice(0, 10) !== existing.activeFrom.toISOString().slice(0, 10))
  ) {
    throw new BadRequestException(
      "Pricing on an inactive route may only have its end date shortened.",
    );
  }

  if (!change.activeTo) {
    throw new BadRequestException(
      "Pricing on an inactive route may only have its end date shortened.",
    );
  }

  const activeTo = new Date(change.activeTo);
  if (
    activeTo < existing.activeFrom ||
    (existing.activeTo !== null && activeTo > existing.activeTo)
  ) {
    throw new BadRequestException(
      "Pricing on an inactive route may only have its end date shortened.",
    );
  }

  return activeTo;
}
