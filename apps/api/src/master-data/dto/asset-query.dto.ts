import { AssetStatus } from "@prisma/client";
import { IsEnum, IsOptional, IsString, Length } from "class-validator";
import { PaginationQueryDto } from "../../common/dto/pagination-query.dto";

export class AssetListQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsEnum(AssetStatus)
  status?: AssetStatus;

  @IsOptional()
  @IsString()
  @Length(1, 120)
  search?: string;
}
