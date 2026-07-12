import 'dotenv/config';
import pg from 'pg';
const { Client } = pg;

const client = new Client({ connectionString: process.env.DATABASE_URL });

async function fix() {
  await client.connect();
  console.log("Connected to DB.");

  // Check existing constraint if possible, but let's just replace it
  await client.query('ALTER TABLE drivers DROP CONSTRAINT IF EXISTS drivers_status_check');
  await client.query(`ALTER TABLE drivers ADD CONSTRAINT drivers_status_check CHECK (status IN ('Available', 'On Trip', 'Off Duty', 'Suspended', 'Active'))`);
  
  console.log("Constraint updated successfully.");
  await client.end();
}

fix().catch(console.error);
