import "dotenv/config";
import { supabase } from "./utils/supabase.js";

async function checkColumn(table, column) {
  const { error } = await supabase.from(table).select(column).limit(1);
  if (error && error.code === "42703") {
    return false;
  }
  return true;
}

async function main() {
  console.log("Checking columns on database tables...");
  
  const checks = {
    vehicles: [
      "id", "registration_number", "vehicle_name", "vehicle_type", 
      "max_load_capacity", "odometer", "acquisition_cost", "status", "region", "owner_id"
    ],
    drivers: [
      "id", "user_id", "name", "email", "license_number", "license_category", 
      "license_expiry", "contact_number", "status", "safety_score", "owner_id"
    ],
    trips: [
      "id", "vehicle_id", "driver_id", "source", "destination", 
      "planned_distance", "status", "cargo_weight_kg", "route_details", 
      "dispatched_at", "completed_at", "cancelled_at"
    ],
    maintenance_logs: [
      "id", "vehicle_id", "description", "start_date", "end_date", "cost", "status"
    ],
    fuel_logs: [
      "id", "vehicle_id", "amount_liters", "cost", "logged_at"
    ],
    expenses: [
      "id", "vehicle_id", "amount", "category", "description", "logged_at"
    ]
  };

  for (const [table, cols] of Object.entries(checks)) {
    console.log(`\nTable: ${table}`);
    for (const col of cols) {
      const exists = await checkColumn(table, col);
      console.log(`  - ${col}: ${exists ? "EXISTS" : "MISSING ❌"}`);
    }
  }
}

main().catch(console.error);
