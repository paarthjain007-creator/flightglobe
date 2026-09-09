/**
 * FlightGlobe Authorization & RBAC Middleware
 * Enforces security permissions for active user sessions and AI execution contexts.
 */

import { getUser } from "./db.js";

export function authenticateUser(req, res, next) {
  const authHeader = req.headers["authorization"] || "";

  if (!authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      error: "Unauthorized",
      message: "Missing or malformed Authorization header. Expected 'Bearer <token>'.",
    });
  }

  const token = authHeader.substring(7).trim();
  if (!token) {
    return res.status(401).json({
      error: "Unauthorized",
      message: "Bearer token cannot be empty.",
    });
  }

  const user = getUser(token);

  if (!user) {
    return res.status(401).json({
      error: "Unauthorized",
      message: "Invalid session or user authorization credentials.",
    });
  }

  // Attach authenticated user to request context
  req.user = user;
  next();
}

/**
 * Role-Based Access Control Middleware
 * @param {Array<string>} allowedRoles Allowed roles e.g. ['passenger', 'admin']
 */
export function authorizeRole(allowedRoles = ["passenger"]) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: "Forbidden",
        message: `Role '${req.user.role}' is not authorized to perform this operation.`,
      });
    }

    next();
  };
}
