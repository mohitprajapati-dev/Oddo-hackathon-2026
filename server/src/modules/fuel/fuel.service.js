import { supabase } from "../../utils/supabase.js";

class FuelService {
  async getFuelLogs(filters = {}) {
    if (Array.isArray(filters.vehicle_ids) && filters.vehicle_ids.length === 0) {
      return [];
    }

    let query = supabase.from("fuel_logs").select("*, vehicles:vehicle_id(*), trips:trip_id(*)");

    if (filters.vehicle_id) {
      query = query.eq("vehicle_id", filters.vehicle_id);
    }
    if (filters.trip_id) {
      query = query.eq("trip_id", filters.trip_id);
    }
    if (Array.isArray(filters.vehicle_ids) && filters.vehicle_ids.length > 0) {
      query = query.in("vehicle_id", filters.vehicle_ids);
    }

    const { data, error } = await query.order("logged_at", { ascending: false });
    if (error) throw error;
    return data;
  }

  async getFuelLogById(id) {
    const { data, error } = await supabase
      .from("fuel_logs")
      .select("*, vehicles:vehicle_id(*), trips:trip_id(*)")
      .eq("id", id)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async addFuelLog(fuelData) {
    const { vehicle_id, trip_id, amount_liters, cost, logged_at, notes } = fuelData;

    // 1. Verify that the vehicle exists
    const { data: vehicle, error: vehicleError } = await supabase
      .from("vehicles")
      .select("id")
      .eq("id", vehicle_id)
      .maybeSingle();

    if (vehicleError) throw vehicleError;
    if (!vehicle) {
      const error = new Error(`Vehicle with ID ${vehicle_id} does not exist.`);
      error.statusCode = 400;
      throw error;
    }

    // 2. Verify trip exists if provided
    if (trip_id) {
      const { data: trip, error: tripError } = await supabase
        .from("trips")
        .select("id")
        .eq("id", trip_id)
        .maybeSingle();

      if (tripError) throw tripError;
      if (!trip) {
        const error = new Error(`Trip with ID ${trip_id} does not exist.`);
        error.statusCode = 400;
        throw error;
      }
    }

    // 3. Insert the fuel log
    const { data: newLog, error: insertError } = await supabase
      .from("fuel_logs")
      .insert([
        {
          vehicle_id,
          trip_id: trip_id || null,
          amount_liters: Number(amount_liters),
          cost: Number(cost),
          logged_at: logged_at || new Date().toISOString(),
          notes: notes || null,
        },
      ])
      .select()
      .single();

    if (insertError) throw insertError;

    // 4. Automatically create a corresponding record in the expenses table
    const { error: expenseError } = await supabase
      .from("expenses")
      .insert([
        {
          vehicle_id,
          trip_id: trip_id || null,
          category: "Fuel",
          amount: Number(cost),
          description: `Auto-logged: Fuel log #${newLog.id} - ${amount_liters} Liters. Notes: ${notes || "None"}`,
          logged_at: logged_at || new Date().toISOString(),
        },
      ]);

    if (expenseError) {
      console.error("Failed to automatically create fuel expense record:", expenseError.message);
    }

    return newLog;
  }

  async updateFuelLog(id, updates) {
    delete updates.id;
    delete updates.vehicle_id;
    delete updates.trip_id;

    // 1. Fetch existing log
    const { data: existing, error: getError } = await supabase
      .from("fuel_logs")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (getError) throw getError;
    if (!existing) {
      const error = new Error(`Fuel log with ID ${id} not found.`);
      error.statusCode = 404;
      throw error;
    }

    // 2. Perform updates
    const { data: updatedLog, error: updateError } = await supabase
      .from("fuel_logs")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (updateError) throw updateError;

    // 3. Update the corresponding auto-logged expense
    if (updates.cost !== undefined || updates.amount_liters !== undefined || updates.notes !== undefined) {
      const newCost = updates.cost !== undefined ? Number(updates.cost) : existing.cost;
      const newLiters = updates.amount_liters !== undefined ? Number(updates.amount_liters) : existing.amount_liters;
      const newNotes = updates.notes !== undefined ? updates.notes : (existing.notes || "None");

      const { error: expenseError } = await supabase
        .from("expenses")
        .update({
          amount: newCost,
          description: `Auto-logged: Fuel log #${id} - ${newLiters} Liters. Notes: ${newNotes}`,
        })
        .eq("category", "Fuel")
        .like("description", `Auto-logged: Fuel log #${id}%`);

      if (expenseError) {
        console.error("Failed to update auto-logged fuel expense:", expenseError.message);
      }
    }

    return updatedLog;
  }

  async deleteFuelLog(id) {
    // 1. Check if it exists
    const { data: existing, error: getError } = await supabase
      .from("fuel_logs")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (getError) throw getError;
    if (!existing) {
      const error = new Error(`Fuel log with ID ${id} not found.`);
      error.statusCode = 404;
      throw error;
    }

    // 2. Delete the fuel log
    const { error: deleteError } = await supabase
      .from("fuel_logs")
      .delete()
      .eq("id", id);

    if (deleteError) throw deleteError;

    // 3. Delete the corresponding auto-logged expense
    const { error: expenseError } = await supabase
      .from("expenses")
      .delete()
      .eq("category", "Fuel")
      .like("description", `Auto-logged: Fuel log #${id}%`);

    if (expenseError) {
      console.error("Failed to delete auto-logged fuel expense:", expenseError.message);
    }

    return true;
  }
}

export default new FuelService();
