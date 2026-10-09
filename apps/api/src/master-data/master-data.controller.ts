import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from "@nestjs/common";
import {
  CreateAssetDto,
  CreateClientDto,
  CreateDriverDto,
  CreateRouteDto,
  UpdateAssetDto,
  UpdateDriverDto,
  UpdateRouteDto,
  UpdateRoutePricingDto,
} from "./dto/create-master-data.dto";
import { AssetListQueryDto } from "./dto/asset-query.dto";
import { DriverListQueryDto } from "./dto/driver-query.dto";
import { RouteListQueryDto } from "./dto/route-query.dto";
import { MasterDataService } from "./master-data.service";

@Controller()
export class MasterDataController {
  constructor(private readonly service: MasterDataService) {}
  @Post("clients") createClient(@Body() dto: CreateClientDto) {
    return this.service.createClient(dto);
  }
  @Get("clients") listClients() {
    return this.service.listClients();
  }
  @Post("assets") createAsset(@Body() dto: CreateAssetDto) {
    return this.service.createAsset(dto);
  }
  @Get("assets") listAssets(@Query() query: AssetListQueryDto) {
    return this.service.listAssets(query);
  }
  @Get("assets/:id") getAsset(@Param("id") id: string) {
    return this.service.getAsset(id);
  }
  @Patch("assets/:id") updateAsset(
    @Param("id") id: string,
    @Body() dto: UpdateAssetDto,
  ) {
    return this.service.updateAsset(id, dto);
  }
  @Delete("assets/:id") deactivateAsset(@Param("id") id: string) {
    return this.service.deactivateAsset(id);
  }
  @Post("drivers") createDriver(@Body() dto: CreateDriverDto) {
    return this.service.createDriver(dto);
  }
  @Get("drivers") listDrivers(@Query() query: DriverListQueryDto) {
    return this.service.listDrivers(query);
  }
  @Get("drivers/:id") getDriver(@Param("id") id: string) {
    return this.service.getDriver(id);
  }
  @Patch("drivers/:id") updateDriver(
    @Param("id") id: string,
    @Body() dto: UpdateDriverDto,
  ) {
    return this.service.updateDriver(id, dto);
  }
  @Delete("drivers/:id") deactivateDriver(@Param("id") id: string) {
    return this.service.deactivateDriver(id);
  }
  @Post("routes") createRoute(@Body() dto: CreateRouteDto) {
    return this.service.createRoute(dto);
  }
  @Patch("routes/:id") updateRoute(
    @Param("id") id: string,
    @Body() dto: UpdateRouteDto,
  ) {
    return this.service.updateRoute(id, dto);
  }
  @Patch("routes/:id/pricing") updateRoutePricing(
    @Param("id") id: string,
    @Body() dto: UpdateRoutePricingDto,
  ) {
    return this.service.updateRoutePricing(id, dto);
  }
  @Delete("routes/:id") deactivateRoute(@Param("id") id: string) {
    return this.service.deactivateRoute(id);
  }
  @Get("routes") listRoutes(@Query() query: RouteListQueryDto) {
    return this.service.listRoutes(query);
  }
}
