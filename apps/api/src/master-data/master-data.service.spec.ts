import { BadRequestException, ConflictException, NotFoundException } from "@nestjs/common";
import { RecordStatus } from "@prisma/client";
import { MasterDataService } from "./master-data.service";

describe("MasterDataService routes", () => {
  let prisma: any;
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

    service = new MasterDataService(prisma);
  });

  it("creates a route when the payload is valid", async () => {
    prisma.route.findUnique.mockResolvedValue(null);
    prisma.$transaction.mockImplementation(
      async (callback: (tx: typeof prisma) => Promise<unknown>) =>
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
});
