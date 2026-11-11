import { RouteStop } from '../types';

export function calculateStopTime(departureTime: string, offsetMinutes: number): string {
  try {
    const parts = departureTime.split(':');
    if (parts.length < 2) return departureTime;
    const h = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10);
    if (isNaN(h) || isNaN(m)) return departureTime;

    let totalMinutes = h * 60 + m + offsetMinutes;
    // Normalize in 24-hr day
    totalMinutes = ((totalMinutes % 1440) + 1440) % 1440;
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;

    const ampm = hours >= 12 ? 'PM' : 'AM';
    const h12 = hours % 12 === 0 ? 12 : hours % 12;
    const mPadded = mins.toString().padStart(2, '0');
    return `${h12}:${mPadded} ${ampm}`;
  } catch {
    return departureTime;
  }
}

export function getDefaultBoardingPoints(sourceCity: string): RouteStop[] {
  return [
    {
      id: 'def-bp-1',
      routeId: 'default',
      stopName: `${sourceCity} Central Bus Station / Majestic`,
      stopType: 'BOARDING',
      sequenceOrder: 1,
      offsetMinutes: 0
    },
    {
      id: 'def-bp-2',
      routeId: 'default',
      stopName: `${sourceCity} Metro Interchange & Flyover Junction`,
      stopType: 'BOARDING',
      sequenceOrder: 2,
      offsetMinutes: 25
    },
    {
      id: 'def-bp-3',
      routeId: 'default',
      stopName: `${sourceCity} Electronic City / Toll Plaza`,
      stopType: 'BOARDING',
      sequenceOrder: 3,
      offsetMinutes: 50
    },
    {
      id: 'def-bp-4',
      routeId: 'default',
      stopName: `${sourceCity} Express Highway Bypass`,
      stopType: 'BOARDING',
      sequenceOrder: 4,
      offsetMinutes: 80
    }
  ];
}

export function getDefaultDroppingPoints(destinationCity: string, estimatedHours: number = 6): RouteStop[] {
  const baseOffset = Math.round(estimatedHours * 60);
  return [
    {
      id: 'def-dp-1',
      routeId: 'default',
      stopName: `${destinationCity} Highway Entry Toll Point`,
      stopType: 'DROPPING',
      sequenceOrder: 1,
      offsetMinutes: Math.max(0, baseOffset - 45)
    },
    {
      id: 'def-dp-2',
      routeId: 'default',
      stopName: `${destinationCity} Outer Ring Road Bypass`,
      stopType: 'DROPPING',
      sequenceOrder: 2,
      offsetMinutes: Math.max(0, baseOffset - 20)
    },
    {
      id: 'def-dp-3',
      routeId: 'default',
      stopName: `${destinationCity} Central Bus Terminal (CMBT / ISBT)`,
      stopType: 'DROPPING',
      sequenceOrder: 3,
      offsetMinutes: baseOffset
    },
    {
      id: 'def-dp-4',
      routeId: 'default',
      stopName: `${destinationCity} Central Railway Station / City Center`,
      stopType: 'DROPPING',
      sequenceOrder: 4,
      offsetMinutes: baseOffset + 30
    }
  ];
}
