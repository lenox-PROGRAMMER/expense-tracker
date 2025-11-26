import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

// ⚠️ In production, store this in an environment variable
const SECRET = process.env.JWT_SECRET || "supersecretkey";

export default function authenticateToken(req: Request, res: Response, next: NextFunction) {
  // Expect header format: Authorization: Bearer <token>
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, SECRET) as JwtPayload;
    // Attach decoded user info to request object
    (req as any).user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ error: "Invalid or expired token" });
  }
}
