import { User } from '../../shared/schema'; // Update this path

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: User;  // Make it optional if not all routes will have it
    }
  }
}