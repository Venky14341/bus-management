import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: process.env.PORT ? parseInt(process.env.PORT, 10) : 5000,
  jwtSecret: process.env.JWT_SECRET || 'algions_bus_booking_secret_key_2026_super_secure',
  jwtExpiresIn: '7d',
  nodeEnv: process.env.NODE_ENV || 'development'
};
