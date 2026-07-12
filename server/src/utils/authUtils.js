import { supabase } from "./supabase.js";

/**
 * Returns the list of vehicle IDs that the current user is authorized to access.
 * - Fleet Manager (or other managers): Vehicles where owner_id = user.id
 * - Driver: Vehicles where owner_id = driver's owner_id
 * 
 * @param {object} user - req.user object containing id and role
 * @returns {Promise<string[]>} List of allowed vehicle UUIDs
 */
export const getAllowedVehicleIds = async (user) => {
  const { id, role } = user;
  let ownerId = id;

  if (role === "Driver") {
    // 1. Retrieve the driver profile to find their Fleet Manager's ID (owner_id)
    const { data: driverProfile, error: dErr } = await supabase
      .from("drivers")
      .select("owner_id")
      .eq("id", id)
      .maybeSingle();

    if (dErr) throw dErr;
    if (driverProfile && driverProfile.owner_id) {
      ownerId = driverProfile.owner_id;
    } else {
      // Driver has not been linked to any Fleet Manager yet
      return [];
    }
  }

  // 2. Query all vehicles owned by this Fleet Manager
  const { data: vehicles, error: vErr } = await supabase
    .from("vehicles")
    .select("id")
    .eq("owner_id", ownerId);

  if (vErr) throw vErr;
  return (vehicles || []).map((v) => v.id);
};
