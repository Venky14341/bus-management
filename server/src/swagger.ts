export const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'Algions Bus Booking Management System API',
    version: '1.0.0',
    description: 'Complete REST API documentation for Algions AI Labs Bus Booking Management System Assessment.'
  },
  servers: [
    {
      url: 'http://localhost:5000',
      description: 'Local development server'
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    }
  },
  paths: {
    '/api/auth/register': {
      post: {
        summary: 'Register a new user',
        tags: ['Authentication'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string', example: 'Rahul Sharma' },
                  email: { type: 'string', example: 'rahul@example.com' },
                  password: { type: 'string', example: 'Password123!' },
                  phone: { type: 'string', example: '+91 98765 43210' },
                  role: { type: 'string', enum: ['PASSENGER', 'OPERATOR', 'ADMIN'], example: 'PASSENGER' }
                },
                required: ['name', 'email', 'password']
              }
            }
          }
        },
        responses: {
          201: { description: 'User created successfully' },
          409: { description: 'Email already exists' }
        }
      }
    },
    '/api/auth/login': {
      post: {
        summary: 'User login',
        tags: ['Authentication'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  email: { type: 'string', example: 'admin@algions.com' },
                  password: { type: 'string', example: 'Password123!' }
                },
                required: ['email', 'password']
              }
            }
          }
        },
        responses: {
          200: { description: 'Authenticated successfully with JWT token' },
          401: { description: 'Invalid credentials' }
        }
      }
    },
    '/api/trips/search': {
      get: {
        summary: 'Search trips with filters',
        tags: ['Trips'],
        parameters: [
          { name: 'origin', in: 'query', schema: { type: 'string', example: 'Bengaluru' } },
          { name: 'destination', in: 'query', schema: { type: 'string', example: 'Chennai' } },
          { name: 'travelDate', in: 'query', schema: { type: 'string', example: '2026-11-08' } },
          { name: 'busType', in: 'query', schema: { type: 'string', example: 'AC_SLEEPER' } },
          { name: 'minPrice', in: 'query', schema: { type: 'number' } },
          { name: 'maxPrice', in: 'query', schema: { type: 'number' } }
        ],
        responses: {
          200: { description: 'List of matching trips with live seat availability' }
        }
      }
    },
    '/api/trips/{id}': {
      get: {
        summary: 'Get trip details and full visual seat layout',
        tags: ['Trips'],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Trip details and seat map' },
          404: { description: 'Trip not found' }
        }
      }
    },
    '/api/bookings': {
      post: {
        summary: 'Atomically book seats and generate PNR',
        security: [{ bearerAuth: [] }],
        tags: ['Bookings'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  tripId: { type: 'string' },
                  boardingPoint: { type: 'string', example: 'Majestic Bus Stand' },
                  droppingPoint: { type: 'string', example: 'Koyambedu CMBT' },
                  passengers: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        seatNumber: { type: 'string', example: 'L4' },
                        name: { type: 'string', example: 'Rahul Sharma' },
                        age: { type: 'integer', example: 28 },
                        gender: { type: 'string', enum: ['MALE', 'FEMALE', 'OTHER'] }
                      },
                      required: ['seatNumber', 'name', 'age', 'gender']
                    }
                  }
                },
                required: ['tripId', 'boardingPoint', 'droppingPoint', 'passengers']
              }
            }
          }
        },
        responses: {
          201: { description: 'Booking confirmed with unique PNR' },
          409: { description: 'Seat conflict: seat already booked' }
        }
      }
    },
    '/api/bookings/pnr/{pnr}': {
      get: {
        summary: 'Retrieve booking ticket details by PNR',
        tags: ['Bookings'],
        parameters: [{ name: 'pnr', in: 'path', required: true, schema: { type: 'string', example: 'ALG-984021' } }],
        responses: {
          200: { description: 'Booking details with passengers and route' },
          404: { description: 'PNR not found' }
        }
      }
    },
    '/api/cancellations/preview/{bookingId}': {
      get: {
        summary: 'Preview refund calculation according to departure time rules',
        security: [{ bearerAuth: [] }],
        tags: ['Cancellations'],
        parameters: [{ name: 'bookingId', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Refund breakdown with percentage and net refund' }
        }
      }
    },
    '/api/cancellations/{bookingId}': {
      post: {
        summary: 'Cancel booking and release seats back to inventory',
        security: [{ bearerAuth: [] }],
        tags: ['Cancellations'],
        parameters: [{ name: 'bookingId', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  reason: { type: 'string', example: 'Change of plans' }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Booking cancelled and seats restored to available inventory' }
        }
      }
    },
    '/api/reports/manifest/{tripId}': {
      get: {
        summary: 'Get reconciled passenger manifest for bus conductor/operator',
        security: [{ bearerAuth: [] }],
        tags: ['Operator Reports'],
        parameters: [{ name: 'tripId', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Manifest list with reconciliation check' }
        }
      }
    },
    '/api/reports/dashboard': {
      get: {
        summary: 'Get operator/admin metrics & seat occupancy summary',
        security: [{ bearerAuth: [] }],
        tags: ['Operator Reports'],
        responses: {
          200: { description: 'Dashboard metrics' }
        }
      }
    },
    '/api/reports/audit-logs': {
      get: {
        summary: 'View audit logs for material business actions',
        security: [{ bearerAuth: [] }],
        tags: ['Audit'],
        parameters: [
          { name: 'entityType', in: 'query', schema: { type: 'string' } },
          { name: 'page', in: 'query', schema: { type: 'integer' } }
        ],
        responses: {
          200: { description: 'Paginated audit trail' }
        }
      }
    }
  }
};
