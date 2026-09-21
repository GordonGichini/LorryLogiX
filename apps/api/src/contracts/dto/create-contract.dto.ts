import { ContractStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsDateString, IsEnum, IsOptional, IsString, IsUUID, Length, Matches } from 'class-validator';

export class CreateContractDto {
  @IsUUID() clientId!: string;
  @IsString() @Length(2, 80) reference!: string;
  @IsOptional() @IsString() @Length(2, 500) cargoDefault?: string;
  @IsDateString() startsOn!: string;
  @IsOptional() @IsDateString() endsOn?: string;
  @IsOptional() @IsEnum(ContractStatus) status?: ContractStatus;
}
export class CreateContractRouteDto {
  @IsUUID() routeId!: string;
  @Matches(/^\d+(\.\d{1,2})?$/) rate!: string;
  @IsDateString() activeFrom!: string;
  @IsOptional() @IsDateString() activeTo?: string;
}
