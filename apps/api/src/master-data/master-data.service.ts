import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, RecordStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAssetDto, CreateClientDto, CreateDriverDto, CreateRouteDto, UpdateRouteDto, UpdateRoutePricingDto } from './dto/create-master-data.dto';

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
    const existingRoute = await this.prisma.route.findUnique({ where: { origin_destination: { origin: dto.origin, destination: dto.destination } } });
    if (existingRoute) throw new ConflictException('A route with this origin and destination already exists. Edit the existing route instead.');
    return this.prisma.$transaction(async (tx) => {
      const route = await tx.route.create({ data: { origin: dto.origin, destination: dto.destination } });
      if (!dto.contractId) return tx.route.findUniqueOrThrow({ where: { id: route.id }, include: { contracts: { orderBy: { activeFrom: 'desc' }, include: { contract: { include: { client: true } } } } } });
      const contract = await tx.contract.findUnique({ where: { id: dto.contractId } });
      if (!contract) throw new NotFoundException('Contract not found.');
      await tx.contractRoute.create({ data: { contractId: dto.contractId, routeId: route.id, rate: new Prisma.Decimal(dto.rate!), currency: dto.currency ?? 'KES', activeFrom: new Date(dto.activeFrom!), activeTo: dto.activeTo ? new Date(dto.activeTo) : undefined } });
      return tx.route.findUniqueOrThrow({ where: { id: route.id }, include: { contracts: { orderBy: { activeFrom: 'desc' }, include: { contract: { include: { client: true } } } } } });
    });
  }
  async updateRoute(id: string, dto: UpdateRouteDto) {
    const route = await this.prisma.route.findUnique({ where: { id } });
    if (!route) throw new NotFoundException('Route not found.');
    const origin = dto.origin ?? route.origin;
    const destination = dto.destination ?? route.destination;
    const duplicate = await this.prisma.route.findUnique({ where: { origin_destination: { origin, destination } } });
    if (duplicate && duplicate.id !== id) throw new ConflictException('A route with this origin and destination already exists.');
    return this.prisma.route.update({ where: { id }, data: dto, include: { contracts: { orderBy: { activeFrom: 'desc' }, include: { contract: { include: { client: true } } } } } });
  }
  async deactivateRoute(id: string) {
    const route = await this.prisma.route.findUnique({ where: { id } });
    if (!route) throw new NotFoundException('Route not found.');
    return this.prisma.route.update({ where: { id }, data: { status: RecordStatus.INACTIVE }, include: { contracts: { orderBy: { activeFrom: 'desc' }, include: { contract: { include: { client: true } } } } } });
  }
  async updateRoutePricing(routeId: string, dto: UpdateRoutePricingDto) {
    const route = await this.prisma.route.findUnique({ where: { id: routeId }, include: { contracts: { orderBy: { activeFrom: 'desc' } } } });
    if (!route) throw new NotFoundException('Route not found.');
    const contract = await this.prisma.contract.findUnique({ where: { id: dto.contractId } });
    if (!contract) throw new NotFoundException('Contract not found.');
    if (dto.activeTo && dto.activeTo < dto.activeFrom) throw new BadRequestException('activeTo must be on or after activeFrom.');
    return this.prisma.$transaction(async (tx) => {
      const currentPricing = route.contracts[0];
      const targetPricing = route.contracts.find((pricing) => pricing.contractId === dto.contractId);
      if (targetPricing && targetPricing.id !== currentPricing?.id) throw new ConflictException('This route already has pricing for the selected contract.');
      if (currentPricing && currentPricing.contractId !== dto.contractId && new Date(dto.activeFrom) <= currentPricing.activeFrom) {
        return tx.contractRoute.update({ where: { id: currentPricing.id }, data: { contractId: dto.contractId, rate: new Prisma.Decimal(dto.rate), currency: dto.currency ?? currentPricing.currency, activeFrom: new Date(dto.activeFrom), activeTo: dto.activeTo ? new Date(dto.activeTo) : null }, include: { route: true, contract: { include: { client: true } } } });
      }
      if (currentPricing && currentPricing.contractId !== dto.contractId) {
        const previousEnd = new Date(dto.activeFrom);
        previousEnd.setUTCDate(previousEnd.getUTCDate() - 1);
        await tx.contractRoute.update({ where: { id: currentPricing.id }, data: { activeTo: previousEnd } });
        return tx.contractRoute.create({ data: { contractId: dto.contractId, routeId, rate: new Prisma.Decimal(dto.rate), currency: dto.currency ?? 'KES', activeFrom: new Date(dto.activeFrom), activeTo: dto.activeTo ? new Date(dto.activeTo) : undefined }, include: { route: true, contract: { include: { client: true } } } });
      }
      if (!currentPricing) return tx.contractRoute.create({ data: { contractId: dto.contractId, routeId, rate: new Prisma.Decimal(dto.rate), currency: dto.currency ?? 'KES', activeFrom: new Date(dto.activeFrom), activeTo: dto.activeTo ? new Date(dto.activeTo) : undefined }, include: { route: true, contract: { include: { client: true } } } });
      return tx.contractRoute.update({ where: { id: currentPricing.id }, data: { rate: new Prisma.Decimal(dto.rate), currency: dto.currency ?? currentPricing.currency, activeFrom: new Date(dto.activeFrom), activeTo: dto.activeTo ? new Date(dto.activeTo) : null }, include: { route: true, contract: { include: { client: true } } } });
    });
  }
  listRoutes() { return this.prisma.route.findMany({ include: { contracts: { orderBy: { activeFrom: 'desc' }, include: { contract: { include: { client: true } } } } }, orderBy: [{ origin: 'asc' }, { destination: 'asc' }] }); }
}
