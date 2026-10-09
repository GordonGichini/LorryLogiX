import { BadRequestException } from "@nestjs/common";
import { AssetStatus, RecordStatus } from "@prisma/client";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { PrismaService } from "../prisma/prisma.service";
import { TripsService } from "./trips.service";

type MockMethod = ReturnType<typeof jest.fn>;
type PrismaMock = {
  contractRoute: { findUnique: MockMethod };
  asset: { findUnique: MockMethod };
  driver: { findUnique: MockMethod };
  route: { findUnique: MockMethod };
  trip: { create: MockMethod; findMany: MockMethod; count: MockMethod };
  $transaction: MockMethod;
};

describe("TripsService route status rules", () => {
  let prisma: PrismaMock;
  let service: TripsService;

  beforeEach(() => {
    prisma = {
      contractRoute: { findUnique: jest.fn() },
      asset: { findUnique: jest.fn() },
      driver: { findUnique: jest.fn() },
      route: { findUnique: jest.fn() },
      trip: {
        create: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
      },
      $transaction: jest.fn(),
    };
    service = new TripsService(prisma as unknown as PrismaService);
  });

  function validContractRoute() {
    return {
      id: "pricing-1",
      routeId: "route-1",
      activeFrom: new Date("2026-01-01T00:00:00.000Z"),
      activeTo: null,
      rate: "1200",
      currency: "KES",
    };
  }

  function validTrip() {
    return {
      contractRouteId: "pricing-1",
      lorryId: "asset-1",
      occurredAt: "2026-06-01T00:00:00.000Z",
      cargoDescription: "Lime",
    };
  }

  it("rejects creating a trip for an inactive physical route", async () => {
    prisma.contractRoute.findUnique.mockResolvedValue({
      ...validContractRoute(),
    });
    prisma.asset.findUnique.mockResolvedValue({
      id: "asset-1",
      status: AssetStatus.ACTIVE,
    });
    prisma.route.findUnique.mockResolvedValue({
      id: "route-1",
      status: RecordStatus.INACTIVE,
    });

    await expect(
      service.create(validTrip()),
    ).rejects.toThrow(BadRequestException);

    expect(prisma.trip.create).not.toHaveBeenCalled();
  });

  it("rejects a lorry that is inactive or under maintenance", async () => {
    prisma.contractRoute.findUnique.mockResolvedValue(validContractRoute());
    prisma.asset.findUnique.mockResolvedValue({
      id: "asset-1",
      status: AssetStatus.UNDER_MAINTENANCE,
    });

    await expect(service.create(validTrip())).rejects.toThrow(
      "A trip can only be assigned to an active lorry.",
    );
    expect(prisma.trip.create).not.toHaveBeenCalled();
  });

  it("rejects an inactive driver", async () => {
    prisma.contractRoute.findUnique.mockResolvedValue(validContractRoute());
    prisma.asset.findUnique.mockResolvedValue({
      id: "asset-1",
      status: AssetStatus.ACTIVE,
    });
    prisma.driver.findUnique.mockResolvedValue({
      id: "driver-1",
      status: RecordStatus.INACTIVE,
    });

    await expect(
      service.create({ ...validTrip(), driverId: "driver-1" }),
    ).rejects.toThrow("A trip can only be assigned to an active driver.");
    expect(prisma.trip.create).not.toHaveBeenCalled();
  });

  it("creates a trip with active asset and driver while retaining the rate snapshot", async () => {
    const contractRoute = validContractRoute();
    prisma.contractRoute.findUnique.mockResolvedValue(contractRoute);
    prisma.asset.findUnique.mockResolvedValue({
      id: "asset-1",
      status: AssetStatus.ACTIVE,
    });
    prisma.driver.findUnique.mockResolvedValue({
      id: "driver-1",
      status: RecordStatus.ACTIVE,
    });
    prisma.route.findUnique.mockResolvedValue({
      id: "route-1",
      status: RecordStatus.ACTIVE,
    });
    prisma.trip.create.mockResolvedValue({ id: "trip-1" });

    await service.create({ ...validTrip(), driverId: "driver-1" });

    expect(prisma.trip.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          lorryId: "asset-1",
          driverId: "driver-1",
          agreedRate: contractRoute.rate,
          currency: contractRoute.currency,
        }),
      }),
    );
  });

  it("keeps historical trips listable after related profiles are deactivated", async () => {
    const historicalTrip = {
      id: "trip-1",
      lorry: { id: "asset-1", status: AssetStatus.INACTIVE },
      driver: { id: "driver-1", status: RecordStatus.INACTIVE },
    };
    prisma.$transaction.mockResolvedValue([[historicalTrip], 1]);

    const result = await service.list({ page: 1, pageSize: 20 });

    expect(result.data[0]).toEqual(historicalTrip);
    expect(prisma.trip.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        include: expect.objectContaining({
          lorry: true,
          driver: true,
        }),
        where: {},
      }),
    );
  });
});
