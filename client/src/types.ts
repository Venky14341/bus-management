export interface User {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'OPERATOR' | 'PASSENGER';
  phone?: string;
  operatorId?: string;
  operatorName?: string;
}

export interface Operator {
  id: string;
  name: string;
  code: string;
  contactEmail: string;
  contactPhone: string;
  address?: string;
  rating: number;
}

export interface RouteStop {
  id: string;
  routeId: string;
  stopName: string;
  stopType: 'BOARDING' | 'DROPPING' | 'BOTH';
  sequenceOrder: number;
  offsetMinutes: number;
}

export interface Route {
  id: string;
  sourceCity: string;
  destinationCity: string;
  distanceKm: number;
  estimatedHours: number;
  stops?: RouteStop[];
  boardingPoints?: RouteStop[];
  droppingPoints?: RouteStop[];
}

export interface Bus {
  id: string;
  operatorId: string;
  busNumber: string;
  model: string;
  busType: 'AC_SLEEPER' | 'AC_SEATER' | 'NON_AC_SEATER' | 'LUXURY_MULTI_AXLE';
  totalSeats: number;
  layoutType: string;
  hasWifi: boolean;
  hasCharging: boolean;
  hasWaterBottle: boolean;
  operator?: Operator;
}

export interface TripSeat {
  id: string;
  tripId: string;
  seatNumber: string;
  deck: 'LOWER' | 'UPPER';
  seatType: 'SEATER' | 'SLEEPER';
  isBooked: boolean;
  currentBookingId?: string | null;
}

export interface Trip {
  id: string;
  travelDate: string;
  departureTime: string;
  arrivalTime: string;
  baseFare: number;
  status: 'SCHEDULED' | 'ON_THE_WAY' | 'COMPLETED' | 'CANCELLED';
  bus: Bus;
  route: Route;
  inventory: {
    totalSeats: number;
    bookedSeats: number;
    availableSeats: number;
    occupancyPercentage: number;
  };
  seatMap?: {
    layoutType: string;
    lowerDeck: TripSeat[];
    upperDeck: TripSeat[];
  };
}

export interface Passenger {
  id?: string;
  seatNumber: string;
  name: string;
  age: number;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
}

export interface Booking {
  id: string;
  pnr: string;
  tripId: string;
  userId: string;
  boardingPoint: string;
  droppingPoint: string;
  totalAmount: number;
  status: 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  paymentStatus: 'PAID' | 'REFUNDED' | 'PARTIALLY_REFUNDED';
  refundAmount: number;
  cancellationFee: number;
  cancelledAt?: string;
  cancellationReason?: string;
  passengers: Passenger[];
  trip: Trip;
  user?: User;
  createdAt: string;
}

export interface RefundPreview {
  bookingId: string;
  pnr: string;
  totalAmount: number;
  hoursUntilDeparture: number;
  appliedRule: string;
  refundPercentage: number;
  cancellationFeePercentage: number;
  refundAmount: number;
  cancellationFee: number;
  departureTime: string;
}

export interface ManifestPassenger {
  seatNumber: string;
  passengerName: string;
  age: number;
  gender: string;
  pnr: string;
  boardingPoint: string;
  droppingPoint: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  bookedAt: string;
}

export interface ManifestReport {
  trip: {
    id: string;
    travelDate: string;
    departureTime: string;
    arrivalTime: string;
    status: string;
    baseFare: number;
    bus: {
      busNumber: string;
      model: string;
      busType: string;
      operator: string;
    };
    route: {
      origin: string;
      destination: string;
      distanceKm: number;
      stops: RouteStop[];
    };
  };
  reconciliation: {
    totalSeats: number;
    bookedSeats: number;
    availableSeats: number;
    confirmedBookingsCount: number;
    manifestPassengerCount: number;
    occupancyPercentage: number;
    isReconciled: boolean;
    totalGrossRevenue: number;
  };
  manifest: ManifestPassenger[];
}

export interface AuditLog {
  id: string;
  actorId?: string;
  actorRole?: string;
  actorEmail?: string;
  action: string;
  entityType: string;
  entityId: string;
  details: string;
  createdAt: string;
  actor?: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

export interface CancellationRule {
  id: string;
  name: string;
  minHoursBeforeDeparture: number;
  maxHoursBeforeDeparture: number | null;
  refundPercentage: number;
  cancellationFeePercentage: number;
  active: boolean;
}
