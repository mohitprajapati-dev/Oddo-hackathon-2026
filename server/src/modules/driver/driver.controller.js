import * as driverService from "./driver.service.js";

export const updateDriverDetails = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const {
      name,
      license_number,
      license_category,
      license_expiry,
      contact_number,
      safety_score,
      status,
    } = req.body;

    if (!license_number || !license_category || !license_expiry || !contact_number) {
      return res.status(400).json({
        success: false,
        message: "license_number, license_category, license_expiry, and contact_number are required.",
      });
    }

    const finalName = name || req.user.full_name || req.user.name || "";

    const driverData = {
      name: finalName,
      license_number,
      license_category,
      license_expiry,
      contact_number,
      safety_score: safety_score !== undefined ? Number(safety_score) : 100,
      status: status || "Available",
    };

    const updated = await driverService.updateDriverDetails(userId, driverData);

    return res.status(200).json({
      success: true,
      message: "Driver details updated successfully",
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

export const searchDriverByEmail = async (req, res, next) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email query parameter is required.",
      });
    }

    const profile = await driverService.findDriverProfileByEmail(email);
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: `No driver found with email: ${email}`,
      });
    }

    const driverDetails = await driverService.getDriverDetailsById(profile.id);

    return res.status(200).json({
      success: true,
      message: "Driver found successfully",
      data: {
        id: profile.id,
        email: profile.email,
        name: profile.full_name || profile.name || "",
        driver_details: driverDetails,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const addDriver = async (req, res, next) => {
  try {
    const { driverId } = req.body;
    const ownerId = req.user.id;

    if (!driverId) {
      return res.status(400).json({
        success: false,
        message: "driverId is required in request body.",
      });
    }

    // Retrieve profile to obtain the driver's name
    const profile = await driverService.getProfileById(driverId);
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Driver profile not found.",
      });
    }

    const driverName = profile.full_name || profile.name || "";

    const updatedDriver = await driverService.assignOwnerToDriver(driverId, ownerId, driverName);

    return res.status(200).json({
      success: true,
      message: "Driver added/linked to owner successfully",
      data: updatedDriver,
    });
  } catch (error) {
    next(error);
  }
};
