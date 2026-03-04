import { TruckType } from '@/types/form';

export const TRUCK_TYPES = [
  {
    id: 'dababa' as TruckType,
    labelKey: 'dababa',
    capacity: '3T',
    baseFee: 300,
    emoji: '🚐',
    descriptionKey: 'dababa_desc',
  },
  {
    id: 'closed-dababa' as TruckType,
    labelKey: 'closed-dababa',
    capacity: '3T',
    baseFee: 400,
    emoji: '🚌',
    descriptionKey: 'closed_dababa_desc',
  },
  {
    id: 'jumbo' as TruckType,
    labelKey: 'jumbo',
    capacity: '5T',
    baseFee: 500,
    emoji: '🚛',
    descriptionKey: 'jumbo_desc',
  },
  {
    id: 'closed-jumbo' as TruckType,
    labelKey: 'closed-jumbo',
    capacity: '5T',
    baseFee: 600,
    emoji: '🚚',
    descriptionKey: 'closed_jumbo_desc',
  },
] as const;

export const DISTANCE_BANDS = [
  { maxKm: 10, ratePerKm: 15 },
  { maxKm: 30, ratePerKm: 12 },
  { maxKm: Infinity, ratePerKm: 10 },
] as const;

export const SERVICE_PRICES = {
  manpowerPerPerson: 150,
  packaging: 200,
  liftCrane: 500,
} as const;

export const TOTAL_STEPS = 5; // 4 form steps + confirmation
