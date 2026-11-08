import { Request, Response, NextFunction } from 'express';
import { AppError } from './error.middleware';

export function requireRole(allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError('Authentication required', 401));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new AppError(
          `Forbidden. Role '${req.user.role}' does not have sufficient permission for this resource. Required: [${allowedRoles.join(', ')}]`,
          403
        )
      );
    }

    next();
  };
}
