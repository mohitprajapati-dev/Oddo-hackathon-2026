import { supabase } from "../../utils/supabase.js";

class ExpenseService {
  async getExpenses(filters = {}) {
    if (Array.isArray(filters.vehicle_ids) && filters.vehicle_ids.length === 0) {
      return [];
    }

    let query = supabase.from("expenses").select("*, vehicles:vehicle_id(*), trips:trip_id(*)");

    if (filters.vehicle_id) {
      query = query.eq("vehicle_id", filters.vehicle_id);
    }
    if (filters.trip_id) {
      query = query.eq("trip_id", filters.trip_id);
    }
    if (filters.category) {
      query = query.eq("category", filters.category);
    }
    if (Array.isArray(filters.vehicle_ids) && filters.vehicle_ids.length > 0) {
      query = query.in("vehicle_id", filters.vehicle_ids);
    }

    const { data, error } = await query.order("logged_at", { ascending: false });
    if (error) throw error;
    return data;
  }

  async getExpenseById(id) {
    const { data, error } = await supabase
      .from("expenses")
      .select("*, vehicles:vehicle_id(*), trips:trip_id(*)")
      .eq("id", id)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async addExpense(expenseData) {
    const { vehicle_id, trip_id, category, amount, description, logged_at } = expenseData;

    // Validate category
    const allowedCategories = ["Fuel", "Maintenance", "Repair", "Toll", "Salary", "Miscellaneous", "Other"];
    if (!allowedCategories.includes(category)) {
      const error = new Error(`Invalid category. Allowed: ${allowedCategories.join(", ")}`);
      error.statusCode = 400;
      throw error;
    }

    // Validate vehicle if provided
    if (vehicle_id) {
      const { data: vehicle, error: vErr } = await supabase
        .from("vehicles")
        .select("id")
        .eq("id", vehicle_id)
        .maybeSingle();

      if (vErr) throw vErr;
      if (!vehicle) {
        const error = new Error(`Vehicle with ID ${vehicle_id} does not exist.`);
        error.statusCode = 400;
        throw error;
      }
    }

    // Validate trip if provided
    if (trip_id) {
      const { data: trip, error: tErr } = await supabase
        .from("trips")
        .select("id")
        .eq("id", trip_id)
        .maybeSingle();

      if (tErr) throw tErr;
      if (!trip) {
        const error = new Error(`Trip with ID ${trip_id} does not exist.`);
        error.statusCode = 400;
        throw error;
      }
    }

    const { data, error } = await supabase
      .from("expenses")
      .insert([
        {
          vehicle_id: vehicle_id || null,
          trip_id: trip_id || null,
          category,
          amount: Number(amount),
          description,
          logged_at: logged_at || new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateExpense(id, updates) {
    delete updates.id;
    delete updates.vehicle_id;
    delete updates.trip_id;

    // Verify exists
    const { data: existing, error: getErr } = await supabase
      .from("expenses")
      .select("id")
      .eq("id", id)
      .maybeSingle();

    if (getErr) throw getErr;
    if (!existing) {
      const error = new Error(`Expense record with ID ${id} not found.`);
      error.statusCode = 404;
      throw error;
    }

    const { data, error } = await supabase
      .from("expenses")
      .update({
        ...updates,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteExpense(id) {
    // Verify exists
    const { data: existing, error: getErr } = await supabase
      .from("expenses")
      .select("id")
      .eq("id", id)
      .maybeSingle();

    if (getErr) throw getErr;
    if (!existing) {
      const error = new Error(`Expense record with ID ${id} not found.`);
      error.statusCode = 404;
      throw error;
    }

    const { error } = await supabase
      .from("expenses")
      .delete()
      .eq("id", id);

    if (error) throw error;
    return true;
  }

  async calculateOperationalCost(filters = {}) {
    // 1. Total Fuel Cost
    let fuelQuery = supabase.from("fuel_logs").select("cost");
    if (filters.vehicle_id) {
      fuelQuery = fuelQuery.eq("vehicle_id", filters.vehicle_id);
    }
    const { data: fuelData, error: fuelErr } = await fuelQuery;
    if (fuelErr) throw fuelErr;
    const totalFuelCost = (fuelData || []).reduce((sum, item) => sum + Number(item.cost), 0);

    // 2. Total Maintenance Cost
    let maintenanceQuery = supabase.from("maintenance_logs").select("cost");
    if (filters.vehicle_id) {
      maintenanceQuery = maintenanceQuery.eq("vehicle_id", filters.vehicle_id);
    }
    const { data: maintData, error: maintErr } = await maintenanceQuery;
    if (maintErr) throw maintErr;
    const totalMaintenanceCost = (maintData || []).reduce((sum, item) => sum + Number(item.cost), 0);

    // 3. Other Expenses (excluding auto-logged ones for Fuel/Maintenance to prevent double counting)
    let expenseQuery = supabase.from("expenses").select("amount")
      .not("category", "in", '("Fuel","Maintenance")');
    if (filters.vehicle_id) {
      expenseQuery = expenseQuery.eq("vehicle_id", filters.vehicle_id);
    }
    const { data: expData, error: expErr } = await expenseQuery;
    if (expErr) throw expErr;
    const otherExpensesCost = (expData || []).reduce((sum, item) => sum + Number(item.amount), 0);

    return {
      total_fuel_cost: totalFuelCost,
      total_maintenance_cost: totalMaintenanceCost,
      other_expenses_cost: otherExpensesCost,
      total_operational_cost: totalFuelCost + totalMaintenanceCost + otherExpensesCost,
    };
  }
}

export default new ExpenseService();
