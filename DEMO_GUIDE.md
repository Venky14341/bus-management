# 3–5 Minute Walkthrough Demo Guide
## Algions Bus Booking Management System

Use this structured script to record your 3–5 minute submission video or conduct the live interviewer walkthrough.

---

### Phase 1: Introduction & Architecture (30 Seconds)
1. **Introduction**:
   - "Hello! This is the demonstration of the **Bus Booking Management System** built for the **ALGIONS AI LABS** Advanced Web Development assessment."
   - "The application is built using **React 18** with **Tailwind CSS** on the frontend, and **Node.js, Express, TypeScript, and Prisma ORM** with **SQLite** on the backend."
   - "It features a rich intercity bus ecosystem including **VRL Travels, KSRTC Ambari Utsav, Orange Tours, SRS, IntrCity SmartBus, and Zingbus**, with multi-axle luxury fleets across major Indian corridors."
   - "It enforces server-side Role-Based Access Control, ACID transactional seat integrity to prevent double booking, a dynamic cancellation rules engine with refund calculation, and verified operator manifests."

---

### Phase 2: Acceptance Criteria 1 & 3 — Passenger Search, Seat Selection & Booking (60 Seconds)
1. **Trip Search**:
   - Open `http://localhost:5173` (or port 5000 in production).
   - Show the Hero Search Bar with **From: Bengaluru**, **To: Chennai**, and today's date.
   - Show the major hub shortcut chips: Bengaluru ↔ Chennai, Bengaluru ↔ Hyderabad, Bengaluru ↔ Goa, Mumbai ↔ Pune, Delhi ↔ Jaipur, Delhi ↔ Manali.
   - Click **Search** (or click the quick route chip "Bengaluru → Chennai").
   - Highlight the search results:
     - Real-world operators (VRL, KSRTC, IntrCity, SRS).
     - Filter by Departure Window: Morning, Afternoon, Evening, Night.
     - Sort by: Cheapest Fare, Fastest Duration, Earliest Departure, or Highest Rated.
     - Amenities: Wi-Fi, Charging, Water bottle, Live GPS Tracking.
     - Available seats count (e.g. 28 seats free).
2. **Interactive Seat Layout & Booking**:
   - Click **Select Seats** on the VRL Travels AC Sleeper trip.
   - Show the interactive layout: Lower Deck & Upper Deck tabs, driver cabin indicator, and seat statuses (available, booked, selected).
   - Select seats (e.g. `L4` and `L5`). Show the real-time total fare calculation.
   - Fill in passenger details:
     - Passenger 1: "Rahul Sharma", Age 28, Male.
     - Passenger 2: "Sneha Sharma", Age 26, Female.
   - Select Boarding Point ("Majestic Bus Stand") and Dropping Point ("Koyambedu CMBT").
   - Click **Confirm & Book**.
3. **E-Ticket & PNR Inspection (AC 3)**:
   - The verified digital E-Ticket modal appears with a unique PNR (e.g., `ALG-XXXXXX`).
   - Point out that the ticket includes correct passenger names, assigned seats, origin, destination, timings, total fare paid, and simulated boarding barcode.
   - Click **Print** to show the print-friendly stylesheet.

---

### Phase 3: Acceptance Criteria 2 — Seat Integrity & Concurrency Protection (45 Seconds)
1. **Double Booking Prevention**:
   - Open a second incognito browser window or show the test execution.
   - Explain how `prisma.$transaction` uses an atomic optimistic guard `where: { tripId, seatNumber, isBooked: false }`.
   - Show that if another user tries to select and confirm the newly booked seat (`L4`), the server instantly rejects the attempt with **HTTP 409 Conflict**: *"Seat L4 already booked by another passenger. Please select alternative seats."*
   - Mention that this is proven in the automated test suite with `Promise.all` simultaneous booking requests.

---

### Phase 4: Acceptance Criteria 4 — Cancellation Rules & Refund Engine (45 Seconds)
1. **Cancellation & Refund Preview**:
   - Navigate to the **My Bookings** tab.
   - Locate the booking just created.
   - Click **Cancel Booking**.
   - Show the **Refund Policy Calculator Modal**:
     - It calculates the exact hours remaining until departure.
     - Displays the matched cancellation policy rule (e.g., *Flexible (> 24 Hours)*: 90% Refund, 10% Cancellation Fee).
     - Shows the gross fare, 10% fee, and exact net refund amount.
   - Select a reason ("Change of schedule / plan") and click **Confirm & Release Seats**.
   - Show that the booking status changes to `CANCELLED` and refund is recorded as processed.
2. **Instant Seat Recovery**:
   - Return to **Search & Book** and open the seat layout again.
   - Show that seats `L4` and `L5` are immediately restored to **Available (Green/White)** for other passengers!

---

### Phase 5: Acceptance Criteria 5 — Operator Portal, Occupancy & Manifest Reconciliation (60 Seconds)
1. **Quick Role Switcher**:
   - In the top header bar, click **Operator** on the quick demo switcher (instantly authenticates as `operator@royalbus.com` or `operator@vrlbus.com`).
   - Notice the new **Operator Portal** tab appears in navigation (server-side RBAC enforced!).
2. **Operational Dashboard & Trip Dispatch**:
   - Show the KPI summary cards: Scheduled Trips, Confirmed Passengers, Average Occupancy %, and Net Revenue.
   - Point out the **Schedule New Trip** button allowing operators to dispatch new trips directly from the UI.
   - Scroll down to the **Route Schedules & Occupancy Overview** showing occupancy progress bars for each route.
3. **Passenger Manifest & 100% Reconciliation (AC 5)**:
   - Select the Bengaluru → Chennai trip in the manifest selector.
   - Point out the **100% Reconciled Verification Badge**:
     - Total Capacity = Booked Seats + Available Seats.
     - Manifest Passenger Count == Booked Seats == Confirmed Tickets!
   - Show the conductor's passenger manifest table: Seat Number, Passenger Name, Age, Gender, PNR, Boarding & Dropping Points, Emergency Phone.
   - Point out the live **Check In / Boarded** toggle button allowing the conductor to check in passengers as they board the vehicle.
   - Click **CSV** to export the manifest or **Print** to generate a printable conductor sheet.

---

### Phase 6: Admin Suite, Audit Trail & API Docs (30 Seconds)
1. **Admin Suite**:
   - Click **Admin** on the quick demo switcher.
   - Show the **System Audit Trail**: inspect audit log entries for every booking created, booking cancelled, trip updated, and passenger boarded with full JSON payload diffs.
   - Show the **Cancellation Rules Configurator**: where administrators can dynamically tune refund percentages (e.g. 90%, 75%, 50%).
   - Show the **Fleet Vehicle Registry** (20+ buses) and **Route Stops**.
2. **API Documentation**:
   - Click **API Docs** in the navbar to open Swagger UI at `/api-docs`.
   - Show the OpenAPI 3.0 schema covering all endpoints, parameters, and responses.
3. **Conclusion**:
   - Run `npm test` in terminal to show all 13 automated tests passing green.
   - "Thank you for reviewing the Algions Bus Booking Management System!"
