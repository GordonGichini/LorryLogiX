import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CreateContractDto, CreateContractRouteDto } from './dto/create-contract.dto';
import { ContractsService } from './contracts.service';
@Controller('contracts') export class ContractsController {
  constructor(private readonly service: ContractsService) {}
  @Post() create(@Body() dto: CreateContractDto) { return this.service.create(dto); }
  @Get() list() { return this.service.list(); }
  @Post(':contractId/routes') addRoute(@Param('contractId') contractId: string, @Body() dto: CreateContractRouteDto) { return this.service.addRoute(contractId, dto); }
}
