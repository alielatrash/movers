export type TruckType = 'dababa' | 'closed-dababa' | 'jumbo' | 'closed-jumbo';

export const MOVE_ITEM_OPTIONS = [
  'furniture',
  'boxes',
  'appliances',
  'electronics',
  'office',
  'other',
] as const;

export type MoveItemType = (typeof MOVE_ITEM_OPTIONS)[number];

export interface FormData {
  // Step 1 — Trip Details
  pickupAddress: string;
  dropoffAddress: string;
  moveDate: string;
  moveTime: string;
  moveItems: MoveItemType | '';
  moveItemsOther: string;
  distanceKm: number;
  // Step 2 — Truck
  truckType: TruckType | '';
  // Step 3 — Services
  manpower: { enabled: boolean; count: number };
  packaging: boolean;
  liftCrane: boolean;
  // Step 4 — Contact
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  notes: string;
}

export interface PriceBreakdown {
  baseFee: number;
  distanceCost: number;
  manpowerCost: number;
  packagingCost: number;
  liftCraneCost: number;
  total: number;
}
