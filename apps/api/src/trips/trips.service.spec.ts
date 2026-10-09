import { BadRequestException } from "@nestjs/common";
import { RecordStatus } from "@prisma/client";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { TripsService } from "./trips.service";

describe("TripsService route status rules", () => {
  let prisma: any;
  let service: TripsService;

  beforeEach(() => {
    prisma = {
      contractRoute: { findUnique: jest.fn() },
      asset: { findUnique: jest.fn() },
      driver: { findUnique: jest.fn() },
      route: { findUnique: jest.fn() },
      trip: { create: jest.fn() },
    };
    service = new TripsService(prisma);
  });

  it("rejects creating a trip for an inactive physical route", async () => {
    prisma.contractRoute.findUnique.mockResolvedValue({
      id: "pricing-1",
      routeId: "route-1",
      activeFrom: new Date("2026-01-01T00:00:00.000Z"),
      activeTo: null,
      rate: "1200",
      currency: "KES",
    });
    prisma.asset.findUnique.mockResolvedValue({ id: "asset-1" });
    prisma.route.findUnique.mockResolvedValue({
      id: "route-1",
      status: RecordStatus.INACTIVE,
    });

    await expect(
      service.create({
        contractRouteId: "pricing-1",
        lorryId: "asset-1",
        occurredAt: "2026-06-01T00:00:00.000Z",
        cargoDescription: "Lime",
      }),
    ).rejects.toThrow(BadRequestException);

    expect(prisma.trip.create).not.toHaveBeenCalled();
  });
});
