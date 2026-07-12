-- ----------------------------------------------------
-- TransitOps Smart Transport Operations Platform Schema
-- ----------------------------------------------------

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Note: No profiles table is created. User profile roles & details are stored
-- directly inside auth.users.user_metadata in Supabase.

-- 1. Vehicles Table
CREATE TABLE IF NOT EXISTS public.vehicles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  registration_number TEXT NOT NULL UNIQUE,
  make TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER NOT NULL,
  capacity_kg NUMERIC NOT NULL CHECK (capacity_kg > 0),
  status TEXT NOT NULL DEFAULT 'Available' CHECK (status IN ('Available', 'Active', 'Maintenance', 'Retired')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated read to vehicles" ON public.vehicles FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow fleet managers write to vehicles" ON public.vehicles FOR ALL USING (
  (auth.jwt() -> 'user_metadata' ->> 'role') IN ('Fleet Manager', 'Safety Officer')
);

-- 2. Drivers Table (References auth.users directly)
CREATE TABLE IF NOT EXISTS public.drivers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  license_number TEXT NOT NULL UNIQUE,
  license_expiry_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'Available' CHECK (status IN ('Available', 'Active', 'Suspended')),
  safety_score NUMERIC DEFAULT 100 CHECK (safety_score >= 0 AND safety_score <= 100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated read to drivers" ON public.drivers FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow managers write to drivers" ON public.drivers FOR ALL USING (
  (auth.jwt() -> 'user_metadata' ->> 'role') IN ('Fleet Manager', 'Safety Officer')
);

-- 3. Trips Table
CREATE TABLE IF NOT EXISTS public.trips (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE RESTRICT,
  driver_id UUID REFERENCES public.drivers(id) ON DELETE RESTRICT,
  status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Dispatched', 'Completed', 'Cancelled')),
  cargo_weight_kg NUMERIC NOT NULL CHECK (cargo_weight_kg >= 0),
  route_details JSONB,
  dispatched_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated read to trips" ON public.trips FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow write to trips for managers and drivers" ON public.trips FOR ALL USING (
  (auth.jwt() -> 'user_metadata' ->> 'role') IN ('Fleet Manager', 'Driver')
);

-- 4. Maintenance Logs Table
CREATE TABLE IF NOT EXISTS public.maintenance_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE,
  cost NUMERIC NOT NULL CHECK (cost >= 0),
  status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'In Progress', 'Completed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.maintenance_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated read to maintenance logs" ON public.maintenance_logs FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow write to maintenance logs" ON public.maintenance_logs FOR ALL USING (
  (auth.jwt() -> 'user_metadata' ->> 'role') IN ('Fleet Manager', 'Safety Officer')
);

-- 5. Fuel Logs Table
CREATE TABLE IF NOT EXISTS public.fuel_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE CASCADE,
  amount_liters NUMERIC NOT NULL CHECK (amount_liters > 0),
  cost NUMERIC NOT NULL CHECK (cost >= 0),
  logged_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.fuel_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated read to fuel logs" ON public.fuel_logs FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow write to fuel logs" ON public.fuel_logs FOR ALL USING (
  (auth.jwt() -> 'user_metadata' ->> 'role') IN ('Fleet Manager', 'Driver', 'Financial Analyst')
);

-- 6. Expenses Table
CREATE TABLE IF NOT EXISTS public.expenses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE SET NULL,
  trip_id UUID REFERENCES public.trips(id) ON DELETE SET NULL,
  category TEXT NOT NULL CHECK (category IN ('Fuel', 'Maintenance', 'Toll', 'Salary', 'Other')),
  amount NUMERIC NOT NULL CHECK (amount >= 0),
  description TEXT NOT NULL,
  logged_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated read to expenses" ON public.expenses FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow write to expenses" ON public.expenses FOR ALL USING (
  (auth.jwt() -> 'user_metadata' ->> 'role') IN ('Fleet Manager', 'Financial Analyst')
);
