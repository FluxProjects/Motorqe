import jwt from "jsonwebtoken";
import { config } from "../config";
import { Request, Response, NextFunction } from 'express';
import { User } from "@shared/schema";

  // Extend the Express Request interface with your custom user property
  declare global {
    namespace Express {
      interface Request {
        user?: User;
      }
    }
  }

  // Check if JWT_SECRET is available
if (!config.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in environment variables");
  }

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: "No token provided" });
  }

  // Check if the header is in the correct format "Bearer <token>"
  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return res.status(401).json({ message: "Invalid token format" });
  }

  const token = parts[1];

  try {
    const decoded = jwt.verify(token, config.JWT_SECRET) as User;
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ 
      message: "Invalid token",
      ...(err instanceof jwt.TokenExpiredError && { reason: "Token expired" }),
      ...(err instanceof jwt.JsonWebTokenError && { reason: "Token invalid" })
    });
  }
}