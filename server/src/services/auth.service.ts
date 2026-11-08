import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../db';
import { config } from '../config';
import { AppError } from '../middlewares/error.middleware';

export interface RegisterDTO {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role?: string;
  operatorId?: string;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export class AuthService {
  static async register(dto: RegisterDTO) {
    const existing = await prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() }
    });

    if (existing) {
      throw new AppError('An account with this email already exists', 409);
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(dto.password, salt);

    const userRole = dto.role && ['ADMIN', 'OPERATOR', 'PASSENGER'].includes(dto.role.toUpperCase())
      ? dto.role.toUpperCase()
      : 'PASSENGER';

    const user = await prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email.toLowerCase(),
        passwordHash,
        role: userRole,
        phone: dto.phone,
        operatorId: dto.operatorId
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        operatorId: true,
        createdAt: true
      }
    });

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      config.jwtSecret,
      { expiresIn: '7d' }
    );

    return { user, token };
  }

  static async login(dto: LoginDTO) {
    const user = await prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
      include: { operator: true }
    });

    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    const isMatch = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isMatch) {
      throw new AppError('Invalid email or password', 401);
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      config.jwtSecret,
      { expiresIn: '7d' }
    );

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        operatorId: user.operatorId,
        operatorName: user.operator?.name,
        createdAt: user.createdAt
      },
      token
    };
  }

  static async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        operatorId: true,
        operator: {
          select: { id: true, name: true, code: true, rating: true }
        },
        createdAt: true
      }
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    return user;
  }
}
