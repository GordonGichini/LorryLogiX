import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CreateFuelPolicyDto, CreateFuelSettlementDto, CreateFuelTransactionDto, GenerateCoveragePeriodsDto } from './dto/fuel.dto';
import { FuelService } from './fuel.service';
@Controller('fuel') export class FuelController {
  constructor(private readonly service: FuelService) {}
  @Post('policies') createPolicy(@Body() dto: CreateFuelPolicyDto) { return this.service.createPolicy(dto); }
  @Post('policies/:id/periods') generatePeriods(@Param('id') id: string, @Body() dto: GenerateCoveragePeriodsDto) { return this.service.generatePeriods(id, dto.throughDate); }
  @Post('transactions') recordTransaction(@Body() dto: CreateFuelTransactionDto) { return this.service.recordTransaction(dto); }
  @Get('obligations') listObligations() { return this.service.listObligations(); }
  @Post('settlements') createSettlement(@Body() dto: CreateFuelSettlementDto) { return this.service.createSettlement(dto); }
}
