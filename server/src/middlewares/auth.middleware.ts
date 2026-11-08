import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { prisma } from '../db';
import { AppError } from './error.middleware';

export interface AuthUser {
  id: string;
  email: string;
  role: string;
  name: string;
  operatorId?: string | null;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Authentication required. Missing or invalid Bearer token.', 401);
    }

    const token = authHeader.split(' ')[1];
    let payload: any;
    try {
      payload = jwt.verify(token, config.jwtSecret);
    } catch (jwtErr) {
      throw new AppError('Invalid or expired token', 401);
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        operatorId: true
      }
    });

    if (!user) {
      throw new AppError('User not found or account deactivated', 401);
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
}

export function optionalAuth(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, config.jwtSecret) as any;
    prisma.user
      .findUnique({
        where: { id: payload.userId },
        select: { id: true, email: true, name: true, role: true, operatorId: true }
      })
      .then((user) => {
        if (user) req.user = user;
        next();
      })
      .catch(() => next());
  } catch {
    next();
  }
}
