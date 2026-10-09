import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { AssetStatus, Prisma, RecordStatus } from "@prisma/client";
import { toPaginatedResult } from "../common/pagination";
import { getInactiveRoutePricingCloseDate } from "../common/route-pricing-policy";
import { PrismaService } from "../prisma/prisma.service";
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

@Injectable()
export class MasterDataService {
  constructor(private readonly prisma: PrismaService) {}
  createClient(dto: CreateClientDto) {
    return this.prisma.client.create({ data: dto });
  }
  listClients() {
    return this.prisma.client.findMany({ orderBy: { name: "asc" } });
  }
  async createAsset(dto: CreateAssetDto) {
    try {
      return await this.prisma.asset.create({ data: dto });
    } catch (error) {
      this.throwIfUniqueConstraint(error, "An asset with this registration already exists.");
      throw error;
    }
  }
  async listAssets(query: AssetListQueryDto) {
    const where: Prisma.AssetWhereInput = {};
    const search = query.search?.trim();
    if (query.status) where.status = query.status;
    if (search) {
      where.OR = [
        { registration: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }
    const [data, total] = await this.prisma.$transaction([
      this.prisma.asset.findMany({
        where,
        orderBy: [{ registration: "asc" }, { id: "asc" }],
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
        select: {
          id: true,
          registration: true,
          description: true,
          status: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      this.prisma.asset.count({ where }),
    ]);
    return toPaginatedResult(data, total, query.page, query.pageSize);
  }
  async getAsset(id: string) {
    const asset = await this.prisma.asset.findUnique({
      where: { id },
      select: {
        id: true,
        registration: true,
        description: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        _count: { select: { trips: true, maintenance: true, documents: true } },
      },
    });
    if (!asset) throw new NotFoundException("Asset not found.");
    return asset;
  }
  async updateAsset(id: string, dto: UpdateAssetDto) {
    await this.ensureAssetExists(id);
    try {
      return await this.prisma.asset.update({ where: { id }, data: dto });
    } catch (error) {
      this.throwIfUniqueConstraint(error, "An asset with this registration already exists.");
      throw error;
    }
  }
  async deactivateAsset(id: string) {
    await this.ensureAssetExists(id);
    return this.prisma.asset.update({
      where: { id },
      data: { status: AssetStatus.INACTIVE },
    });
  }
  async createDriver(dto: CreateDriverDto) {
    try {
      return await this.prisma.driver.create({ data: dto });
    } catch (error) {
      this.throwIfUniqueConstraint(error, "A driver with this phone number already exists.");
      throw error;
    }
  }
  async listDrivers(query: DriverListQueryDto) {
    const where: Prisma.DriverWhereInput = {};
    const search = query.search?.trim();
    if (query.status) where.status = query.status;
    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: "insensitive" } },
      ];
    }
    const [data, total] = await this.prisma.$transaction([
      this.prisma.driver.findMany({
        where,
        orderBy: [{ fullName: "asc" }, { id: "asc" }],
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
        select: {
          id: true,
          fullName: true,
          status: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      this.prisma.driver.count({ where }),
    ]);
    return toPaginatedResult(data, total, query.page, query.pageSize);
  }
  async getDriver(id: string) {
    const driver = await this.prisma.driver.findUnique({
      where: { id },
      select: {
        id: true,
        fullName: true,
        phoneNumber: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        _count: { select: { trips: true } },
      },
    });
    if (!driver) throw new NotFoundException("Driver not found.");
    return driver;
  }
  async updateDriver(id: string, dto: UpdateDriverDto) {
    await this.ensureDriverExists(id);
    try {
      return await this.prisma.driver.update({ where: { id }, data: dto });
    } catch (error) {
      this.throwIfUniqueConstraint(error, "A driver with this phone number already exists.");
      throw error;
    }
  }
  async deactivateDriver(id: string) {
    await this.ensureDriverExists(id);
    return this.prisma.driver.update({
      where: { id },
      data: { status: RecordStatus.INACTIVE },
    });
  }
  private async ensureAssetExists(id: string): Promise<void> {
    const asset = await this.prisma.asset.findUnique({ where: { id }, select: { id: true } });
    if (!asset) throw new NotFoundException("Asset not found.");
  }
  private async ensureDriverExists(id: string): Promise<void> {
    const driver = await this.prisma.driver.findUnique({ where: { id }, select: { id: true } });
    if (!driver) throw new NotFoundException("Driver not found.");
  }
  private throwIfUniqueConstraint(error: unknown, message: string): void {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      throw new ConflictException(message);
    }
  }
  async createRoute(dto: CreateRouteDto) {
    const hasPricing =
      dto.contractId ||
      dto.rate ||
      dto.currency ||
      dto.activeFrom ||
      dto.activeTo;
    if (hasPricing && (!dto.contractId || !dto.rate || !dto.activeFrom)) {
      throw new BadRequestException(
        "contractId, rate and activeFrom are required when route pricing is supplied.",
      );
    }
    if (dto.activeTo && dto.activeFrom && dto.activeTo < dto.activeFrom) {
      throw new BadRequestException("activeTo must be on or after activeFrom.");
    }
    const existingRoute = await this.prisma.route.findUnique({
      where: {
        origin_destination: {
          origin: dto.origin,
          destination: dto.destination,
        },
      },
    });
    if (existingRoute)
      throw new ConflictException(
        "A route with this origin and destination already exists. Edit the existing route instead.",
      );
    return this.prisma.$transaction(async (tx) => {
      const route = await tx.route.create({
        data: { origin: dto.origin, destination: dto.destination },
      });
      if (!dto.contractId)
        return tx.route.findUniqueOrThrow({
          where: { id: route.id },
          include: {
            contracts: {
              orderBy: { activeFrom: "desc" },
              include: { contract: { include: { client: true } } },
            },
          },
        });
      const contract = await tx.contract.findUnique({
        where: { id: dto.contractId },
      });
      if (!contract) throw new NotFoundException("Contract not found.");
      await tx.contractRoute.create({
        data: {
          contractId: dto.contractId,
          routeId: route.id,
          rate: new Prisma.Decimal(dto.rate!),
          currency: dto.currency ?? "KES",
          activeFrom: new Date(dto.activeFrom!),
          activeTo: dto.activeTo ? new Date(dto.activeTo) : undefined,
        },
      });
      return tx.route.findUniqueOrThrow({
        where: { id: route.id },
        include: {
          contracts: {
            orderBy: { activeFrom: "desc" },
            include: { contract: { include: { client: true } } },
          },
        },
      });
    });
  }
  async updateRoute(id: string, dto: UpdateRouteDto) {
    const route = await this.prisma.route.findUnique({ where: { id } });
    if (!route) throw new NotFoundException("Route not found.");
    const origin = dto.origin ?? route.origin;
    const destination = dto.destination ?? route.destination;
    const duplicate = await this.prisma.route.findUnique({
      where: { origin_destination: { origin, destination } },
    });
    if (duplicate && duplicate.id !== id)
      throw new ConflictException(
        "A route with this origin and destination already exists.",
      );
    return this.prisma.route.update({
      where: { id },
      data: dto,
      include: {
        contracts: {
          orderBy: { activeFrom: "desc" },
          include: { contract: { include: { client: true } } },
        },
      },
    });
  }
  async deactivateRoute(id: string) {
    const route = await this.prisma.route.findUnique({ where: { id } });
    if (!route) throw new NotFoundException("Route not found.");
    return this.prisma.route.update({
      where: { id },
      data: { status: RecordStatus.INACTIVE },
      include: {
        contracts: {
          orderBy: { activeFrom: "desc" },
          include: { contract: { include: { client: true } } },
        },
      },
    });
  }
  async updateRoutePricing(routeId: string, dto: UpdateRoutePricingDto) {
    const route = await this.prisma.route.findUnique({
      where: { id: routeId },
      include: { contracts: { orderBy: { activeFrom: "desc" } } },
    });
    if (!route) throw new NotFoundException("Route not found.");
    const contract = await this.prisma.contract.findUnique({
      where: { id: dto.contractId },
    });
    if (!contract) throw new NotFoundException("Contract not found.");
    if (dto.activeTo && dto.activeTo < dto.activeFrom)
      throw new BadRequestException("activeTo must be on or after activeFrom.");
    return this.prisma.$transaction(async (tx) => {
      const currentPricing = route.contracts[0];
      const targetPricing = route.contracts.find(
        (pricing) => pricing.contractId === dto.contractId,
      );
      if (route.status === RecordStatus.INACTIVE) {
        const inactiveRouteCloseDate = getInactiveRoutePricingCloseDate(
          route.status,
          targetPricing,
          dto,
        );
        if (!targetPricing || !inactiveRouteCloseDate) {
          throw new BadRequestException(
            "Cannot add pricing for an inactive route.",
          );
        }
        return tx.contractRoute.update({
          where: { id: targetPricing.id },
          data: { activeTo: inactiveRouteCloseDate },
          include: { route: true, contract: { include: { client: true } } },
        });
      }
      if (targetPricing && targetPricing.id !== currentPricing?.id)
        throw new ConflictException(
          "This route already has pricing for the selected contract.",
        );
      if (
        currentPricing &&
        currentPricing.contractId !== dto.contractId &&
        new Date(dto.activeFrom) <= currentPricing.activeFrom
      ) {
        return tx.contractRoute.update({
          where: { id: currentPricing.id },
          data: {
            contractId: dto.contractId,
            rate: new Prisma.Decimal(dto.rate),
            currency: dto.currency ?? currentPricing.currency,
            activeFrom: new Date(dto.activeFrom),
            activeTo: dto.activeTo ? new Date(dto.activeTo) : null,
          },
          include: { route: true, contract: { include: { client: true } } },
        });
      }
      if (currentPricing && currentPricing.contractId !== dto.contractId) {
        const previousEnd = new Date(dto.activeFrom);
        previousEnd.setUTCDate(previousEnd.getUTCDate() - 1);
        await tx.contractRoute.update({
          where: { id: currentPricing.id },
          data: { activeTo: previousEnd },
        });
        return tx.contractRoute.create({
          data: {
            contractId: dto.contractId,
            routeId,
            rate: new Prisma.Decimal(dto.rate),
            currency: dto.currency ?? "KES",
            activeFrom: new Date(dto.activeFrom),
            activeTo: dto.activeTo ? new Date(dto.activeTo) : undefined,
          },
          include: { route: true, contract: { include: { client: true } } },
        });
      }
      if (!currentPricing)
        return tx.contractRoute.create({
          data: {
            contractId: dto.contractId,
            routeId,
            rate: new Prisma.Decimal(dto.rate),
            currency: dto.currency ?? "KES",
            activeFrom: new Date(dto.activeFrom),
            activeTo: dto.activeTo ? new Date(dto.activeTo) : undefined,
          },
          include: { route: true, contract: { include: { client: true } } },
        });
      return tx.contractRoute.update({
        where: { id: currentPricing.id },
        data: {
          rate: new Prisma.Decimal(dto.rate),
          currency: dto.currency ?? currentPricing.currency,
          activeFrom: new Date(dto.activeFrom),
          activeTo: dto.activeTo ? new Date(dto.activeTo) : null,
        },
        include: { route: true, contract: { include: { client: true } } },
      });
    });
  }
  async listRoutes(query: RouteListQueryDto) {
    const status = query.status === "ALL" ? undefined : query.status;
    const search = query.search?.trim();
    const where: Prisma.RouteWhereInput = {};

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { origin: { contains: search, mode: "insensitive" } },
        { destination: { contains: search, mode: "insensitive" } },
      ];
    }

    const sortBy = query.sortBy ?? "origin";
    const sortDirection = query.sortDirection ?? "asc";
    const orderBy: Prisma.RouteOrderByWithRelationInput[] =
      sortBy === "origin"
        ? [
            { origin: sortDirection },
            { destination: "asc" },
            { id: "asc" },
          ]
        : sortBy === "destination"
          ? [
              { destination: sortDirection },
              { origin: "asc" },
              { id: "asc" },
            ]
          : [
              { status: sortDirection },
              { origin: "asc" },
              { destination: "asc" },
              { id: "asc" },
            ];

    const [data, total] = await this.prisma.$transaction([
      this.prisma.route.findMany({
        where,
        include: {
          contracts: {
            orderBy: { activeFrom: "desc" },
            include: { contract: { include: { client: true } } },
          },
        },
        orderBy,
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
      this.prisma.route.count({ where }),
    ]);

    return toPaginatedResult(data, total, query.page, query.pageSize);
  }
}
