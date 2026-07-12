import { supabase } from "../../utils/supabase.js";


 export const getVehicleByRegistrationNumber=async(registrationNumber)=>{
    const { data, error } = await supabase
      .from("vehicles")
      .select("*")
      .eq("registration_number", registrationNumber)
      .maybeSingle();

    if (error) {
      throw error;
    }
    return data;
  }

export const getVehicleByOwner = async (owner_id) => {
  const { data, error } = await supabase
    .from("vehicles")
    .select("*")
    .eq("owner_id", owner_id);

  if (error) {
    throw error;
  }
  return data;
};

export const getVehicleById = async (vehicleId) => {
  const { data, error } = await supabase
    .from("vehicles")
    .select("*")
    .eq("id", vehicleId)
    .maybeSingle();

  if (error) {
    throw error;
  }
  return data;
};


 export const createVehicle=async(vehicleData)=>{
    const { data, error } = await supabase
      .from("vehicles")
      .insert([vehicleData])
      .select()
      .single();

    if (error) {
      throw error;
    }
    return data;
  }


export const updateVehicle=async(vehicleId,data)=>{
    const { data:updatedVehicle, error } = await supabase
      .from("vehicles")
      .update(data)
      .eq("id", vehicleId)
      .select()
      .single();

    if (error) {
      throw error;
    }
    return updatedVehicle;
  }


