import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAssetDto, CreateClientDto, CreateDriverDto, CreateRouteDto, UpdateRouteDto } from './dto/create-master-data.dto';

@Injectable()
export class MasterDataService {
  constructor(private readonly prisma: PrismaService) {}
  createClient(dto: CreateClientDto) { return this.prisma.client.create({ data: dto }); }
  listClients() { return this.prisma.client.findMany({ orderBy: { name: 'asc' } }); }
  createAsset(dto: CreateAssetDto) { return this.prisma.asset.create({ data: dto }); }
  listAssets() { return this.prisma.asset.findMany({ orderBy: { registration: 'asc' } }); }
  createDriver(dto: CreateDriverDto) { return this.prisma.driver.create({ data: dto }); }
  listDrivers() { return this.prisma.driver.findMany({ orderBy: { fullName: 'asc' } }); }
  async createRoute(dto: CreateRouteDto) {
    const hasPricing = dto.contractId || dto.rate || dto.currency || dto.activeFrom || dto.activeTo;
    if (hasPricing && (!dto.contractId || !dto.rate || !dto.activeFrom)) {
      throw new BadRequestException('contractId, rate and activeFrom are required when route pricing is supplied.');
    }
    if (dto.activeTo && dto.activeFrom && dto.activeTo < dto.activeFrom) {
      throw new BadRequestException('activeTo must be on or after activeFrom.');
    }
    return this.prisma.$transaction(async (tx) => {
      const route = await tx.route.create({ data: { origin: dto.origin, destination: dto.destination } });
      if (!dto.contractId) return tx.route.findUniqueOrThrow({ where: { id: route.id }, include: { contracts: { include: { contract: { include: { client: true } } } } } });
      const contract = await tx.contract.findUnique({ where: { id: dto.contractId } });
      if (!contract) throw new NotFoundException('Contract not found.');
      await tx.contractRoute.create({ data: { contractId: dto.contractId, routeId: route.id, rate: new Prisma.Decimal(dto.rate!), currency: dto.currency ?? 'KES', activeFrom: new Date(dto.activeFrom!), activeTo: dto.activeTo ? new Date(dto.activeTo) : undefined } });
      return tx.route.findUniqueOrThrow({ where: { id: route.id }, include: { contracts: { include: { contract: { include: { client: true } } } } } });
    });
  }
  updateRoute(id: string, dto: UpdateRouteDto) { return this.prisma.route.update({ where: { id }, data: dto, include: { contracts: { include: { contract: { include: { client: true } } } } } }); }
  listRoutes() { return this.prisma.route.findMany({ include: { contracts: { include: { contract: { include: { client: true } } } } }, orderBy: [{ origin: 'asc' }, { destination: 'asc' }] }); }
}
