import { RecordStatus } from "@prisma/client";
import { Type } from "class-transformer";
import { IsOptional, IsString, Length, Matches } from "class-validator";
import { PaginationQueryDto } from "../../common/dto/pagination-query.dto";

export class RouteListQueryDto extends PaginationQueryDto {
  @IsOptional()
  @Matches(/^(ACTIVE|INACTIVE|ALL)$/)
  status?: RecordStatus | "ALL";

  @IsOptional()
  @Type(() => String)
  @IsString()
  @Length(1, 120)
  search?: string;
}
