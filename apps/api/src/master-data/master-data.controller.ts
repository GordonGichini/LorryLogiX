import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { CreateAssetDto, CreateClientDto, CreateDriverDto, CreateRouteDto, UpdateRouteDto, UpdateRoutePricingDto } from './dto/create-master-data.dto';
import { MasterDataService } from './master-data.service';

@Controller()
export class MasterDataController {
  constructor(private readonly service: MasterDataService) {}
  @Post('clients') createClient(@Body() dto: CreateClientDto) { return this.service.createClient(dto); }
  @Get('clients') listClients() { return this.service.listClients(); }
  @Post('assets') createAsset(@Body() dto: CreateAssetDto) { return this.service.createAsset(dto); }
  @Get('assets') listAssets() { return this.service.listAssets(); }
  @Post('drivers') createDriver(@Body() dto: CreateDriverDto) { return this.service.createDriver(dto); }
  @Get('drivers') listDrivers() { return this.service.listDrivers(); }
  @Post('routes') createRoute(@Body() dto: CreateRouteDto) { return this.service.createRoute(dto); }
  @Patch('routes/:id') updateRoute(@Param('id') id: string, @Body() dto: UpdateRouteDto) { return this.service.updateRoute(id, dto); }
  @Patch('routes/:id/pricing') updateRoutePricing(@Param('id') id: string, @Body() dto: UpdateRoutePricingDto) { return this.service.updateRoutePricing(id, dto); }
  @Delete('routes/:id') deactivateRoute(@Param('id') id: string) { return this.service.deactivateRoute(id); }
  @Get('routes') listRoutes() { return this.service.listRoutes(); }
}
