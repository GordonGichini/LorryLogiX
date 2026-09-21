import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateContractDto, CreateContractRouteDto } from './dto/create-contract.dto';

@Injectable()
export class ContractsService {
  constructor(private readonly prisma: PrismaService) {}
  async create(dto: CreateContractDto) {
    if (dto.endsOn && dto.endsOn < dto.startsOn) throw new BadRequestException('endsOn must be on or after startsOn.');
    return this.prisma.contract.create({ data: { ...dto, startsOn: new Date(dto.startsOn), endsOn: dto.endsOn ? new Date(dto.endsOn) : undefined } });
  }
  list() { return this.prisma.contract.findMany({ include: { client: true, routes: { include: { route: true } } }, orderBy: { startsOn: 'desc' } }); }
  async addRoute(contractId: string, dto: CreateContractRouteDto) {
    const contract = await this.prisma.contract.findUnique({ where: { id: contractId } });
    if (!contract) throw new NotFoundException('Contract not found.');
    if (dto.activeTo && dto.activeTo < dto.activeFrom) throw new BadRequestException('activeTo must be on or after activeFrom.');
    return this.prisma.contractRoute.create({ data: { contractId, routeId: dto.routeId, rate: new Prisma.Decimal(dto.rate), activeFrom: new Date(dto.activeFrom), activeTo: dto.activeTo ? new Date(dto.activeTo) : undefined } });
  }
}
