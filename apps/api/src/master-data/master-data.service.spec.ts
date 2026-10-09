import { BadRequestException, ConflictException, NotFoundException } from "@nestjs/common";
import { RecordStatus } from "@prisma/client";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { PrismaService } from "../prisma/prisma.service";
import { MasterDataService } from "./master-data.service";

type MockMethod = ReturnType<typeof jest.fn>;
type PrismaMock = {
  route: {
    findUnique: MockMethod;
    create: MockMethod;
    update: MockMethod;
    findMany: MockMethod;
    count: MockMethod;
    findUniqueOrThrow: MockMethod;
  };
  contract: { findUnique: MockMethod };
  contractRoute: { create: MockMethod; update: MockMethod };
  $transaction: MockMethod;
};

describe("MasterDataService routes", () => {
  let prisma: PrismaMock;
  let service: MasterDataService;

  beforeEach(() => {
    prisma = {
      route: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
        findUniqueOrThrow: jest.fn(),
      },
      contract: {
        findUnique: jest.fn(),
      },
      contractRoute: {
        create: jest.fn(),
        update: jest.fn(),
      },
      $transaction: jest.fn(),
    };

    service = new MasterDataService(prisma as unknown as PrismaService);
  });

  it("creates a route when the payload is valid", async () => {
    prisma.route.findUnique.mockResolvedValue(null);
    prisma.$transaction.mockImplementation(
      async (
        callback: (
          tx: Pick<PrismaMock, "route" | "contract" | "contractRoute">,
        ) => Promise<unknown>,
      ) =>
        callback({
          route: prisma.route,
          contract: prisma.contract,
          contractRoute: prisma.contractRoute,
        }),
    );
    prisma.route.create.mockResolvedValue({ id: "route-1" });
    prisma.route.findUniqueOrThrow.mockResolvedValue({
      id: "route-1",
      origin: "Kumpar",
      destination: "Ngong",
      status: RecordStatus.ACTIVE,
      contracts: [],
    });

    const result = await service.createRoute({
      origin: "Kumpar",
      destination: "Ngong",
    });

    expect(prisma.route.create).toHaveBeenCalledWith({
      data: { origin: "Kumpar", destination: "Ngong" },
    });
    expect(result.origin).toBe("Kumpar");
  });

  it("rejects a route when the payload is missing pricing details", async () => {
    await expect(
      service.createRoute({
        origin: "Kumpar",
        destination: "Ngong",
        contractId: "123e4567-e89b-12d3-a456-426614174000",
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it("rejects a duplicate physical route", async () => {
    prisma.route.findUnique.mockResolvedValue({ id: "route-1" });

    await expect(
      service.createRoute({
        origin: "Kumpar",
        destination: "Ngong",
      }),
    ).rejects.toThrow(ConflictException);
  });

  it("lists routes with pagination metadata", async () => {
    const row = {
      id: "route-1",
      origin: "Kumpar",
      destination: "Ngong",
      status: RecordStatus.ACTIVE,
      contracts: [],
    };

    prisma.$transaction.mockResolvedValue([[row], 1]);

    const result = await service.listRoutes({ page: 1, pageSize: 10 });

    expect(result.data).toHaveLength(1);
    expect(result.total).toBe(1);
    expect(result.totalPages).toBe(1);
    expect(result.page).toBe(1);
    expect(result.pageSize).toBe(10);
    expect(prisma.route.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {},
        skip: 0,
        take: 10,
        orderBy: [
          { origin: "asc" },
          { destination: "asc" },
          { id: "asc" },
        ],
      }),
    );
  });

  it("filters inactive routes when status is requested", async () => {
    const row = {
      id: "route-1",
      origin: "Kumpar",
      destination: "Ngong",
      status: RecordStatus.INACTIVE,
      contracts: [],
    };

    prisma.$transaction.mockResolvedValue([[row], 1]);

    const result = await service.listRoutes({
      page: 1,
      pageSize: 10,
      status: RecordStatus.INACTIVE,
    });

    expect(result.data[0]?.status).toBe(RecordStatus.INACTIVE);
    expect(prisma.route.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { status: RecordStatus.INACTIVE },
      }),
    );
  });

  it("applies search and allowed sorting on the server query", async () => {
    prisma.$transaction.mockResolvedValue([[], 0]);

    await service.listRoutes({
      page: 2,
      pageSize: 10,
      status: RecordStatus.ACTIVE,
      search: "Kumpar",
      sortBy: "destination",
      sortDirection: "desc",
    });

    expect(prisma.route.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          status: RecordStatus.ACTIVE,
          OR: [
            { origin: { contains: "Kumpar", mode: "insensitive" } },
            { destination: { contains: "Kumpar", mode: "insensitive" } },
          ],
        },
        skip: 10,
        take: 10,
        orderBy: [
          { destination: "desc" },
          { origin: "asc" },
          { id: "asc" },
        ],
      }),
    );
  });

  it("updates an existing route and throws when the route is missing", async () => {
    prisma.route.findUnique.mockResolvedValue(null);

    await expect(
      service.updateRoute("missing-route", { origin: "Kumpar", destination: "Thika" }),
    ).rejects.toThrow(NotFoundException);
  });

  it("deactivates an active route", async () => {
    prisma.route.findUnique.mockResolvedValue({
      id: "route-1",
      origin: "Kumpar",
      destination: "Ngong",
      status: RecordStatus.ACTIVE,
    });
    prisma.route.update.mockResolvedValue({
      id: "route-1",
      status: RecordStatus.INACTIVE,
      origin: "Kumpar",
      destination: "Ngong",
      contracts: [],
    });

    const result = await service.deactivateRoute("route-1");

    expect(prisma.route.update).toHaveBeenCalledWith({
      where: { id: "route-1" },
      data: { status: RecordStatus.INACTIVE },
      include: {
        contracts: {
          orderBy: { activeFrom: "desc" },
          include: { contract: { include: { client: true } } },
        },
      },
    });
    expect(result.status).toBe(RecordStatus.INACTIVE);
  });

  it("rejects adding pricing to an inactive route through the route API", async () => {
    prisma.route.findUnique.mockResolvedValue({
      id: "route-1",
      status: RecordStatus.INACTIVE,
      contracts: [],
    });
    prisma.contract.findUnique.mockResolvedValue({ id: "contract-1" });
    prisma.$transaction.mockImplementation(
      (callback: (tx: typeof prisma) => Promise<unknown>) => callback(prisma),
    );

    await expect(
      service.updateRoutePricing("route-1", {
        contractId: "contract-1",
        rate: "1200",
        activeFrom: "2026-01-01",
      }),
    ).rejects.toThrow(BadRequestException);

    expect(prisma.contractRoute.create).not.toHaveBeenCalled();
  });
});
