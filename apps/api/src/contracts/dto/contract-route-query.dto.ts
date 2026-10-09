import { Type } from "class-transformer";
import { IsDateString } from "class-validator";
import { PaginationQueryDto } from "../../common/dto/pagination-query.dto";

export class ContractRouteListQueryDto extends PaginationQueryDto {
  @Type(() => String)
  @IsDateString()
  activeOn!: string;
}
