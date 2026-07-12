import { supabase } from "../../utils/supabase.js";

export const getTripById = async (tripId) => {
  const { data, error } = await supabase
    .from("trips")
    .select("*")
    .eq("id", tripId)
    .maybeSingle();

  if (error) {
    throw error;
  }
  return data;
};

export const createTrip = async (tripData) => {
  const { data, error } = await supabase
    .from("trips")
    .insert([tripData])
    .select()
    .single();

  if (error) {
    throw error;
  }
  return data;
};

export const updateTrip = async (tripId, updateData) => {
  const { data, error } = await supabase
    .from("trips")
    .update(updateData)
    .eq("id", tripId)
    .select()
    .single();

  if (error) {
    throw error;
  }
  return data;
};

export const getTrips = async (filters = {}) => {
  // If caller explicitly passed an empty allowed-list, no trips can match → short-circuit
  if (Array.isArray(filters.vehicle_ids) && filters.vehicle_ids.length === 0 &&
      Array.isArray(filters.driver_ids) && filters.driver_ids.length === 0) {
    return [];
  }

  let query = supabase
    .from("trips")
    .select("*, vehicles:vehicle_id(id, registration_number, vehicle_name, vehicle_type), drivers:driver_id(id, name, email)")
    .order("created_at", { ascending: false });

  // Scope by single driver (Driver role)
  if (filters.driver_id) {
    query = query.eq("driver_id", filters.driver_id);
  }

  // Scope by single vehicle (optional query param)
  if (filters.vehicle_id) {
    query = query.eq("vehicle_id", filters.vehicle_id);
  }

  // Fleet Manager: trips where vehicle belongs to them
  if (Array.isArray(filters.vehicle_ids) && filters.vehicle_ids.length > 0) {
    query = query.in("vehicle_id", filters.vehicle_ids);
  }

  // Fleet Manager: also include trips where driver belongs to them
  // (OR condition — achieved by running a second query and merging)
  if (Array.isArray(filters.driver_ids) && filters.driver_ids.length > 0 &&
      !filters.vehicle_ids) {
    query = query.in("driver_id", filters.driver_ids);
  }

  const { data, error } = await query;

  if (error) throw error;

  // If we have both vehicle_ids AND driver_ids, we need trips matching either list.
  // Run the driver-based query separately and merge (Supabase doesn't support OR on .in across columns in one query).
  if (Array.isArray(filters.vehicle_ids) && filters.vehicle_ids.length > 0 &&
      Array.isArray(filters.driver_ids) && filters.driver_ids.length > 0) {
    const { data: byDriver, error: dErr } = await supabase
      .from("trips")
      .select("*, vehicles:vehicle_id(id, registration_number, vehicle_name, vehicle_type), drivers:driver_id(id, name, email)")
      .in("driver_id", filters.driver_ids)
      .order("created_at", { ascending: false });

    if (dErr) throw dErr;

    // Merge and de-duplicate
    const combined = [...(data || []), ...(byDriver || [])];
    const seen = new Set();
    return combined.filter((t) => {
      if (seen.has(t.id)) return false;
      seen.add(t.id);
      return true;
    });
  }

  return data || [];
};
