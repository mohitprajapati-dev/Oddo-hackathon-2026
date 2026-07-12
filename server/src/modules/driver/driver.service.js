// Driver Service
import { supabase } from "../../utils/supabase.js";
export const createDriver = async (driverId, name, email) => {
  const { data, error } = await supabase
    .from("drivers")
    .insert([
      {
        id: driverId,
        name: name,
        email: email,
      },
    ])
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
};
export const getDriverDetailsById = async (driverId) => {
  const { data, error } = await supabase
    .from("drivers")
    .select("*")
    .eq("id", driverId)
    .maybeSingle();

  if (error) {
    throw error;
  }
  return data;
};

export const updateDriverDetails = async (userId, driverData) => {
  const { data, error } = await supabase
    .from("drivers")
    .upsert({ id: userId, ...driverData })
    .select()
    .single();

  if (error) {
    throw error;
  }
  return data;
};

export const findDriverProfileByEmail = async (email) => {
  const { data, error } = await supabase
    .from("drivers")
    .select("*")
    .eq("email", email)
    .maybeSingle();

  if (error) {
    throw error;
  }
  return data;
};

export const getProfileById = async (userId) => {
  const { data, error } = await supabase
    .from("drivers")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) {
    throw error;
  }
  return data;
};

export const assignOwnerToDriver = async (driverId, ownerId, driverName) => {
  const existing = await getDriverDetailsById(driverId);

  if (existing) {
    const { data, error } = await supabase
      .from("drivers")
      .update({ owner_id: ownerId })
      .eq("id", driverId)
      .select()
      .single();

    if (error) {
      throw error;
    }
    return data;
  } else {
    const { data, error } = await supabase
      .from("drivers")
      .insert([{ id: driverId, name: driverName, owner_id: ownerId }])
      .select()
      .single();

    if (error) {
      throw error;
    }
    return data;
  }
};

export const updateDriver = async (driverId, data) => {
  const { data: updatedDriver, error } = await supabase
    .from("drivers")
    .update(data)
    .eq("id", driverId)
    .select()
    .single();

  if (error) {
    throw error;
  }
  return updatedDriver;
};