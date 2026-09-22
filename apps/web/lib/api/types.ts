export type RecordStatus = "ACTIVE" | "INACTIVE";
export type ContractStatus = "DRAFT" | "ACTIVE" | "SUSPENDED" | "EXPIRED" | "TERMINATED";
export type AssetStatus = "ACTIVE" | "INACTIVE" | "UNDER_MAINTENANCE";
export type TripStatus = "PLANNED" | "DISPATCHED" | "IN_TRANSIT" | "DELIVERED" | "COMPLETED" | "CANCELLED" | "FAILED";

export interface Client {
  id: string;
  name: string;
  status: RecordStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Route {
  id: string;
  origin: string;
  destination: string;
  createdAt: string;
  updatedAt: string;
}

export interface Asset {
  id: string;
  registration: string;
  description: string;
  status: AssetStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Driver {
  id: string;
  fullName: string;
  phoneNumber?: string | null;
  status: RecordStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ContractRouteSummary {
  id: string;
  contractId: string;
  routeId: string;
  rate: string;
  currency: string;
  activeFrom: string;
  activeTo?: string | null;
  route: Route;
}

export interface Contract {
  id: string;
  clientId: string;
  reference: string;
  cargoDefault?: string | null;
  currency: string;
  startsOn: string;
  endsOn?: string | null;
  status: ContractStatus;
  createdAt: string;
  updatedAt: string;
  client: Client;
  routes: ContractRouteSummary[];
}

export interface DeliveryNote {
  id: string;
  tripId: string;
  noteNumber: string;
  deliveredAt?: string | null;
  senderCompany: string;
  receiverCompany: string;
  senderSignedAt?: string | null;
  receiverSignedAt?: string | null;
  status: "PENDING" | "DELIVERED" | "SIGNED" | "REJECTED";
  documentUrl?: string | null;
  notes?: string | null;
}

export interface Trip {
  id: string;
  contractRouteId: string;
  lorryId: string;
  driverId?: string | null;
  occurredAt: string;
  cargoDescription: string;
  cargoQuantity?: string | null;
  cargoUnit?: string | null;
  agreedRate: string;
  currency: string;
  status: TripStatus;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  lorry: Asset;
  driver?: Driver | null;
  deliveryNote?: DeliveryNote | null;
  contractRoute?: {
    id: string;
    route: Route;
    rate?: string;
    currency?: string;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}
