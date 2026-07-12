import { supabase } from "../../utils/supabase.js";
import { createClient } from "@supabase/supabase-js";

/**
 * Get user profile from Supabase Auth + drivers table if applicable
 */
export const getUserProfile = async (userId) => {
  const { data, error } = await supabase.auth.admin.getUserById(userId);
  
  if (error || !data?.user) {
    // Fallback: return basic info from the token if admin API not available
    return null;
  }

  const user = data.user;

  const metadata = user?.user_metadata || {};
  return {
    id: user.id,
    email: user.email,
    full_name: metadata.full_name || "",
    role: metadata.role || "",
    phone: metadata.phone || "",
    address: metadata.address || "",
    department: metadata.department || "",
    office_location: metadata.office_location || "",
    reporting_manager: metadata.reporting_manager || "",
    employment_type: metadata.employment_type || "",
    created_at: user.created_at,
  };
};

/**
 * Update user metadata via Supabase Auth admin API or client-authenticated client
 */
export const updateUserProfile = async (userId, updates, token) => {
  const {
    full_name,
    phone,
    address,
    department,
    office_location,
    reporting_manager,
    employment_type,
  } = updates;

  let user;

  if (token) {
    const userSupabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY, {
      auth: { persistSession: false },
      global: {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    });

    const { data, error } = await userSupabase.auth.updateUser({
      data: {
        full_name,
        phone,
        address,
        department,
        office_location,
        reporting_manager,
        employment_type
      }
    });

    if (error) throw error;
    user = data.user;
  } else {
    // Fallback to admin API if token not provided (mostly tests)
    const { data, error } = await supabase.auth.admin.updateUserById(userId, {
      user_metadata: {
        full_name,
        phone,
        address,
        department,
        office_location,
        reporting_manager,
        employment_type
      },
    });

    if (error) throw error;
    user = data.user;
  }

  const metadata = user?.user_metadata || {};
  return {
    id: user.id,
    email: user.email,
    full_name: metadata.full_name || "",
    role: metadata.role || "",
    phone: metadata.phone || "",
    address: metadata.address || "",
    department: metadata.department || "",
    office_location: metadata.office_location || "",
    reporting_manager: metadata.reporting_manager || "",
    employment_type: metadata.employment_type || "",
  };
};
