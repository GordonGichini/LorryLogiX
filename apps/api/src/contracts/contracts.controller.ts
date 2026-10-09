import { Body, Controller, Get, Param, Patch, Post, Query } from "@nestjs/common";
import {
  CreateContractDto,
  CreateContractRouteDto,
  UpdateContractRouteDto,
} from "./dto/create-contract.dto";
import { ContractRouteListQueryDto } from "./dto/contract-route-query.dto";
import { ContractsService } from "./contracts.service";

@Controller("contracts")
export class ContractsController {
  constructor(private readonly service: ContractsService) {}
  @Post() create(@Body() dto: CreateContractDto) {
    return this.service.create(dto);
  }
  @Get() list() {
    return this.service.list();
  }
  @Get("routes") listRoutesForTrip(@Query() query: ContractRouteListQueryDto) {
    return this.service.listRoutesForTrip(query);
  }
  @Post(":contractId/routes") addRoute(
    @Param("contractId") contractId: string,
    @Body() dto: CreateContractRouteDto,
  ) {
    return this.service.addRoute(contractId, dto);
  }
  @Patch(":contractId/routes/:routeId") updateRoute(
    @Param("contractId") contractId: string,
    @Param("routeId") routeId: string,
    @Body() dto: UpdateContractRouteDto,
  ) {
    return this.service.updateRoute(contractId, routeId, dto);
  }
}
