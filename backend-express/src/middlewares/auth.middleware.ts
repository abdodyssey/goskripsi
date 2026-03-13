import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

// Declare global Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        nip_nim: string;
        roles: string[];
      };
    }
  }
}

export const requireAuth = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  try {
    const token =
      req.cookies.auth_token ||
      (req.headers.authorization?.startsWith("Bearer ")
        ? req.headers.authorization.split(" ")[1]
        : null);

    if (!token) {
      res.status(401).json({
        message: "Unauthorized, no auth_token cookie or Bearer token provided",
        success: false,
      });
      return;
    }

    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: string;
      nip_nim: string;
      roles: string[];
    };

    req.user = decoded;
    next();
  } catch (error) {
    res
      .status(401)
      .json({ message: "Unauthorized, invalid token", success: false });
  }
};

export const requireRole = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ message: "Unauthorized", success: false });
      return;
    }

    const hasRole = req.user.roles.some((role) =>
      allowedRoles.includes(role.toLowerCase()),
    );

    if (!hasRole) {
      res.status(403).json({
        message: "Forbidden, insufficient permissions",
        success: false,
      });
      return;
    }

    next();
  };
};
