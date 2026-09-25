import { AssetStatus, RecordStatus } from '@prisma/client';
import { IsDateString, IsEnum, IsOptional, IsString, IsUUID, Length, Matches } from 'class-validator';

export class CreateClientDto {
  @IsString() @Length(2, 120) name!: string;
}
export class CreateAssetDto {
  @IsString() @Length(2, 40) registration!: string;
  @IsString() @Length(2, 200) description!: string;
  @IsOptional() @IsEnum(AssetStatus) status?: AssetStatus;
}
export class CreateDriverDto {
  @IsString() @Length(2, 120) fullName!: string;
  @IsOptional() @IsString() @Matches(/^\+?[0-9 -]{7,20}$/) phoneNumber?: string;
  @IsOptional() @IsEnum(RecordStatus) status?: RecordStatus;
}
export class CreateRouteDto {
  @IsString() @Length(2, 120) origin!: string;
  @IsString() @Length(2, 120) destination!: string;
  @IsOptional() @IsUUID() contractId?: string;
  @IsOptional() @Matches(/^\d+(\.\d{1,2})?$/) rate?: string;
  @IsOptional() @IsString() @Length(3, 3) currency?: string;
  @IsOptional() @IsDateString() activeFrom?: string;
  @IsOptional() @IsDateString() activeTo?: string;
}

export class UpdateRouteDto {
  @IsOptional() @IsString() @Length(2, 120) origin?: string;
  @IsOptional() @IsString() @Length(2, 120) destination?: string;
}
