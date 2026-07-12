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
  let query = supabase.from("trips").select("*");

  if (filters.driver_id) {
    query = query.eq("driver_id", filters.driver_id);
  }
  if (filters.vehicle_id) {
    query = query.eq("vehicle_id", filters.vehicle_id);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }
  return data;
};
