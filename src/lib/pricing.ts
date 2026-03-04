import { TRUCK_TYPES, DISTANCE_BANDS, SERVICE_PRICES } from './constants';
import type { TruckType, PriceBreakdown } from '@/types/form';

export function calculateDistanceCost(distanceKm: number): number {
  let remaining = distanceKm;
  let cost = 0;
  let prevMax = 0;

  for (const band of DISTANCE_BANDS) {
    const kmInBand = Math.min(remaining, band.maxKm - prevMax);
    if (kmInBand <= 0) break;
    cost += kmInBand * band.ratePerKm;
    remaining -= kmInBand;
    prevMax = band.maxKm;
  }
  return Math.round(cost);
}

export function calculateTotalPrice(params: {
  truckType: TruckType;
  distanceKm: number;
  manpowerCount: number;
  packaging: boolean;
  liftCrane: boolean;
}): PriceBreakdown {
  const truck = TRUCK_TYPES.find(t => t.id === params.truckType);
  const baseFee = truck?.baseFee ?? 0;
  const distanceCost = calculateDistanceCost(params.distanceKm);
  const manpowerCost = params.manpowerCount * SERVICE_PRICES.manpowerPerPerson;
  const packagingCost = params.packaging ? SERVICE_PRICES.packaging : 0;
  const liftCraneCost = params.liftCrane ? SERVICE_PRICES.liftCrane : 0;

  return {
    baseFee,
    distanceCost,
    manpowerCost,
    packagingCost,
    liftCraneCost,
    total: baseFee + distanceCost + manpowerCost + packagingCost + liftCraneCost,
  };
}
