import { supabase } from "../utils/supabase.js";

/**
 * Middleware to authenticate requests using Supabase Auth JWT.
 */
export const protect = async (req, res, next) => {
  try {
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

    // Verify token with Supabase Auth
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) {
      return res.status(401).json({
        success: false,
        message: "Not authorized, invalid token",
      });
    }

    // Fetch the associated user profile role from our public profiles table
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      return res.status(401).json({
        success: false,
        message: "User profile not found in TransitOps profiles.",
      });
    }

    // Attach user profile information to the request
    req.user = {
      id: user.id,
      email: user.email,
      ...profile,
    };

    next();
  } catch (err) {
    next(err);
  }
};

/**
 * Middleware to restrict access based on user roles.
 * @param {...string} roles - Permitted roles
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Role '${req.user?.role || "unknown"}' is not authorized to access this resource`,
      });
    }
    next();
  };
};
