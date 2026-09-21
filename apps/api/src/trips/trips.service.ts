import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, TripStatus } from '@prisma/client';
import { toPaginatedResult } from '../common/pagination';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTripDto, TripListQueryDto } from './dto/trip.dto';

const allowedTransitions: Readonly<Record<TripStatus, readonly TripStatus[]>> = {
  PLANNED: [TripStatus.DISPATCHED, TripStatus.CANCELLED],
  DISPATCHED: [TripStatus.IN_TRANSIT, TripStatus.CANCELLED, TripStatus.FAILED],
  IN_TRANSIT: [TripStatus.DELIVERED, TripStatus.FAILED],
  DELIVERED: [TripStatus.COMPLETED],
  COMPLETED: [],
  CANCELLED: [],
  FAILED: [],
};

@Injectable()
export class TripsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateTripDto) {
    const [contractRoute, asset, driver] = await Promise.all([
      this.prisma.contractRoute.findUnique({ where: { id: dto.contractRouteId } }),
      this.prisma.asset.findUnique({ where: { id: dto.lorryId } }),
      dto.driverId ? this.prisma.driver.findUnique({ where: { id: dto.driverId } }) : Promise.resolve(null),
    ]);
    if (!contractRoute) throw new NotFoundException('Contract route not found.');
    if (!asset) throw new NotFoundException('Lorry asset not found.');
    if (dto.driverId && !driver) throw new NotFoundException('Driver not found.');
    const occurredAt = new Date(dto.occurredAt);
    if (occurredAt < contractRoute.activeFrom || (contractRoute.activeTo && occurredAt > contractRoute.activeTo)) throw new BadRequestException('The contract route is not active on the trip date.');
    return this.prisma.trip.create({ data: {
      contractRouteId: dto.contractRouteId, lorryId: dto.lorryId, driverId: dto.driverId,
      occurredAt, cargoDescription: dto.cargoDescription, cargoQuantity: dto.cargoQuantity ? new Prisma.Decimal(dto.cargoQuantity) : undefined,
      cargoUnit: dto.cargoUnit, notes: dto.notes, agreedRate: contractRoute.rate, currency: contractRoute.currency,
    }, include: { contractRoute: { include: { route: true } }, lorry: true, driver: true } });
  }

  async list(query: TripListQueryDto) {
    const where = query.status ? { status: query.status } : {};
    const [data, total] = await this.prisma.$transaction([
      this.prisma.trip.findMany({ where, orderBy: { occurredAt: 'desc' }, skip: (query.page - 1) * query.pageSize, take: query.pageSize, include: { contractRoute: { include: { route: true } }, lorry: true, driver: true, deliveryNote: true } }),
      this.prisma.trip.count({ where }),
    ]);
    return toPaginatedResult(data, total, query.page, query.pageSize);
  }

  async updateStatus(id: string, nextStatus: TripStatus) {
    const trip = await this.prisma.trip.findUnique({ where: { id } });
    if (!trip) throw new NotFoundException('Trip not found.');
    if (!allowedTransitions[trip.status].includes(nextStatus)) throw new BadRequestException(`Cannot transition a ${trip.status} trip to ${nextStatus}.`);
    return this.prisma.trip.update({ where: { id }, data: { status: nextStatus } });
  }
}
