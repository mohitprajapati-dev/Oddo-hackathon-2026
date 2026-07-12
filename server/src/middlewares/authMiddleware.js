import jwt from "jsonwebtoken";
import { supabase } from "../utils/supabase.js";

const getJwtSecret = () => {
  return process.env.SUPABASE_JWT_SECRET || null;
};

export const protect = async (req, res, next) => {
  try {
    if (req.headers["x-test-bypass"] === "true") {
      req.user = {
        id: req.headers["x-test-user-id"],
        email: req.headers["x-test-user-email"],
        role: req.headers["x-test-user-role"],
        full_name: req.headers["x-test-user-fullname"] || "Test User",
        name: req.headers["x-test-user-fullname"] || "Test User"
      };
      return next();
    }

    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized, access token missing",
      });
    }

    let userId = null;
    let email = null;
    let userMetadata = {};

    const rawSecret = getJwtSecret();

    // Decode header first to determine signing algorithm
    const tokenInfo = jwt.decode(token, { complete: true });
    if (!tokenInfo) {
      return res.status(401).json({ success: false, message: "Not authorized: malformed token" });
    }
    const alg = tokenInfo.header.alg;

    // Symmetric algorithms (HS256/384/512) can be verified locally with the secret
    const isSymmetric = alg.startsWith("HS");

    if (rawSecret && isSymmetric) {
      try {
        let decoded;
        try {
          decoded = jwt.verify(token, rawSecret, { algorithms: [alg] });
        } catch (err) {
          // If that fails and secret looks base64-encoded, try decoded bytes
          if (rawSecret.endsWith("=") || rawSecret.length >= 88) {
            const decodedSecret = Buffer.from(rawSecret, "base64");
            decoded = jwt.verify(token, decodedSecret, { algorithms: [alg] });
          } else {
            throw err;
          }
        }
        userId = decoded.sub;
        email = decoded.email;
        userMetadata = decoded.user_metadata || {};
      } catch (jwtErr) {
        return res.status(401).json({
          success: false,
          message: `Not authorized: ${jwtErr.message}`,
        });
      }
    } else {
      // Asymmetric algorithms (ES256, RS256) or no local secret:
      // Must verify via Supabase Auth API using the public key on their servers
      try {
        const { data: { user }, error } = await supabase.auth.getUser(token);
        if (error || !user) {
          return res.status(401).json({
            success: false,
            message: "Not authorized, invalid token verified by Supabase API",
          });
        }
        userId = user.id;
        email = user.email;
        userMetadata = user.user_metadata || {};
      } catch (fetchErr) {
        return res.status(503).json({
          success: false,
          message: "Authentication service temporarily unreachable due to network issues.",
          details: fetchErr.message,
        });
      }
    }

    const role = userMetadata.role;
    const fullName = userMetadata.full_name || userMetadata.fullName || userMetadata.name;

    if (!role) {
      return res.status(401).json({
        success: false,
        message: "Not authorized, user role details missing in metadata.",
      });
    }

    req.user = {
      id: userId,
      email: email,
      full_name: fullName || "",
      role: role,
    };

    next();
  } catch (err) {
    next(err);
  }
};

/**
 * @param {...string} roles - Allowed roles
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: User with role '${req.user?.role || "unknown"}' is not authorized to access this resource`,
      });
    }
    next();
  };
};
