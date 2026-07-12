import { supabase } from "../../utils/supabase.js";

/**
 * Get user profile from Supabase Auth + drivers table if applicable
 */
export const getUserProfile = async (userId) => {
  const { data: { user }, error } = await supabase.auth.admin.getUserById(userId);
  
  if (error) {
    // Fallback: return basic info from the token if admin API not available
    return null;
  }

  const metadata = user?.user_metadata || {};
  return {
    id: user.id,
    email: user.email,
    full_name: metadata.full_name || "",
    role: metadata.role || "",
    created_at: user.created_at,
  };
};

/**
 * Update user metadata via Supabase Auth admin API
 */
export const updateUserProfile = async (userId, updates) => {
  const { full_name } = updates;
  const { data: { user }, error } = await supabase.auth.admin.updateUserById(userId, {
    user_metadata: { full_name },
  });

  if (error) throw error;

  const metadata = user?.user_metadata || {};
  return {
    id: user.id,
    email: user.email,
    full_name: metadata.full_name || "",
    role: metadata.role || "",
  };
};
