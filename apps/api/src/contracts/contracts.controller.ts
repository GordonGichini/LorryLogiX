import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { CreateContractDto, CreateContractRouteDto, UpdateContractRouteDto } from './dto/create-contract.dto';
import { ContractsService } from './contracts.service';
@Controller('contracts') export class ContractsController {
  constructor(private readonly service: ContractsService) {}
  @Post() create(@Body() dto: CreateContractDto) { return this.service.create(dto); }
  @Get() list() { return this.service.list(); }
  @Post(':contractId/routes') addRoute(@Param('contractId') contractId: string, @Body() dto: CreateContractRouteDto) { return this.service.addRoute(contractId, dto); }
  @Patch(':contractId/routes/:routeId') updateRoute(@Param('contractId') contractId: string, @Param('routeId') routeId: string, @Body() dto: UpdateContractRouteDto) { return this.service.updateRoute(contractId, routeId, dto); }
}
