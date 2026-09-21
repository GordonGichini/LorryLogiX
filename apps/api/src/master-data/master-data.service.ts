import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAssetDto, CreateClientDto, CreateDriverDto, CreateRouteDto } from './dto/create-master-data.dto';

@Injectable()
export class MasterDataService {
  constructor(private readonly prisma: PrismaService) {}
  createClient(dto: CreateClientDto) { return this.prisma.client.create({ data: dto }); }
  listClients() { return this.prisma.client.findMany({ orderBy: { name: 'asc' } }); }
  createAsset(dto: CreateAssetDto) { return this.prisma.asset.create({ data: dto }); }
  listAssets() { return this.prisma.asset.findMany({ orderBy: { registration: 'asc' } }); }
  createDriver(dto: CreateDriverDto) { return this.prisma.driver.create({ data: dto }); }
  listDrivers() { return this.prisma.driver.findMany({ orderBy: { fullName: 'asc' } }); }
  createRoute(dto: CreateRouteDto) { return this.prisma.route.create({ data: dto }); }
  listRoutes() { return this.prisma.route.findMany({ orderBy: [{ origin: 'asc' }, { destination: 'asc' }] }); }
}
