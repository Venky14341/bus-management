import express from 'express';
import cors from 'cors';
import path from 'path';
import swaggerUi from 'swagger-ui-express';
import { swaggerDocument } from './swagger';
import authRoutes from './routes/auth.routes';
import tripRoutes from './routes/trip.routes';
import bookingRoutes from './routes/booking.routes';
import cancellationRoutes from './routes/cancellation.routes';
import operatorRoutes from './routes/operator.routes';
import reportRoutes from './routes/report.routes';
import { errorHandler } from './middlewares/error.middleware';

export const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Healthcheck
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/cancellations', cancellationRoutes);
app.use('/api/operators', operatorRoutes);
app.use('/api/reports', reportRoutes);

// Serve static frontend build if it exists (in production/preview)
const clientDistPath = path.join(__dirname, '../../client/dist');
app.use(express.static(clientDistPath));

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/api-docs')) {
    return next();
  }
  res.sendFile(path.join(clientDistPath, 'index.html'), (err) => {
    if (err) {
      res.status(404).json({ message: 'API Route Not Found and Client build not found' });
    }
  });
});

// Centralized error handler
app.use(errorHandler);
