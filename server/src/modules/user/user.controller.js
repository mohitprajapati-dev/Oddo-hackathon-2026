import * as userService from "./user.service.js";

export const getProfile = async (req, res, next) => {
  try {
    // First try the admin API, fall back to the token-based user info
    const profile = await userService.getUserProfile(req.user.id);

    const userData = profile || {
      id: req.user.id,
      email: req.user.email,
      full_name: req.user.full_name || "",
      role: req.user.role || "",
    };

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
    const { full_name } = req.body;

    if (!full_name) {
      return res.status(400).json({
        success: false,
        message: "full_name is required.",
      });
    }

    const updated = await userService.updateUserProfile(req.user.id, { full_name });

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully.",
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};
