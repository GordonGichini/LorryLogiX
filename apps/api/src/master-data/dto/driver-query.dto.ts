import { RecordStatus } from "@prisma/client";
import { IsEnum, IsOptional, IsString, Length } from "class-validator";
import { PaginationQueryDto } from "../../common/dto/pagination-query.dto";

export class DriverListQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsEnum(RecordStatus)
  status?: RecordStatus;

  @IsOptional()
  @IsString()
  @Length(1, 120)
  search?: string;
}
