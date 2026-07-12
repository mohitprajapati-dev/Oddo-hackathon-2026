import * as authService from "./auth.service.js";
import { createDriver } from "../driver/driver.service.js";
export const signup = async (req, res, next) => {
  try {
    const { email, password, fullName, role } = req.body;

    const allowedRoles = ["Fleet Manager", "Driver", "Safety Officer", "Financial Analyst"];

    if (!email || !password || !fullName || !role) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields. email, password, fullName, and role are required.",
      });
    }

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: `Invalid role specified. Allowed values are: ${allowedRoles.join(", ")}`,
      });
    }

    const result = await authService.signUpUser(email, password, fullName, role);
    if(role==="Driver"){
      await createDriver(result.user.id,fullName,email);
    }   
    return res.status(201).json({
      success: true,
      message: "User signed up successfully.",
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    const result = await authService.loginUser(email, password);
    return res.status(200).json({
      success: true,
      message: "Login successful.",
      data: result,
    });
  } catch (err) {
    next(err);
  }
};


export const getMe = async (req, res, next) => {
  try {
    return res.status(200).json({
      success: true,
      data: req.user,
    });
  } catch (err) {
    next(err);
  }
};

export const refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: "Refresh token is required.",
      });
    }

    const result = await authService.refreshSession(refreshToken);
    return res.status(200).json({
      success: true,
      message: "Session refreshed successfully.",
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

