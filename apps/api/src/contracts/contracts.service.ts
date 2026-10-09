import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Prisma, RecordStatus } from "@prisma/client";
import { getInactiveRoutePricingCloseDate } from "../common/route-pricing-policy";
import { PrismaService } from "../prisma/prisma.service";
import {
  CreateContractDto,
  CreateContractRouteDto,
  UpdateContractRouteDto,
} from "./dto/create-contract.dto";

@Injectable()
export class ContractsService {
  constructor(private readonly prisma: PrismaService) {}
  async create(dto: CreateContractDto) {
    if (dto.endsOn && dto.endsOn < dto.startsOn)
      throw new BadRequestException("endsOn must be on or after startsOn.");
    return this.prisma.contract.create({
      data: {
        ...dto,
        startsOn: new Date(dto.startsOn),
        endsOn: dto.endsOn ? new Date(dto.endsOn) : undefined,
      },
    });
  }
  list() {
    return this.prisma.contract.findMany({
      include: {
        client: true,
        routes: {
          where: {
            OR: [{ activeTo: null }, { activeTo: { gte: new Date() } }],
          },
          include: { route: true },
        },
      },
      orderBy: { startsOn: "desc" },
    });
  }
  async addRoute(contractId: string, dto: CreateContractRouteDto) {
    const contract = await this.prisma.contract.findUnique({
      where: { id: contractId },
    });
    if (!contract) throw new NotFoundException("Contract not found.");
    const route = await this.prisma.route.findUnique({
      where: { id: dto.routeId },
    });
    if (!route) throw new NotFoundException("Route not found.");
    if (route.status === RecordStatus.INACTIVE) {
      throw new BadRequestException(
        "Cannot add pricing for an inactive route.",
      );
    }
    if (dto.activeTo && dto.activeTo < dto.activeFrom)
      throw new BadRequestException("activeTo must be on or after activeFrom.");
    return this.prisma.contractRoute.create({
      data: {
        contractId,
        routeId: dto.routeId,
        rate: new Prisma.Decimal(dto.rate),
        currency: dto.currency ?? "KES",
        activeFrom: new Date(dto.activeFrom),
        activeTo: dto.activeTo ? new Date(dto.activeTo) : undefined,
      },
    });
  }
  async updateRoute(
    contractId: string,
    routeId: string,
    dto: UpdateContractRouteDto,
  ) {
    const contractRoute = await this.prisma.contractRoute.findFirst({
      where: { id: routeId, contractId },
      include: { route: true },
    });
    if (!contractRoute)
      throw new NotFoundException("Contract route pricing not found.");
    const activeFrom = dto.activeFrom
      ? new Date(dto.activeFrom)
      : contractRoute.activeFrom;
    const activeTo = dto.activeTo
      ? new Date(dto.activeTo)
      : contractRoute.activeTo;
    if (activeTo && activeTo < activeFrom)
      throw new BadRequestException("activeTo must be on or after activeFrom.");

    const inactiveRouteCloseDate = getInactiveRoutePricingCloseDate(
      contractRoute.route.status,
      contractRoute,
      {
        contractId: contractRoute.contractId,
        rate: dto.rate,
        currency: dto.currency,
        activeFrom: dto.activeFrom,
        activeTo: dto.activeTo,
      },
    );
    if (inactiveRouteCloseDate) {
      return this.prisma.contractRoute.update({
        where: { id: routeId },
        data: { activeTo: inactiveRouteCloseDate },
        include: { route: true, contract: { include: { client: true } } },
      });
    }

    return this.prisma.contractRoute.update({
      where: { id: routeId },
      data: {
        rate: dto.rate ? new Prisma.Decimal(dto.rate) : undefined,
        currency: dto.currency,
        activeFrom: dto.activeFrom ? new Date(dto.activeFrom) : undefined,
        activeTo: dto.activeTo
          ? new Date(dto.activeTo)
          : dto.activeTo === undefined
            ? undefined
            : null,
      },
      include: { route: true, contract: { include: { client: true } } },
    });
  }
}
