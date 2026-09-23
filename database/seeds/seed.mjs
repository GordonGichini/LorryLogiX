import { PrismaClient, RecordStatus, ContractStatus, AssetStatus, TripStatus, FinancialPartyType } from '@prisma/client';

const prisma = new PrismaClient();

function isoDate(value) {
  return new Date(value);
}

async function ensureClient(name) {
  return prisma.client.upsert({
    where: { name },
    update: { status: RecordStatus.ACTIVE },
    create: { name, status: RecordStatus.ACTIVE },
  });
}

async function ensureRoute(origin, destination) {
  return prisma.route.upsert({
    where: { origin_destination: { origin, destination } },
    update: {},
    create: { origin, destination },
  });
}

async function ensureAsset(registration, description) {
  return prisma.asset.upsert({
    where: { registration },
    update: { description, status: AssetStatus.ACTIVE },
    create: { registration, description, status: AssetStatus.ACTIVE },
  });
}

async function ensureDriver(fullName, phoneNumber) {
  const existing = await prisma.driver.findFirst({ where: { fullName } });
  if (existing) return existing;
  return prisma.driver.create({
    data: {
      fullName,
      phoneNumber,
      status: RecordStatus.ACTIVE,
    },
  });
}

async function ensureContract(clientId, reference, startsOn, endsOn, cargoDefault = 'Lime mineral') {
  return prisma.contract.upsert({
    where: { reference },
    update: { clientId, startsOn: isoDate(startsOn), endsOn: endsOn ? isoDate(endsOn) : null, cargoDefault, status: ContractStatus.ACTIVE },
    create: {
      clientId,
      reference,
      cargoDefault,
      currency: 'KES',
      startsOn: isoDate(startsOn),
      endsOn: endsOn ? isoDate(endsOn) : null,
      status: ContractStatus.ACTIVE,
    },
  });
}

async function ensureContractRoute(contractId, routeId, rate, activeFrom, activeTo = null) {
  const existing = await prisma.contractRoute.findFirst({
    where: {
      contractId,
      routeId,
    },
  });

  if (existing) return existing;

  return prisma.contractRoute.create({
    data: {
      contractId,
      routeId,
      rate,
      currency: 'KES',
      activeFrom: isoDate(activeFrom),
      activeTo: activeTo ? isoDate(activeTo) : null,
    },
  });
}

async function ensureFuelPolicy(contractId, name, cycleStartDate) {
  const policy = await prisma.fuelCoveragePolicy.findFirst({ where: { contractId, name } });
  if (policy) return policy;

  return prisma.fuelCoveragePolicy.create({
    data: {
      contractId,
      name,
      cycleMonths: 4,
      operatorCoverageMonths: 3,
      clientCoverageMonths: 1,
      cycleStartDate: isoDate(cycleStartDate),
      status: RecordStatus.ACTIVE,
    },
  });
}

async function ensureFuelPeriods(policyId) {
  const existingPeriods = await prisma.fuelCoveragePeriod.findMany({
    where: { policyId },
    orderBy: { periodNumber: 'asc' },
  });

  if (existingPeriods.length > 0) return existingPeriods;

  const policy = await prisma.fuelCoveragePolicy.findUnique({ where: { id: policyId } });
  if (!policy) throw new Error('Fuel policy not found while generating periods');

  const periodEntries = [
    { periodNumber: 1, periodStart: '2026-01-01', periodEnd: '2026-01-31', responsibleParty: FinancialPartyType.OPERATOR },
    { periodNumber: 2, periodStart: '2026-02-01', periodEnd: '2026-02-28', responsibleParty: FinancialPartyType.OPERATOR },
    { periodNumber: 3, periodStart: '2026-03-01', periodEnd: '2026-03-31', responsibleParty: FinancialPartyType.OPERATOR },
    { periodNumber: 4, periodStart: '2026-04-01', periodEnd: '2026-04-30', responsibleParty: FinancialPartyType.CLIENT },
  ];

  for (const period of periodEntries) {
    await prisma.fuelCoveragePeriod.create({
      data: {
        policyId,
        periodNumber: period.periodNumber,
        periodStart: isoDate(period.periodStart),
        periodEnd: isoDate(period.periodEnd),
        responsibleParty: period.responsibleParty,
        status: RecordStatus.ACTIVE,
      },
    });
  }

  return prisma.fuelCoveragePeriod.findMany({ where: { policyId }, orderBy: { periodNumber: 'asc' } });
}

async function ensureTrip(contractRouteId, lorryId, driverId, occurredAt) {
  const existing = await prisma.trip.findFirst({
    where: {
      contractRouteId,
      lorryId,
      occurredAt: isoDate(occurredAt),
    },
  });

  if (existing) return existing;

  return prisma.trip.create({
    data: {
      contractRouteId,
      lorryId,
      driverId,
      occurredAt: isoDate(occurredAt),
      cargoDescription: 'Lime mineral',
      cargoQuantity: '10',
      cargoUnit: 'tonnes',
      agreedRate: '25000',
      currency: 'KES',
      status: TripStatus.PLANNED,
      notes: 'Seeded operational trip for Nevila route coverage.',
    },
  });
}

async function main() {
  const client = await ensureClient('Nevila');

  const industrialArea = await ensureRoute('Kumpar', 'Industrial Area');
  const thika = await ensureRoute('Kumpar', 'Thika');
  const ngong = await ensureRoute('Kumpar', 'Ngong');

  const lorry = await ensureAsset('KBL 200A', 'Big Canter - operational');
  const driver = await ensureDriver('John Kamau', '+254700000001');

  const contract = await ensureContract(client.id, 'NVL-2026-001', '2026-01-01', '2026-12-31', 'Lime mineral');

  await ensureContractRoute(contract.id, industrialArea.id, '19000', '2026-01-01', '2026-12-31');
  await ensureContractRoute(contract.id, thika.id, '25000', '2026-01-01', '2026-12-31');
  await ensureContractRoute(contract.id, ngong.id, '25000', '2026-01-01', '2026-12-31');

  const policy = await ensureFuelPolicy(contract.id, 'Nevila fuel cycle', '2026-01-01');
  await ensureFuelPeriods(policy.id);

  const contractRoutes = await prisma.contractRoute.findMany({
    where: { contractId: contract.id },
    include: { route: true },
    orderBy: { createdAt: 'asc' },
  });

  const thikaRoute = contractRoutes.find((route) => route.route.destination === 'Thika');
  if (thikaRoute) {
    await ensureTrip(thikaRoute.id, lorry.id, driver.id, '2026-09-15');
  }

  console.log('Seeded LorryLogix demo data for Nevila and Kumpar routes.');
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
