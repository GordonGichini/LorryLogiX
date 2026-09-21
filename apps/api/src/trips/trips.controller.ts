import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { CreateTripDto, TripListQueryDto, UpdateTripStatusDto } from './dto/trip.dto';
import { TripsService } from './trips.service';
@Controller('trips') export class TripsController {
  constructor(private readonly service: TripsService) {}
  @Post() create(@Body() dto: CreateTripDto) { return this.service.create(dto); }
  @Get() list(@Query() query: TripListQueryDto) { return this.service.list(query); }
  @Patch(':id/status') updateStatus(@Param('id') id: string, @Body() dto: UpdateTripStatusDto) { return this.service.updateStatus(id, dto.status); }
}
