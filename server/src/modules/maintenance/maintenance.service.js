import { supabase } from "../../utils/supabase.js";

class MaintenanceService {
  async getMaintenanceList(filters = {}) {
    let query = supabase.from("maintenance_logs").select("*, vehicles:vehicle_id(*)");

    if (filters.vehicle_id) {
      query = query.eq("vehicle_id", filters.vehicle_id);
    }
    if (filters.status) {
      query = query.eq("status", filters.status);
    }

    const { data, error } = await query.order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  }

  async getMaintenanceById(id) {
    const { data, error } = await supabase
      .from("maintenance_logs")
      .select("*, vehicles:vehicle_id(*)")
      .eq("id", id)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async createMaintenance(maintenanceData) {
    const { vehicle_id, description, start_date, cost } = maintenanceData;

    // 1. Verify that the vehicle exists
    const { data: vehicle, error: vehicleError } = await supabase
      .from("vehicles")
      .select("*")
      .eq("id", vehicle_id)
      .maybeSingle();

    if (vehicleError) throw vehicleError;
    if (!vehicle) {
      const error = new Error(`Vehicle with ID ${vehicle_id} does not exist.`);
      error.statusCode = 400;
      throw error;
    }

    // 2. Prevent duplicate active maintenance records for the same vehicle
    const { data: activeMaintenance, error: activeErr } = await supabase
      .from("maintenance_logs")
      .select("id")
      .eq("vehicle_id", vehicle_id)
      .eq("status", "Active")
      .maybeSingle();

    if (activeErr) throw activeErr;
    if (activeMaintenance) {
      const error = new Error(`Vehicle with ID ${vehicle_id} already has an active maintenance record.`);
      error.statusCode = 400;
      throw error;
    }

    // 3. Insert the active maintenance log
    const { data: newLog, error: insertError } = await supabase
      .from("maintenance_logs")
      .insert([
        {
          vehicle_id,
          description,
          start_date: start_date || new Date().toISOString(),
          cost: cost !== undefined ? Number(cost) : 0,
          status: "Active",
        },
      ])
      .select()
      .single();

    if (insertError) throw insertError;

    // 4. Automatically change the vehicle status to "In Shop"
    const { error: updateVehicleError } = await supabase
      .from("vehicles")
      .update({ status: "In Shop", updated_at: new Date().toISOString() })
      .eq("id", vehicle_id);

    if (updateVehicleError) {
      // Rollback maintenance log if vehicle update fails (consistency)
      await supabase.from("maintenance_logs").delete().eq("id", newLog.id);
      throw updateVehicleError;
    }

    return newLog;
  }

  async updateMaintenance(id, updates) {
    // Prevent updating keys directly
    delete updates.id;
    delete updates.vehicle_id;

    const { data: existing, error: findError } = await this.getMaintenanceById(id);
    if (findError) throw findError;
    if (!existing) {
      const error = new Error(`Maintenance log with ID ${id} not found.`);
      error.statusCode = 404;
      throw error;
    }

    const { data, error } = await supabase
      .from("maintenance_logs")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async completeMaintenance(id, completionData) {
    const { cost, end_date } = completionData;
    const finalEndDate = end_date || new Date().toISOString();
    const finalCost = cost !== undefined ? Number(cost) : 0;

    // 1. Fetch current maintenance log
    const { data: log, error: logError } = await supabase
      .from("maintenance_logs")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (logError) throw logError;
    if (!log) {
      const error = new Error(`Maintenance log with ID ${id} not found.`);
      error.statusCode = 404;
      throw error;
    }

    if (log.status === "Completed") {
      const error = new Error("This maintenance log is already completed.");
      error.statusCode = 400;
      throw error;
    }

    // 2. Complete the maintenance log status
    const { data: completedLog, error: completeError } = await supabase
      .from("maintenance_logs")
      .update({
        status: "Completed",
        cost: finalCost,
        end_date: finalEndDate,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (completeError) throw completeError;

    // 3. Fetch the vehicle status
    const { data: vehicle, error: vehicleError } = await supabase
      .from("vehicles")
      .select("status")
      .eq("id", log.vehicle_id)
      .maybeSingle();

    if (vehicleError) throw vehicleError;

    // 4. Restore status to "Available" unless vehicle is retired
    if (vehicle && vehicle.status !== "Retired") {
      const { error: updateVehicleError } = await supabase
        .from("vehicles")
        .update({ status: "Available", updated_at: new Date().toISOString() })
        .eq("id", log.vehicle_id);

      if (updateVehicleError) throw updateVehicleError;
    }

    // 5. Automatically log a corresponding record in the expenses table
    const { error: expenseError } = await supabase
      .from("expenses")
      .insert([
        {
          vehicle_id: log.vehicle_id,
          category: "Maintenance",
          amount: finalCost,
          description: `Auto-logged: Completed maintenance log #${log.id} - ${log.description}`,
          logged_at: finalEndDate,
        },
      ]);

    if (expenseError) {
      console.error("Failed to automatically create maintenance expense record:", expenseError.message);
    }

    return completedLog;
  }
}

export default new MaintenanceService();
