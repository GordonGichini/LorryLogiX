import { FinancialPartyType, RecordStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsDateString, IsEnum, IsOptional, IsString, IsUUID, Length, Matches, ValidateNested } from 'class-validator';

export class CreateFuelPolicyDto {
  @IsUUID() contractId!: string;
  @IsString() @Length(2, 100) name!: string;
  @Matches(/^\d+$/) cycleMonths!: string;
  @Matches(/^\d+$/) operatorCoverageMonths!: string;
  @Matches(/^\d+$/) clientCoverageMonths!: string;
  @IsDateString() cycleStartDate!: string;
  @IsOptional() @IsEnum(RecordStatus) status?: RecordStatus;
}
export class GenerateCoveragePeriodsDto { @IsDateString() throughDate!: string; }
export class CreateFuelTransactionDto {
  @IsUUID() tripId!: string;
  @IsDateString() purchasedAt!: string;
  @IsOptional() @Matches(/^\d+(\.\d{1,3})?$/) litres?: string;
  @Matches(/^\d+(\.\d{1,2})?$/) totalAmount!: string;
  @IsEnum(FinancialPartyType) paymentParty!: FinancialPartyType;
  @IsOptional() @IsString() @Length(1, 100) receiptRef?: string;
  @IsOptional() @IsString() @Length(1, 2000) notes?: string;
}
export class SettlementAllocationDto { @IsUUID() obligationId!: string; @Matches(/^\d+(\.\d{1,2})?$/) amount!: string; }
export class CreateFuelSettlementDto {
  @IsDateString() settledAt!: string;
  @IsEnum(FinancialPartyType) paidBy!: FinancialPartyType;
  @Matches(/^\d+(\.\d{1,2})?$/) totalAmount!: string;
  @IsOptional() @IsString() @Length(1, 100) reference?: string;
  @IsOptional() @IsString() @Length(1, 2000) notes?: string;
  @IsArray() @ArrayMinSize(1) @ValidateNested({ each: true }) @Type(() => SettlementAllocationDto) allocations!: SettlementAllocationDto[];
}
