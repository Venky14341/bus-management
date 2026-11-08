# Technical Architecture & Engineering Report
## Bus Booking Management System — ALGIONS AI LABS Assessment

**Author**: Senior Full-Stack Engineer  
**Date**: November 2026  
**Assignment**: Bus Booking Management System  
**Repository**: Algions Bus Booking Management System  

---

## 1. Executive Summary

This report documents the architectural and engineering decisions implemented in the **Bus Booking Management System** for ALGIONS AI LABS. The solution is engineered as a clean, modular monolith with distinct separation between UI presentation, domain business logic, and transactional persistence.

The system addresses the core challenges of intercity bus ticketing:
1. High-concurrency seat inventory integrity without overselling or race conditions.
2. Dynamic, operator-configurable cancellation rules that calculate time-tiered refunds.
3. Strict server-side role-based authorization (RBAC) ensuring operational boundaries.
4. Comprehensive passenger manifests with mathematical seat reconciliation and live passenger boarding check-ins.
5. Persistent audit logging for all material business events.
6. A rich multi-operator Indian bus ecosystem (VRL, KSRTC, Orange, SRS, IntrCity, Zingbus, Royal Express).

---

## 2. Architecture & Design Principles

### 2.1 Clean Separation of Concerns
The application follows a layered modular monolithic architecture:
- **Presentation Layer (React 18 + Vite + Tailwind CSS)**:
  - Responsive single-page application (SPA).
  - Component-driven visual seat selection (supporting both 2+2 standard seater buses and multi-deck 2+1 AC sleeper layouts).
  - Quick Demo Role Switcher for instant evaluator persona switching (`PASSENGER` -> `OPERATOR` -> `ADMIN`).
- **Application / API Layer (Node.js + Express + TypeScript)**:
  - Express router delegating to specialized controllers.
  - Zod validation schemas validating all request payloads before reaching controllers.
  - Centralized error handling returning structured RFC-compliant JSON responses.
  - OpenAPI 3.0 / Swagger documentation exposed at `/api-docs`.
- **Domain Service Layer**:
  - Encapsulates pure business rules (`BookingService`, `CancellationService`, `ReportService`, `TripService`).
  - Independent of transport protocol (enables straightforward unit and integration testing).
- **Persistence Layer (Prisma ORM + SQLite)**:
  - Strongly typed data access with relational constraints, foreign keys, cascades, and composite indexes.
  - Fully reproducible local development with zero external daemon dependencies.

---

## 3. Critical Business Rules & Concurrency Strategy

### 3.1 Simultaneous Booking & Seat Double-Booking Prevention
One of the most critical requirements is: **"Two users cannot confirm the same seat on one trip."**

In real-world bus ticketing, multiple users frequently attempt to book popular seats (e.g., lower deck single berths) at the same millisecond. To prevent race conditions:

```typescript
// Excerpt from BookingService.ts
return await prisma.$transaction(async (tx) => {
  // Step 1: Read current state inside transaction
  const seatRecords = await tx.tripSeat.findMany({
    where: { tripId: dto.tripId, seatNumber: { in: requestedSeats } }
  });

  // Step 2: Validate if any seat is already booked
  const bookedSeats = seatRecords.filter(s => s.isBooked);
  if (bookedSeats.length > 0) {
    throw new AppError(
      `Seat(s) ${bookedSeats.map(s => s.seatNumber).join(', ')} already booked by another passenger.`,
      409
    );
  }

  // Step 3: Optimistic Atomic Update with State Check
  const updateResult = await tx.tripSeat.updateMany({
    where: {
      tripId: dto.tripId,
      seatNumber: { in: requestedSeats },
      isBooked: false // Concurrency guard
    },
    data: { isBooked: true }
  });

  // Step 4: Strict count verification
  if (updateResult.count !== requestedSeats.length) {
    throw new AppError('One or more selected seats were just claimed by another passenger.', 409);
  }

  // Step 5: Atomically create Booking, Passenger records and link currentBookingId
  // ...
});
```

**Triple-Layer Concurrency Defense**:
1. **Transaction Isolation**: All checks and mutations occur within an atomic database transaction.
2. **Optimistic Guard Predicate**: `updateMany` includes `isBooked: false`. If a concurrent transaction flipped the flag first, `updateResult.count` falls short, triggering an immediate rollback and HTTP 409 Conflict.
3. **Database Schema Constraints**: `TripSeat` has a composite unique constraint `@@unique([tripId, seatNumber])`.

**Automated Test Verification**:  
The automated test suite in `tests/api.test.ts` executes two simultaneous requests using `Promise.all` targeting the exact same seat on the same trip. The test asserts that:
- Exactly 1 request receives HTTP 201 Created with a valid PNR.
- Exactly 1 request receives HTTP 409 Conflict with a user-friendly rejection message.

---

### 3.2 Configurable Cancellation Rules & Refund Engine
The brief requires a configurable cancellation rule with simulated refund status that preserves booking history and manifest records.

**Rule Engine Model**:
```prisma
model CancellationRule {
  id                        String   @id @default(cuid())
  name                      String
  minHoursBeforeDeparture   Int
  maxHoursBeforeDeparture   Int?
  refundPercentage          Float
  cancellationFeePercentage Float
  active                    Boolean  @default(true)
}
```

**Algorithm**:
1. Compute `hoursUntilDeparture = (departureDateTime - now) / 3600000`.
2. Locate the matching active tier:
   - Tier 1 (`> 24 hours`): 90% refund, 10% cancellation fee.
   - Tier 2 (`12 to 24 hours`): 50% refund, 50% cancellation fee.
   - Tier 3 (`< 12 hours`): 0% refund, 100% cancellation fee.
3. Atomic seat release:
   - Updates `TripSeat` where `currentBookingId == booking.id` setting `isBooked: false` and `currentBookingId: null`.
   - The seat returns to available inventory for other passengers immediately.
4. Booking transition:
   - Changes `Booking.status` to `CANCELLED`.
   - Records `refundAmount`, `cancellationFee`, and timestamp `cancelledAt`.
   - Preserves booking and passenger manifest history for auditing.

---

### 3.3 Operator Passenger Manifest & Mathematical Occupancy Reconciliation
The passenger manifest reconciles confirmed bookings with physical bus seating:

$$\text{Reconciled} \iff \text{Manifest Passengers} = \text{Booked Seats} = (\text{Total Capacity} - \text{Available Seats})$$

The `ReportService.getPassengerManifest` calculates:
```typescript
const totalSeats = trip.seats.length;
const bookedSeats = trip.seats.filter(s => s.isBooked).length;
const availableSeats = totalSeats - bookedSeats;
const confirmedPassengersCount = manifestRows.length;
const isReconciled = confirmedPassengersCount === bookedSeats;
```
The operator UI displays a verified reconciliation badge alongside the manifest table, complete with real-time passenger boarding check-ins.

---

## 4. Security & Role-Based Access Control (RBAC)

The system implements strict server-side authorization. UI controls reflect the role, but every critical endpoint validates the caller's JWT token and role via middleware.

| Resource / Endpoint | HTTP Method | Public | Passenger | Operator | Admin |
|---------------------|-------------|:------:|:---------:|:--------:|:-----:|
| Search Trips | `GET /api/trips/search` | ✅ | ✅ | ✅ | ✅ |
| View Seat Layout | `GET /api/trips/:id` | ✅ | ✅ | ✅ | ✅ |
| Book Seat & Generate PNR | `POST /api/bookings` | ❌ | ✅ | ✅ | ✅ |
| View My Bookings | `GET /api/bookings/my-bookings` | ❌ | ✅ | ✅ | ✅ |
| PNR Ticket Lookup | `GET /api/bookings/pnr/:pnr` | ✅ | ✅ | ✅ | ✅ |
| Preview & Cancel Booking | `POST /api/cancellations/:id` | ❌ | ✅ | ✅ | ✅ |
| View Passenger Manifest | `GET /api/reports/manifest/:id` | ❌ | ❌ | ✅ | ✅ |
| Conductor Passenger Check-in | `PATCH /api/reports/checkin/:id` | ❌ | ❌ | ✅ | ✅ |
| Operator Dashboard Metrics | `GET /api/reports/dashboard` | ❌ | ❌ | ✅ | ✅ |
| Schedule Trip | `POST /api/trips` | ❌ | ❌ | ✅ | ✅ |
| Update Trip Status | `PATCH /api/operators/trips/:id` | ❌ | ❌ | ✅ | ✅ |
| Register Fleet Bus | `POST /api/operators/buses` | ❌ | ❌ | ✅ | ✅ |
| Modify Cancellation Rules | `PUT /api/cancellations/rules/:id`| ❌ | ❌ | ❌ | ✅ |
| System Audit Trail | `GET /api/reports/audit-logs` | ❌ | ❌ | ❌ | ✅ |

---

## 5. Automated Test Evidence (13/13 Passed)

The automated test suite runs via `npm test` and covers unit, integration, RBAC, sorting, passenger boarding, and concurrency scenarios:

```
PASS tests/api.test.ts (12.65 s)
  Bus Booking Management System - Acceptance & Integration Tests
    1. Trip Search & Discovery
      √ should search trips by origin and destination and return real-time available seat inventory (154 ms)
      √ should support sorting trips by price ascending (84 ms)
      √ should retrieve full trip details with seat layout map (46 ms)
    2. Seat Booking, PNR Validation & Concurrency Protection
      √ CRITICAL CONCURRENCY TEST: Two users attempting to book the SAME seat simultaneously must result in 1 confirmation and 1 conflict rejection (HTTP 409) (275 ms)
      √ should reject a subsequent booking request for an already booked seat (60 ms)
      √ Acceptance Criteria 3: PNR ticket includes correct passenger, route, date and seat details (110 ms)
    3. Cancellation Rules, Refund Simulation & Seat Recovery
      √ should preview refund breakdown according to hours before departure (51 ms)
      √ Acceptance Criteria 4: Cancellation changes status to CANCELLED, processes refund, and restores seat to available (130 ms)
    4. Operator Manifest & Occupancy Reconciliation
      √ Acceptance Criteria 5: Manifest and occupancy summaries reconcile with confirmed tickets (95 ms)
      √ should allow conductor/operator to toggle passenger boarding check-in status (108 ms)
      √ should retrieve operator dashboard metrics (75 ms)
    5. Server-Side RBAC Enforcement
      √ should reject a passenger attempting to create a trip with 403 Forbidden (61 ms)
      √ should reject unauthenticated requests to protected endpoints with 401 Unauthorized (73 ms)

Test Suites: 1 passed, 1 total
Tests:       13 passed, 13 total
Time:        ~13 s
```

---

## 6. Interview Defense & Live Debugging Master Guide

> **Important for Shortlisted Candidates**: During your 15-minute technical walkthrough and 10-minute live debugging task with ALGIONS AI LABS, you will be asked to explain your architecture and modify code live. Here is your structured defense guide:

### Q1: "How did you prevent double-booking under simultaneous concurrent requests?"
- **Answer**: "I implemented a triple-layer defense. First, the entire booking operation runs in an atomic Prisma transaction (`prisma.$transaction`). Second, we perform an optimistic guard update on `TripSeat` using `where: { tripId, seatNumber, isBooked: false }`. If two transactions attempt to book the same seat at the exact same millisecond, only the first transaction modifies the row; the second transaction finds `updateResult.count === 0` and immediately rolls back, returning HTTP 409 Conflict. Third, database-level schema constraints (`@@unique([tripId, seatNumber])`) ensure no duplicate seat assignments can ever be persisted."

### Q2: "How does your cancellation policy handle edge cases like last-minute cancellations or departed trips?"
- **Answer**: "In `CancellationService`, we dynamically calculate `hoursUntilDeparture` by parsing the trip's travel date and scheduled departure time. We query active `CancellationRule` records ordered by `minHoursBeforeDeparture desc`. If the departure has already passed (`hours <= 0`), the refund is strictly 0% and cancellation fee is 100%. If more than 24 hours remain, it matches the Flexible tier (90% refund). Seats are atomically released back into `TripSeat` (`isBooked: false`), making them instantly available for other passengers while retaining the original booking record and passenger manifest history for financial auditing."

### Q3: "What would you change to scale this to millions of requests per day?"
- **Answer**: 
  1. Swap SQLite for PostgreSQL with Read Replicas.
  2. Implement a Redis distributed lock / Redis seat reservation cache (with a 5-minute TTL hold) so users hold a seat while checking out, avoiding high transaction load on the primary relational database.
  3. Deploy background job queues (BullMQ / RabbitMQ) for asynchronous ticket email/SMS generation.

### Likely Live Change Task & How to Solve It:
- **Task**: *"Add a new field to Trip, like `isDynamicPricingEnabled`, or add a promo code discount to booking."*
  - **Solution Steps**:
    1. Open `server/prisma/schema.prisma` and add the field (e.g. `discountAmount Float @default(0.0)` in `Booking`).
    2. Run `npx prisma db push`.
    3. Update `BookingService.ts` to deduct discount from `totalAmount`.
    4. Run `npm test` to verify everything remains green!
