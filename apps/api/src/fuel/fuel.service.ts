import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { FinancialPartyType, ObligationStatus, Prisma, RecordStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFuelPolicyDto, CreateFuelSettlementDto, CreateFuelTransactionDto } from './dto/fuel.dto';

function addMonths(date: Date, amount: number): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + amount, date.getUTCDate()));
}
function addDays(date: Date, amount: number): Date {
  const copy = new Date(date);
  copy.setUTCDate(copy.getUTCDate() + amount);
  return copy;
}

@Injectable()
export class FuelService {
  constructor(private readonly prisma: PrismaService) {}

  async createPolicy(dto: CreateFuelPolicyDto) {
    const cycleMonths = Number(dto.cycleMonths);
    const operatorCoverageMonths = Number(dto.operatorCoverageMonths);
    const clientCoverageMonths = Number(dto.clientCoverageMonths);
    if (cycleMonths <= 0 || operatorCoverageMonths < 0 || clientCoverageMonths < 0 || operatorCoverageMonths + clientCoverageMonths !== cycleMonths) {
      throw new BadRequestException('Coverage months must partition a positive cycle length.');
    }
    return this.prisma.fuelCoveragePolicy.create({ data: { contractId: dto.contractId, name: dto.name, cycleMonths, operatorCoverageMonths, clientCoverageMonths, cycleStartDate: new Date(dto.cycleStartDate), status: dto.status ?? RecordStatus.ACTIVE } });
  }

  async generatePeriods(policyId: string, throughDateText: string) {
    const policy = await this.prisma.fuelCoveragePolicy.findUnique({ where: { id: policyId }, include: { periods: { orderBy: { periodNumber: 'asc' } } } });
    if (!policy) throw new NotFoundException('Fuel coverage policy not found.');
    const throughDate = new Date(throughDateText);
    const lastPeriod = policy.periods.at(-1);
    let periodNumber = lastPeriod ? lastPeriod.periodNumber + 1 : 1;
    let periodStart = lastPeriod ? addDays(lastPeriod.periodEnd, 1) : policy.cycleStartDate;
    const periods: Array<{ policyId: string; periodNumber: number; periodStart: Date; periodEnd: Date; responsibleParty: FinancialPartyType }> = [];
    while (periodStart <= throughDate) {
      const periodEnd = addDays(addMonths(periodStart, 1), -1);
      const cyclePosition = (periodNumber - 1) % policy.cycleMonths;
      periods.push({ policyId, periodNumber, periodStart, periodEnd, responsibleParty: cyclePosition < policy.operatorCoverageMonths ? FinancialPartyType.OPERATOR : FinancialPartyType.CLIENT });
      periodNumber += 1;
      periodStart = addDays(periodEnd, 1);
    }
    if (periods.length === 0) return [];
    await this.prisma.fuelCoveragePeriod.createMany({ data: periods });
    return this.prisma.fuelCoveragePeriod.findMany({ where: { policyId, periodNumber: { gte: periods[0]!.periodNumber } }, orderBy: { periodNumber: 'asc' } });
  }

  async recordTransaction(dto: CreateFuelTransactionDto) {
    const trip = await this.prisma.trip.findUnique({ where: { id: dto.tripId }, include: { contractRoute: true } });
    if (!trip) throw new NotFoundException('Trip not found.');
    const purchasedAt = new Date(dto.purchasedAt);
    const policy = await this.prisma.fuelCoveragePolicy.findFirst({ where: { contractId: trip.contractRoute.contractId, status: RecordStatus.ACTIVE }, orderBy: { cycleStartDate: 'desc' } });
    if (!policy) throw new BadRequestException('No active fuel coverage policy exists for this trip contract.');
    const period = await this.prisma.fuelCoveragePeriod.findFirst({ where: { policyId: policy.id, periodStart: { lte: purchasedAt }, periodEnd: { gte: purchasedAt }, status: RecordStatus.ACTIVE } });
    if (!period) throw new BadRequestException('No generated coverage period contains this fuel purchase date.');
    const totalAmount = new Prisma.Decimal(dto.totalAmount);
    return this.prisma.$transaction(async (tx) => {
      const transaction = await tx.fuelTransaction.create({ data: { tripId: dto.tripId, purchasedAt, litres: dto.litres ? new Prisma.Decimal(dto.litres) : undefined, totalAmount, paymentParty: dto.paymentParty, receiptRef: dto.receiptRef, notes: dto.notes } });
      if (dto.paymentParty === period.responsibleParty) return transaction;
      await tx.fuelObligation.create({ data: { fuelTransactionId: transaction.id, coveragePeriodId: period.id, responsibleParty: period.responsibleParty, amount: totalAmount } });
      return transaction;
    });
  }

  async createSettlement(dto: CreateFuelSettlementDto) {
    const totalAmount = new Prisma.Decimal(dto.totalAmount);
    const allocationTotal = dto.allocations.reduce((total, allocation) => total.plus(allocation.amount), new Prisma.Decimal(0));
    if (!allocationTotal.equals(totalAmount)) throw new BadRequestException('Settlement total must exactly equal the sum of allocations.');
    const uniqueObligations = new Set(dto.allocations.map((allocation) => allocation.obligationId));
    if (uniqueObligations.size !== dto.allocations.length) throw new BadRequestException('An obligation can be allocated only once per settlement.');

    return this.prisma.$transaction(async (tx) => {
      if (dto.reference) {
        const existingSettlement = await tx.fuelSettlement.findUnique({ where: { reference: dto.reference } });
        if (existingSettlement) {
          throw new BadRequestException(`Settlement reference "${dto.reference}" already exists.`);
        }
      }

      const obligations = await tx.fuelObligation.findMany({ where: { id: { in: [...uniqueObligations] } } });
      if (obligations.length !== uniqueObligations.size) throw new NotFoundException('One or more fuel obligations were not found.');
      const obligationById = new Map(obligations.map((obligation) => [obligation.id, obligation]));
      for (const allocation of dto.allocations) {
        const obligation = obligationById.get(allocation.obligationId)!;
        const remaining = obligation.amount.minus(obligation.settledAmount);
        if (new Prisma.Decimal(allocation.amount).greaterThan(remaining)) throw new BadRequestException(`Allocation exceeds remaining balance for obligation ${allocation.obligationId}.`);
      }
      const settlement = await tx.fuelSettlement.create({ data: { settledAt: new Date(dto.settledAt), paidBy: dto.paidBy, totalAmount, reference: dto.reference, notes: dto.notes } });
      for (const allocation of dto.allocations) {
        const amount = new Prisma.Decimal(allocation.amount);
        const obligation = obligationById.get(allocation.obligationId)!;
        const settledAmount = obligation.settledAmount.plus(amount);
        await tx.fuelSettlementAllocation.create({ data: { settlementId: settlement.id, obligationId: obligation.id, amount } });
        await tx.fuelObligation.update({ where: { id: obligation.id }, data: { settledAmount, status: settledAmount.equals(obligation.amount) ? ObligationStatus.SETTLED : ObligationStatus.PARTIALLY_SETTLED } });
      }
      return tx.fuelSettlement.findUniqueOrThrow({ where: { id: settlement.id }, include: { allocations: true } });
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
  }

  listObligations() { return this.prisma.fuelObligation.findMany({ where: { status: { in: [ObligationStatus.OUTSTANDING, ObligationStatus.PARTIALLY_SETTLED] } }, include: { fuelTransaction: { include: { trip: true } }, coveragePeriod: true }, orderBy: { createdAt: 'asc' } }); }
}
