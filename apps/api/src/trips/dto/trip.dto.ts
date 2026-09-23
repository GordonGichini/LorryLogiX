import { TripStatus } from '@prisma/client';
import { IsDateString, IsEnum, IsOptional, IsString, IsUUID, Length, Matches } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

export class CreateTripDto {
  @IsUUID() contractRouteId!: string;
  @IsUUID() lorryId!: string;
  @IsOptional() @IsUUID() driverId?: string;
  @IsDateString() occurredAt!: string;
  @IsString() @Length(2, 500) cargoDescription!: string;
  @IsOptional() @Matches(/^\d+(\.\d{1,3})?$/) cargoQuantity?: string;
  @IsOptional() @IsString() @Length(1, 30) cargoUnit?: string;
  @IsOptional() @IsString() @Length(1, 2000) notes?: string;
}
export class UpdateTripStatusDto { @IsEnum(TripStatus) status!: TripStatus; }
export class TripListQueryDto extends PaginationQueryDto { @IsOptional() @IsEnum(TripStatus) status?: TripStatus; }
