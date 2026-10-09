import { BadRequestException } from "@nestjs/common";
import { Prisma, RecordStatus } from "@prisma/client";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { PrismaService } from "../prisma/prisma.service";
import { ContractsService } from "./contracts.service";

type MockMethod = ReturnType<typeof jest.fn>;
type PrismaMock = {
  contract: { findUnique: MockMethod };
  route: { findUnique: MockMethod };
  contractRoute: {
    create: MockMethod;
    findFirst: MockMethod;
    update: MockMethod;
    findMany: MockMethod;
    count: MockMethod;
  };
  $transaction: MockMethod;
};

describe("ContractsService route pricing", () => {
  let prisma: PrismaMock;
  let service: ContractsService;

  beforeEach(() => {
    prisma = {
      contract: { findUnique: jest.fn() },
      route: { findUnique: jest.fn() },
      contractRoute: {
        create: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
      },
      $transaction: jest.fn(),
    };
    service = new ContractsService(prisma as unknown as PrismaService);
  });

  it("rejects new contract pricing for an inactive route", async () => {
    prisma.contract.findUnique.mockResolvedValue({ id: "contract-1" });
    prisma.route.findUnique.mockResolvedValue({
      id: "route-1",
      status: RecordStatus.INACTIVE,
    });

    await expect(
      service.addRoute("contract-1", {
        routeId: "route-1",
        rate: "1200",
        activeFrom: "2026-01-01",
      }),
    ).rejects.toThrow(BadRequestException);

    expect(prisma.contractRoute.create).not.toHaveBeenCalled();
  });

  it("allows shortening the end date of existing inactive-route pricing", async () => {
    prisma.contractRoute.findFirst.mockResolvedValue({
      id: "pricing-1",
      contractId: "contract-1",
      rate: new Prisma.Decimal("1200"),
      currency: "KES",
      activeFrom: new Date("2026-01-01T00:00:00.000Z"),
      activeTo: null,
      route: { status: RecordStatus.INACTIVE },
    });
    prisma.contractRoute.update.mockResolvedValue({ id: "pricing-1" });

    await service.updateRoute("contract-1", "pricing-1", {
      activeTo: "2026-06-30",
    });

    expect(prisma.contractRoute.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "pricing-1" },
        data: { activeTo: new Date("2026-06-30") },
      }),
    );
  });

  it("rejects extending existing pricing on an inactive route", async () => {
    prisma.contractRoute.findFirst.mockResolvedValue({
      id: "pricing-1",
      contractId: "contract-1",
      rate: new Prisma.Decimal("1200"),
      currency: "KES",
      activeFrom: new Date("2026-01-01T00:00:00.000Z"),
      activeTo: new Date("2026-05-31T00:00:00.000Z"),
      route: { status: RecordStatus.INACTIVE },
    });

    await expect(
      service.updateRoute("contract-1", "pricing-1", {
        activeTo: "2026-06-30",
      }),
    ).rejects.toThrow(BadRequestException);

    expect(prisma.contractRoute.update).not.toHaveBeenCalled();
  });

  it("returns only route pricing effective on the requested trip date", async () => {
    prisma.$transaction.mockResolvedValue([[], 0]);

    const result = await service.listRoutesForTrip({
      activeOn: "2026-06-01",
      page: 2,
      pageSize: 10,
    });

    expect(result).toMatchObject({ page: 2, pageSize: 10, total: 0 });
    expect(prisma.contractRoute.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          activeFrom: { lte: new Date("2026-06-01") },
          AND: [
            {
              OR: [
                { activeTo: null },
                { activeTo: { gte: new Date("2026-06-01") } },
              ],
            },
            { route: { is: { status: RecordStatus.ACTIVE } } },
          ],
        },
        skip: 10,
        take: 10,
      }),
    );
  });
});
