import { ConflictException, NotFoundException } from "@nestjs/common";
import { AssetStatus, Prisma, RecordStatus } from "@prisma/client";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { PrismaService } from "../prisma/prisma.service";
import { MasterDataService } from "./master-data.service";

type MockMethod = ReturnType<typeof jest.fn>;
type PrismaMock = {
  asset: {
    create: MockMethod;
    findUnique: MockMethod;
    update: MockMethod;
    findMany: MockMethod;
    count: MockMethod;
  };
  driver: {
    create: MockMethod;
    findUnique: MockMethod;
    update: MockMethod;
    findMany: MockMethod;
    count: MockMethod;
  };
  $transaction: MockMethod;
};

describe("MasterDataService assets and drivers", () => {
  let prisma: PrismaMock;
  let service: MasterDataService;

  beforeEach(() => {
    prisma = {
      asset: {
        create: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
      },
      driver: {
        create: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
      },
      $transaction: jest.fn(),
    };
    service = new MasterDataService(prisma as unknown as PrismaService);
  });

  it("creates an asset using only the established fleet fields", async () => {
    prisma.asset.create.mockResolvedValue({
      id: "asset-1",
      registration: "SYNTHETIC-01",
      description: "Test lorry",
      status: AssetStatus.ACTIVE,
    });

    await service.createAsset({
      registration: "SYNTHETIC-01",
      description: "Test lorry",
    });

    expect(prisma.asset.create).toHaveBeenCalledWith({
      data: {
        registration: "SYNTHETIC-01",
        description: "Test lorry",
      },
    });
  });

  it("maps duplicate asset registrations to a conflict response", async () => {
    prisma.asset.create.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError("Unique constraint failed", {
        code: "P2002",
        clientVersion: "6.15.0",
        meta: { target: ["registration"] },
      }),
    );

    await expect(
      service.createAsset({
        registration: "SYNTHETIC-01",
        description: "Test lorry",
      }),
    ).rejects.toThrow(ConflictException);
  });

  it("lists assets with status/search filters and bounded pagination", async () => {
    prisma.$transaction.mockResolvedValue([[], 0]);

    const result = await service.listAssets({
      page: 2,
      pageSize: 10,
      status: AssetStatus.ACTIVE,
      search: "KCA",
    });

    expect(result.totalPages).toBe(0);
    expect(prisma.asset.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          status: AssetStatus.ACTIVE,
          OR: [
            { registration: { contains: "KCA", mode: "insensitive" } },
            { description: { contains: "KCA", mode: "insensitive" } },
          ],
        },
        skip: 10,
        take: 10,
        select: expect.objectContaining({ registration: true }),
      }),
    );
  });

  it("returns asset detail with related-record counts and throws for missing assets", async () => {
    prisma.asset.findUnique.mockResolvedValue(null);
    await expect(service.getAsset("missing")).rejects.toThrow(NotFoundException);

    prisma.asset.findUnique.mockResolvedValue({
      id: "asset-1",
      registration: "KCA 123A",
      description: "Canter",
      status: AssetStatus.ACTIVE,
      _count: { trips: 2, maintenance: 1, documents: 0 },
    });
    await expect(service.getAsset("asset-1")).resolves.toMatchObject({
      _count: { trips: 2, maintenance: 1, documents: 0 },
    });
  });

  it("updates asset data and deactivates without deleting it", async () => {
    prisma.asset.findUnique.mockResolvedValue({ id: "asset-1" });
    prisma.asset.update.mockResolvedValue({
      id: "asset-1",
      status: AssetStatus.INACTIVE,
    });

    await service.updateAsset("asset-1", { description: "Updated lorry" });
    await service.deactivateAsset("asset-1");

    expect(prisma.asset.update).toHaveBeenNthCalledWith(1, {
      where: { id: "asset-1" },
      data: { description: "Updated lorry" },
    });
    expect(prisma.asset.update).toHaveBeenNthCalledWith(2, {
      where: { id: "asset-1" },
      data: { status: AssetStatus.INACTIVE },
    });
  });

  it("lists drivers without phone numbers in the list projection", async () => {
    prisma.$transaction.mockResolvedValue([[], 0]);

    await service.listDrivers({ page: 1, pageSize: 25, search: "Test" });

    expect(prisma.driver.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          OR: [{ fullName: { contains: "Test", mode: "insensitive" } }],
        },
        select: expect.not.objectContaining({ phoneNumber: true }),
      }),
    );
  });

  it("creates a driver with optional synthetic contact data", async () => {
    prisma.driver.create.mockResolvedValue({
      id: "driver-1",
      fullName: "Synthetic Driver",
      phoneNumber: "+254700000001",
      status: RecordStatus.ACTIVE,
    });

    await service.createDriver({
      fullName: "Synthetic Driver",
      phoneNumber: "+254700000001",
    });

    expect(prisma.driver.create).toHaveBeenCalledWith({
      data: {
        fullName: "Synthetic Driver",
        phoneNumber: "+254700000001",
      },
    });
  });

  it("maps duplicate driver phone numbers to a conflict response", async () => {
    prisma.driver.create.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError("Unique constraint failed", {
        code: "P2002",
        clientVersion: "6.15.0",
        meta: { target: ["phone_number"] },
      }),
    );

    await expect(
      service.createDriver({
        fullName: "Synthetic Driver",
        phoneNumber: "+254700000001",
      }),
    ).rejects.toThrow(ConflictException);
  });

  it("updates and deactivates drivers while preserving their records", async () => {
    prisma.driver.findUnique.mockResolvedValue({ id: "driver-1" });
    prisma.driver.update.mockResolvedValue({
      id: "driver-1",
      status: RecordStatus.INACTIVE,
    });

    await service.updateDriver("driver-1", { fullName: "Synthetic Driver" });
    await service.deactivateDriver("driver-1");

    expect(prisma.driver.update).toHaveBeenNthCalledWith(1, {
      where: { id: "driver-1" },
      data: { fullName: "Synthetic Driver" },
    });
    expect(prisma.driver.update).toHaveBeenNthCalledWith(2, {
      where: { id: "driver-1" },
      data: { status: RecordStatus.INACTIVE },
    });
  });
});
