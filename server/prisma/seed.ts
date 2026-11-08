import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Comprehensive Bus Booking Management System database...');

  // Clean existing data in reverse order of dependencies
  await prisma.auditLog.deleteMany();
  await prisma.passenger.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.tripSeat.deleteMany();
  await prisma.trip.deleteMany();
  await prisma.routeStop.deleteMany();
  await prisma.route.deleteMany();
  await prisma.bus.deleteMany();
  await prisma.user.deleteMany();
  await prisma.operator.deleteMany();
  await prisma.cancellationRule.deleteMany();

  // 1. Password hashing
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('Password123!', salt);

  // 2. Cancellation Rules (Tiered policy)
  console.log('Creating cancellation policy rules...');
  await prisma.cancellationRule.createMany({
    data: [
      {
        name: 'Flexible (> 24 Hours)',
        minHoursBeforeDeparture: 24,
        maxHoursBeforeDeparture: null,
        refundPercentage: 90.0,
        cancellationFeePercentage: 10.0,
        active: true
      },
      {
        name: 'Standard (12 to 24 Hours)',
        minHoursBeforeDeparture: 12,
        maxHoursBeforeDeparture: 24,
        refundPercentage: 50.0,
        cancellationFeePercentage: 50.0,
        active: true
      },
      {
        name: 'Late Window (< 12 Hours)',
        minHoursBeforeDeparture: 0,
        maxHoursBeforeDeparture: 12,
        refundPercentage: 0.0,
        cancellationFeePercentage: 100.0,
        active: true
      }
    ]
  });

  // 3. Indian Bus Operators
  console.log('Creating top intercity bus operators...');
  const vrl = await prisma.operator.create({
    data: {
      name: 'VRL Travels (Vijayanand Logistics)',
      code: 'VRL',
      contactEmail: 'customercare@vrlbus.in',
      contactPhone: '+91 836 2237511',
      address: 'Varur, Hubballi, Karnataka 581207',
      rating: 4.9
    }
  });

  const ksrtc = await prisma.operator.create({
    data: {
      name: 'KSRTC Ambari Utsav & Airavat',
      code: 'KSRTC',
      contactEmail: 'awatar@ksrtc.org',
      contactPhone: '+91 80 22221321',
      address: 'K.H. Road, Shanthinagar, Bengaluru 560027',
      rating: 4.9
    }
  });

  const orange = await prisma.operator.create({
    data: {
      name: 'Orange Tours and Travels',
      code: 'ORANGE',
      contactEmail: 'support@orangetravels.com',
      contactPhone: '+91 40 33559999',
      address: 'Ameerpet, Hyderabad, Telangana 500016',
      rating: 4.8
    }
  });

  const srs = await prisma.operator.create({
    data: {
      name: 'SRS Travels',
      code: 'SRS',
      contactEmail: 'bookings@srstravels.net',
      contactPhone: '+91 80 26809999',
      address: 'Sheshadripuram, Bengaluru, Karnataka 560020',
      rating: 4.7
    }
  });

  const intrcity = await prisma.operator.create({
    data: {
      name: 'IntrCity SmartBus Premium',
      code: 'INTRCITY',
      contactEmail: 'help@intrcity.com',
      contactPhone: '+91 80 47188888',
      address: 'Indiranagar 100ft Road, Bengaluru 560038',
      rating: 4.8
    }
  });

  const zing = await prisma.operator.create({
    data: {
      name: 'Zingbus Electric & Green',
      code: 'ZING',
      contactEmail: 'care@zingbus.com',
      contactPhone: '+91 124 4567890',
      address: 'Cyber City, Gurugram, Haryana 122002',
      rating: 4.6
    }
  });

  const royal = await prisma.operator.create({
    data: {
      name: 'Royal Express Luxury Lines',
      code: 'ROYAL',
      contactEmail: 'support@royalexpress.com',
      contactPhone: '+91 98765 43210',
      address: 'MG Road, Bengaluru, Karnataka 560001',
      rating: 4.8
    }
  });

  // 4. Users (Admin, Operators, Passengers)
  console.log('Creating demo users...');
  const adminUser = await prisma.user.create({
    data: {
      name: 'System Administrator',
      email: 'admin@algions.com',
      passwordHash,
      role: 'ADMIN',
      phone: '+91 99000 00001'
    }
  });

  const opRoyal = await prisma.user.create({
    data: {
      name: 'Vikram Sharma (Royal Express Ops)',
      email: 'operator@royalbus.com',
      passwordHash,
      role: 'OPERATOR',
      phone: '+91 99000 00002',
      operatorId: royal.id
    }
  });

  const opVrl = await prisma.user.create({
    data: {
      name: 'Rajesh Patil (VRL Operations)',
      email: 'operator@vrlbus.com',
      passwordHash,
      role: 'OPERATOR',
      phone: '+91 99000 00003',
      operatorId: vrl.id
    }
  });

  const passengerUser1 = await prisma.user.create({
    data: {
      name: 'Rahul Mehta',
      email: 'passenger@example.com',
      passwordHash,
      role: 'PASSENGER',
      phone: '+91 98765 00001'
    }
  });

  const passengerUser2 = await prisma.user.create({
    data: {
      name: 'Ananya Iyer',
      email: 'ananya@example.com',
      passwordHash,
      role: 'PASSENGER',
      phone: '+91 98765 00002'
    }
  });

  const passengerUser3 = await prisma.user.create({
    data: {
      name: 'Karthik Raman',
      email: 'karthik@example.com',
      passwordHash,
      role: 'PASSENGER',
      phone: '+91 98765 00003'
    }
  });

  // 5. Buses (Fleet)
  console.log('Creating fleet vehicles...');
  const busesData = [
    // VRL
    { operatorId: vrl.id, busNumber: 'KA-25-D-9988', model: 'Volvo 9600 Multi-Axle AC Sleeper 15M', busType: 'AC_SLEEPER', totalSeats: 30, layoutType: '2+1_SLEEPER', hasWifi: true, hasCharging: true, hasWaterBottle: true },
    { operatorId: vrl.id, busNumber: 'KA-25-AA-4411', model: 'Scania Metrolink HD Multi-Axle 14.5M', busType: 'AC_SEATER', totalSeats: 40, layoutType: '2+2', hasWifi: true, hasCharging: true, hasWaterBottle: true },
    // KSRTC
    { operatorId: ksrtc.id, busNumber: 'KA-57-F-1008', model: 'Ambari Utsav Dream Class Volvo Sleeper', busType: 'AC_SLEEPER', totalSeats: 30, layoutType: '2+1_SLEEPER', hasWifi: true, hasCharging: true, hasWaterBottle: true },
    { operatorId: ksrtc.id, busNumber: 'KA-57-F-2244', model: 'Airavat Club Class Volvo Multi-Axle', busType: 'AC_SEATER', totalSeats: 40, layoutType: '2+2', hasWifi: true, hasCharging: true, hasWaterBottle: true },
    // Orange
    { operatorId: orange.id, busNumber: 'TS-09-UB-7701', model: 'Volvo B11R I-Shift Multi-Axle Sleeper', busType: 'AC_SLEEPER', totalSeats: 30, layoutType: '2+1_SLEEPER', hasWifi: true, hasCharging: true, hasWaterBottle: true },
    { operatorId: orange.id, busNumber: 'TS-09-UB-8822', model: 'Mercedes-Benz Super Cruiser Semi-Sleeper', busType: 'AC_SEATER', totalSeats: 40, layoutType: '2+2', hasWifi: true, hasCharging: true, hasWaterBottle: true },
    // SRS
    { operatorId: srs.id, busNumber: 'KA-01-MJ-5511', model: 'BharatBenz Premium AC Sleeper 2+1', busType: 'AC_SLEEPER', totalSeats: 30, layoutType: '2+1_SLEEPER', hasWifi: true, hasCharging: true, hasWaterBottle: true },
    { operatorId: srs.id, busNumber: 'KA-01-MJ-6622', model: 'Ashok Leyland Falcon Non-AC Pushback', busType: 'NON_AC_SEATER', totalSeats: 40, layoutType: '2+2', hasWifi: false, hasCharging: true, hasWaterBottle: false },
    // IntrCity
    { operatorId: intrcity.id, busNumber: 'DL-01-SB-3399', model: 'IntrCity SmartBus Volvo 9600 Multi-Axle', busType: 'AC_SLEEPER', totalSeats: 30, layoutType: '2+1_SLEEPER', hasWifi: true, hasCharging: true, hasWaterBottle: true },
    // Zingbus
    { operatorId: zing.id, busNumber: 'HR-26-EE-1122', model: 'Zingbus Green Electric Long Range Sleeper', busType: 'AC_SLEEPER', totalSeats: 30, layoutType: '2+1_SLEEPER', hasWifi: true, hasCharging: true, hasWaterBottle: true },
    // Royal
    { operatorId: royal.id, busNumber: 'KA-04-AK-7788', model: 'Volvo 9600 Luxury Lounge Sleeper', busType: 'AC_SLEEPER', totalSeats: 30, layoutType: '2+1_SLEEPER', hasWifi: true, hasCharging: true, hasWaterBottle: true },
    { operatorId: royal.id, busNumber: 'KA-04-AK-9900', model: 'Scania Diamond Class Executive Seater', busType: 'AC_SEATER', totalSeats: 40, layoutType: '2+2', hasWifi: true, hasCharging: true, hasWaterBottle: false }
  ];

  const createdBuses: Record<string, any> = {};
  for (const b of busesData) {
    const bus = await prisma.bus.create({ data: b });
    createdBuses[b.busNumber] = bus;
  }

  // 6. Routes with realistic Boarding and Dropping Stops
  console.log('Creating popular intercity corridors and intermediate stops...');
  const routesData = [
    {
      sourceCity: 'Bengaluru',
      destinationCity: 'Chennai',
      distanceKm: 350,
      estimatedHours: 6.0,
      stops: [
        { stopName: 'Majestic Bus Stand', stopType: 'BOARDING', sequenceOrder: 1, offsetMinutes: 0 },
        { stopName: 'Silk Board Junction', stopType: 'BOARDING', sequenceOrder: 2, offsetMinutes: 30 },
        { stopName: 'Electronic City Toll', stopType: 'BOARDING', sequenceOrder: 3, offsetMinutes: 50 },
        { stopName: 'Hosur Sipcot', stopType: 'BOARDING', sequenceOrder: 4, offsetMinutes: 80 },
        { stopName: 'Vellore Toll Plaza', stopType: 'BOTH', sequenceOrder: 5, offsetMinutes: 200 },
        { stopName: 'Sriperumbudur Bus Stop', stopType: 'DROPPING', sequenceOrder: 6, offsetMinutes: 300 },
        { stopName: 'Koyambedu CMBT', stopType: 'DROPPING', sequenceOrder: 7, offsetMinutes: 360 }
      ]
    },
    {
      sourceCity: 'Bengaluru',
      destinationCity: 'Hyderabad',
      distanceKm: 570,
      estimatedHours: 8.5,
      stops: [
        { stopName: 'Majestic Bus Stand', stopType: 'BOARDING', sequenceOrder: 1, offsetMinutes: 0 },
        { stopName: 'Hebbal Flyover', stopType: 'BOARDING', sequenceOrder: 2, offsetMinutes: 25 },
        { stopName: 'Devanahalli Toll', stopType: 'BOARDING', sequenceOrder: 3, offsetMinutes: 50 },
        { stopName: 'Anantapur Food Court', stopType: 'BOTH', sequenceOrder: 4, offsetMinutes: 220 },
        { stopName: 'Kurnool Bypass', stopType: 'BOTH', sequenceOrder: 5, offsetMinutes: 340 },
        { stopName: 'Shamshabad Airport Circle', stopType: 'DROPPING', sequenceOrder: 6, offsetMinutes: 470 },
        { stopName: 'Gachibowli Outer Ring Road', stopType: 'DROPPING', sequenceOrder: 7, offsetMinutes: 510 }
      ]
    },
    {
      sourceCity: 'Bengaluru',
      destinationCity: 'Goa',
      distanceKm: 560,
      estimatedHours: 11.0,
      stops: [
        { stopName: 'Madiwala St. Johns', stopType: 'BOARDING', sequenceOrder: 1, offsetMinutes: 0 },
        { stopName: 'Yeshwantpur Govardhan', stopType: 'BOARDING', sequenceOrder: 2, offsetMinutes: 40 },
        { stopName: 'Tumakuru Toll', stopType: 'BOARDING', sequenceOrder: 3, offsetMinutes: 90 },
        { stopName: 'Hubballi Chennamma Circle', stopType: 'BOTH', sequenceOrder: 4, offsetMinutes: 360 },
        { stopName: 'Belagavi Fort Road', stopType: 'BOTH', sequenceOrder: 5, offsetMinutes: 480 },
        { stopName: 'Mapusa Bus Stand', stopType: 'DROPPING', sequenceOrder: 6, offsetMinutes: 620 },
        { stopName: 'Panaji Kadamba Bus Terminal', stopType: 'DROPPING', sequenceOrder: 7, offsetMinutes: 660 }
      ]
    },
    {
      sourceCity: 'Mumbai',
      destinationCity: 'Pune',
      distanceKm: 150,
      estimatedHours: 3.5,
      stops: [
        { stopName: 'Dadar TT Circle (Asiad)', stopType: 'BOARDING', sequenceOrder: 1, offsetMinutes: 0 },
        { stopName: 'Vashi Plaza', stopType: 'BOARDING', sequenceOrder: 2, offsetMinutes: 40 },
        { stopName: 'Panvel Kalamboli', stopType: 'BOARDING', sequenceOrder: 3, offsetMinutes: 70 },
        { stopName: 'Lonavala Express Highway', stopType: 'BOTH', sequenceOrder: 4, offsetMinutes: 130 },
        { stopName: 'Wakad Bridge', stopType: 'DROPPING', sequenceOrder: 5, offsetMinutes: 180 },
        { stopName: 'Swargate Bus Station', stopType: 'DROPPING', sequenceOrder: 6, offsetMinutes: 210 }
      ]
    },
    {
      sourceCity: 'Mumbai',
      destinationCity: 'Goa',
      distanceKm: 580,
      estimatedHours: 12.0,
      stops: [
        { stopName: 'Borivali National Park', stopType: 'BOARDING', sequenceOrder: 1, offsetMinutes: 0 },
        { stopName: 'Andheri Bisleri', stopType: 'BOARDING', sequenceOrder: 2, offsetMinutes: 30 },
        { stopName: 'Sion Circle', stopType: 'BOARDING', sequenceOrder: 3, offsetMinutes: 60 },
        { stopName: 'Vashi Highway', stopType: 'BOARDING', sequenceOrder: 4, offsetMinutes: 90 },
        { stopName: 'Chiplun Midway', stopType: 'BOTH', sequenceOrder: 5, offsetMinutes: 360 },
        { stopName: 'Mapusa Goa', stopType: 'DROPPING', sequenceOrder: 6, offsetMinutes: 680 },
        { stopName: 'Panaji Bus Stand', stopType: 'DROPPING', sequenceOrder: 7, offsetMinutes: 720 }
      ]
    },
    {
      sourceCity: 'Delhi',
      destinationCity: 'Jaipur',
      distanceKm: 280,
      estimatedHours: 5.0,
      stops: [
        { stopName: 'Kashmere Gate ISBT', stopType: 'BOARDING', sequenceOrder: 1, offsetMinutes: 0 },
        { stopName: 'Dhaula Kuan Metro', stopType: 'BOARDING', sequenceOrder: 2, offsetMinutes: 35 },
        { stopName: 'IFFCO Chowk Gurgaon', stopType: 'BOARDING', sequenceOrder: 3, offsetMinutes: 65 },
        { stopName: 'Kotputli Midway', stopType: 'BOTH', sequenceOrder: 4, offsetMinutes: 160 },
        { stopName: 'Sindhi Camp Jaipur', stopType: 'DROPPING', sequenceOrder: 5, offsetMinutes: 300 }
      ]
    },
    {
      sourceCity: 'Delhi',
      destinationCity: 'Manali',
      distanceKm: 540,
      estimatedHours: 12.5,
      stops: [
        { stopName: 'Majnu Ka Tilla Tibetan Colony', stopType: 'BOARDING', sequenceOrder: 1, offsetMinutes: 0 },
        { stopName: 'Kashmere Gate Metro', stopType: 'BOARDING', sequenceOrder: 2, offsetMinutes: 25 },
        { stopName: 'Karnal Haveli', stopType: 'BOTH', sequenceOrder: 3, offsetMinutes: 140 },
        { stopName: 'Chandigarh Tribune Chowk', stopType: 'BOTH', sequenceOrder: 4, offsetMinutes: 260 },
        { stopName: 'Mandi Bus Stand', stopType: 'BOTH', sequenceOrder: 5, offsetMinutes: 520 },
        { stopName: 'Kullu Bypass', stopType: 'DROPPING', sequenceOrder: 6, offsetMinutes: 680 },
        { stopName: 'Manali Private Bus Stand', stopType: 'DROPPING', sequenceOrder: 7, offsetMinutes: 750 }
      ]
    },
    {
      sourceCity: 'Hyderabad',
      destinationCity: 'Vijayawada',
      distanceKm: 275,
      estimatedHours: 4.5,
      stops: [
        { stopName: 'Ameerpet Metro Station', stopType: 'BOARDING', sequenceOrder: 1, offsetMinutes: 0 },
        { stopName: 'Lakdikapul Bus Stop', stopType: 'BOARDING', sequenceOrder: 2, offsetMinutes: 25 },
        { stopName: 'LB Nagar Dilsukhnagar Ring', stopType: 'BOARDING', sequenceOrder: 3, offsetMinutes: 55 },
        { stopName: 'Suryapet Highway Food Court', stopType: 'BOTH', sequenceOrder: 4, offsetMinutes: 160 },
        { stopName: 'Nandigama Toll', stopType: 'DROPPING', sequenceOrder: 5, offsetMinutes: 220 },
        { stopName: 'Benz Circle Vijayawada', stopType: 'DROPPING', sequenceOrder: 6, offsetMinutes: 270 }
      ]
    }
  ];

  const createdRoutes: Record<string, any> = {};
  for (const r of routesData) {
    const route = await prisma.route.create({
      data: {
        sourceCity: r.sourceCity,
        destinationCity: r.destinationCity,
        distanceKm: r.distanceKm,
        estimatedHours: r.estimatedHours,
        stops: {
          create: r.stops
        }
      }
    });
    createdRoutes[`${r.sourceCity}_${r.destinationCity}`] = route;
  }

  // Helper to generate seat map records
  function generateSeats(busType: string) {
    const seats: Array<{ seatNumber: string; deck: string; seatType: string }> = [];
    if (busType === 'AC_SLEEPER') {
      // 30 berths: 15 Lower (L1 to L15), 15 Upper (U1 to U15)
      for (let i = 1; i <= 15; i++) {
        seats.push({ seatNumber: `L${i}`, deck: 'LOWER', seatType: 'SLEEPER' });
      }
      for (let i = 1; i <= 15; i++) {
        seats.push({ seatNumber: `U${i}`, deck: 'UPPER', seatType: 'SLEEPER' });
      }
    } else {
      // 40 Seater: 10 rows of 4 seats (A, B aisle C, D)
      const cols = ['A', 'B', 'C', 'D'];
      for (let row = 1; row <= 10; row++) {
        for (const col of cols) {
          seats.push({ seatNumber: `${row}${col}`, deck: 'LOWER', seatType: 'SEATER' });
        }
      }
    }
    return seats;
  }

  // 7. Trips across multiple dates and schedules (Morning, Afternoon, Evening, Night)
  console.log('Generating multi-operator trips and seat inventories...');
  const today = new Date();
  const formatOffsetDate = (daysAhead: number) => {
    const d = new Date(today);
    d.setDate(d.getDate() + daysAhead);
    return d.toISOString().split('T')[0];
  };

  const dates = [
    formatOffsetDate(0), // Today
    formatOffsetDate(1), // Tomorrow
    formatOffsetDate(2),
    formatOffsetDate(3),
    formatOffsetDate(4),
    formatOffsetDate(5)
  ];

  let primaryDemoTrip: any = null;

  for (const travelDate of dates) {
    // 1. Bengaluru -> Chennai (VRL AC Sleeper - Night)
    const t1 = await prisma.trip.create({
      data: {
        routeId: createdRoutes['Bengaluru_Chennai'].id,
        busId: createdBuses['KA-25-D-9988'].id,
        departureTime: '22:30',
        arrivalTime: '04:30',
        travelDate,
        baseFare: 950.0,
        status: 'SCHEDULED'
      }
    });
    await prisma.tripSeat.createMany({
      data: generateSeats('AC_SLEEPER').map(s => ({ ...s, tripId: t1.id, isBooked: false }))
    });
    if (travelDate === dates[0]) primaryDemoTrip = t1;

    // 2. Bengaluru -> Chennai (KSRTC Ambari Utsav - Late Night)
    const t2 = await prisma.trip.create({
      data: {
        routeId: createdRoutes['Bengaluru_Chennai'].id,
        busId: createdBuses['KA-57-F-1008'].id,
        departureTime: '23:15',
        arrivalTime: '05:15',
        travelDate,
        baseFare: 1100.0,
        status: 'SCHEDULED'
      }
    });
    await prisma.tripSeat.createMany({
      data: generateSeats('AC_SLEEPER').map(s => ({ ...s, tripId: t2.id, isBooked: false }))
    });

    // 3. Bengaluru -> Chennai (IntrCity SmartBus - Morning Express)
    const t3 = await prisma.trip.create({
      data: {
        routeId: createdRoutes['Bengaluru_Chennai'].id,
        busId: createdBuses['DL-01-SB-3399'].id,
        departureTime: '06:30',
        arrivalTime: '12:30',
        travelDate,
        baseFare: 750.0,
        status: 'SCHEDULED'
      }
    });
    await prisma.tripSeat.createMany({
      data: generateSeats('AC_SLEEPER').map(s => ({ ...s, tripId: t3.id, isBooked: false }))
    });

    // 4. Bengaluru -> Chennai (SRS Non-AC Seater - Afternoon)
    const t4 = await prisma.trip.create({
      data: {
        routeId: createdRoutes['Bengaluru_Chennai'].id,
        busId: createdBuses['KA-01-MJ-6622'].id,
        departureTime: '14:00',
        arrivalTime: '20:00',
        travelDate,
        baseFare: 450.0,
        status: 'SCHEDULED'
      }
    });
    await prisma.tripSeat.createMany({
      data: generateSeats('NON_AC_SEATER').map(s => ({ ...s, tripId: t4.id, isBooked: false }))
    });

    // 5. Bengaluru -> Hyderabad (Orange Tours Volvo B11R Sleeper - Night)
    const t5 = await prisma.trip.create({
      data: {
        routeId: createdRoutes['Bengaluru_Hyderabad'].id,
        busId: createdBuses['TS-09-UB-7701'].id,
        departureTime: '21:00',
        arrivalTime: '05:30',
        travelDate,
        baseFare: 1250.0,
        status: 'SCHEDULED'
      }
    });
    await prisma.tripSeat.createMany({
      data: generateSeats('AC_SLEEPER').map(s => ({ ...s, tripId: t5.id, isBooked: false }))
    });

    // 6. Bengaluru -> Hyderabad (KSRTC Airavat Club Class - Morning)
    const t6 = await prisma.trip.create({
      data: {
        routeId: createdRoutes['Bengaluru_Hyderabad'].id,
        busId: createdBuses['KA-57-F-2244'].id,
        departureTime: '07:30',
        arrivalTime: '16:00',
        travelDate,
        baseFare: 890.0,
        status: 'SCHEDULED'
      }
    });
    await prisma.tripSeat.createMany({
      data: generateSeats('AC_SEATER').map(s => ({ ...s, tripId: t6.id, isBooked: false }))
    });

    // 7. Bengaluru -> Goa (VRL Multi-Axle AC Sleeper)
    const t7 = await prisma.trip.create({
      data: {
        routeId: createdRoutes['Bengaluru_Goa'].id,
        busId: createdBuses['KA-25-D-9988'].id,
        departureTime: '19:30',
        arrivalTime: '06:30',
        travelDate,
        baseFare: 1450.0,
        status: 'SCHEDULED'
      }
    });
    await prisma.tripSeat.createMany({
      data: generateSeats('AC_SLEEPER').map(s => ({ ...s, tripId: t7.id, isBooked: false }))
    });

    // 8. Mumbai -> Pune (Royal Express Morning Commuter)
    const t8 = await prisma.trip.create({
      data: {
        routeId: createdRoutes['Mumbai_Pune'].id,
        busId: createdBuses['KA-04-AK-9900'].id,
        departureTime: '07:00',
        arrivalTime: '10:30',
        travelDate,
        baseFare: 380.0,
        status: 'SCHEDULED'
      }
    });
    await prisma.tripSeat.createMany({
      data: generateSeats('AC_SEATER').map(s => ({ ...s, tripId: t8.id, isBooked: false }))
    });

    // 9. Mumbai -> Goa (Orange Mercedes Super Cruiser)
    const t9 = await prisma.trip.create({
      data: {
        routeId: createdRoutes['Mumbai_Goa'].id,
        busId: createdBuses['TS-09-UB-8822'].id,
        departureTime: '18:00',
        arrivalTime: '06:00',
        travelDate,
        baseFare: 1300.0,
        status: 'SCHEDULED'
      }
    });
    await prisma.tripSeat.createMany({
      data: generateSeats('AC_SEATER').map(s => ({ ...s, tripId: t9.id, isBooked: false }))
    });

    // 10. Delhi -> Jaipur (Zingbus Electric Sleeper)
    const t10 = await prisma.trip.create({
      data: {
        routeId: createdRoutes['Delhi_Jaipur'].id,
        busId: createdBuses['HR-26-EE-1122'].id,
        departureTime: '17:00',
        arrivalTime: '22:00',
        travelDate,
        baseFare: 550.0,
        status: 'SCHEDULED'
      }
    });
    await prisma.tripSeat.createMany({
      data: generateSeats('AC_SLEEPER').map(s => ({ ...s, tripId: t10.id, isBooked: false }))
    });

    // 11. Delhi -> Manali (IntrCity Volvo Sleeper - Night)
    const t11 = await prisma.trip.create({
      data: {
        routeId: createdRoutes['Delhi_Manali'].id,
        busId: createdBuses['DL-01-SB-3399'].id,
        departureTime: '18:30',
        arrivalTime: '07:00',
        travelDate,
        baseFare: 1650.0,
        status: 'SCHEDULED'
      }
    });
    await prisma.tripSeat.createMany({
      data: generateSeats('AC_SLEEPER').map(s => ({ ...s, tripId: t11.id, isBooked: false }))
    });

    // 12. Hyderabad -> Vijayawada (Royal Express Afternoon)
    const t12 = await prisma.trip.create({
      data: {
        routeId: createdRoutes['Hyderabad_Vijayawada'].id,
        busId: createdBuses['KA-04-AK-7788'].id,
        departureTime: '14:30',
        arrivalTime: '19:00',
        travelDate,
        baseFare: 620.0,
        status: 'SCHEDULED'
      }
    });
    await prisma.tripSeat.createMany({
      data: generateSeats('AC_SLEEPER').map(s => ({ ...s, tripId: t12.id, isBooked: false }))
    });
  }

  // 8. Pre-populate Confirmed Bookings for Evaluation Review
  if (primaryDemoTrip) {
    console.log('Seeding demo bookings and verified passenger manifests...');
    // Booking 1: Rahul Mehta + Sneha Mehta
    const b1 = await prisma.booking.create({
      data: {
        pnr: 'ALG-984021',
        tripId: primaryDemoTrip.id,
        userId: passengerUser1.id,
        boardingPoint: 'Majestic Bus Stand',
        droppingPoint: 'Koyambedu CMBT',
        totalAmount: 1900.0,
        status: 'CONFIRMED',
        paymentStatus: 'PAID',
        passengers: {
          create: [
            { seatNumber: 'L1', name: 'Rahul Mehta', age: 28, gender: 'MALE', isBoarded: true, boardedAt: new Date() },
            { seatNumber: 'L2', name: 'Sneha Mehta', age: 26, gender: 'FEMALE', isBoarded: true, boardedAt: new Date() }
          ]
        }
      }
    });

    await prisma.tripSeat.updateMany({
      where: { tripId: primaryDemoTrip.id, seatNumber: { in: ['L1', 'L2'] } },
      data: { isBooked: true, currentBookingId: b1.id }
    });

    await prisma.auditLog.create({
      data: {
        actorId: passengerUser1.id,
        actorRole: 'PASSENGER',
        actorEmail: passengerUser1.email,
        action: 'BOOKING_CREATED',
        entityType: 'Booking',
        entityId: b1.id,
        details: JSON.stringify({ pnr: b1.pnr, seats: ['L1', 'L2'], totalAmount: 1900.0 })
      }
    });

    // Booking 2: Karthik Raman
    const b2 = await prisma.booking.create({
      data: {
        pnr: 'ALG-773019',
        tripId: primaryDemoTrip.id,
        userId: passengerUser3.id,
        boardingPoint: 'Silk Board Junction',
        droppingPoint: 'Sriperumbudur Bus Stop',
        totalAmount: 950.0,
        status: 'CONFIRMED',
        paymentStatus: 'PAID',
        passengers: {
          create: [
            { seatNumber: 'U1', name: 'Karthik Raman', age: 31, gender: 'MALE', isBoarded: false }
          ]
        }
      }
    });

    await prisma.tripSeat.updateMany({
      where: { tripId: primaryDemoTrip.id, seatNumber: 'U1' },
      data: { isBooked: true, currentBookingId: b2.id }
    });

    await prisma.auditLog.create({
      data: {
        actorId: passengerUser3.id,
        actorRole: 'PASSENGER',
        actorEmail: passengerUser3.email,
        action: 'BOOKING_CREATED',
        entityType: 'Booking',
        entityId: b2.id,
        details: JSON.stringify({ pnr: b2.pnr, seats: ['U1'], totalAmount: 950.0 })
      }
    });

    // Booking 3 (Cancelled demo): Ananya Iyer
    const b3 = await prisma.booking.create({
      data: {
        pnr: 'ALG-812044',
        tripId: primaryDemoTrip.id,
        userId: passengerUser2.id,
        boardingPoint: 'Electronic City Toll',
        droppingPoint: 'Koyambedu CMBT',
        totalAmount: 950.0,
        status: 'CANCELLED',
        paymentStatus: 'REFUNDED',
        refundAmount: 855.0, // 90%
        cancellationFee: 95.0, // 10%
        cancelledAt: new Date(),
        cancellationReason: 'Flight schedule changed',
        passengers: {
          create: [
            { seatNumber: 'L3', name: 'Ananya Iyer', age: 25, gender: 'FEMALE' }
          ]
        }
      }
    });

    await prisma.auditLog.create({
      data: {
        actorId: passengerUser2.id,
        actorRole: 'PASSENGER',
        actorEmail: passengerUser2.email,
        action: 'BOOKING_CANCELLED',
        entityType: 'Booking',
        entityId: b3.id,
        details: JSON.stringify({ pnr: b3.pnr, refundAmount: 855.0, fee: 95.0, reason: 'Flight schedule changed' })
      }
    });
  }

  console.log('✅ Database seeding successfully completed!');
  console.log('====================================================');
  console.log('Demo Credentials:');
  console.log('Admin:     admin@algions.com / Password123!');
  console.log('Operator:  operator@royalbus.com / Password123!');
  console.log('Passenger: passenger@example.com / Password123!');
  console.log('====================================================');
}

main()
  .catch((e) => {
    console.error('Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
