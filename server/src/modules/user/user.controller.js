import * as userService from "./user.service.js";

export const getProfile = async (req, res, next) => {
  try {
    let userData = await userService.getUserProfile(req.user.id);
    
    if (!userData) {
      // Fallback if admin API fails
      userData = {
        id: req.user.id,
        email: req.user.email,
        full_name: req.user.full_name || "",
        role: req.user.role || "",
      };
    }

    return res.status(200).json({
      success: true,
      data: userData,
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const {
      full_name,
      phone,
      address,
      department,
      office_location,
      reporting_manager,
      employment_type,
    } = req.body;

    if (!full_name) {
      return res.status(400).json({
        success: false,
        message: "full_name is required.",
      });
    }

    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }

    const updated = await userService.updateUserProfile(req.user.id, req.body, token);

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully.",
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};
