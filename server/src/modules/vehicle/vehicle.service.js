import { supabase } from "../../utils/supabase.js";

class VehicleService {
  async getVehicleByRegistrationNumber(registrationNumber) {
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

  async getVehicleByOwner(owner_id){
    const { data, error } = await supabase
    .from("vehicles")
    .select("*")
    .eq("owner_id", owner_id)
    .maybeSingle();

  if (error) {
    throw error;
  }
  return data;
  }

  async createVehicle(vehicleData) {
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
}

export default new VehicleService();
