import { supabase } from "../../utils/supabase.js";

/**
 * @param {string} email
 * @param {string} password
 * @param {string} fullName
 * @param {string} role - 'Fleet Manager' | 'Driver' | 'Safety Officer' | 'Financial Analyst'
 */
export const signUpUser = async (email, password, fullName, role) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        role: role,
        full_name: fullName,
      },
    },
  });

  if (error) {
    throw error;
  }

  const user = data.user;
  if (!user) {
    throw new Error("Registration failed: No user object returned from Supabase Auth.");
  }

  return {
    user: {
      id: user.id,
      email: user.email,
      user_metadata: user.user_metadata,
    },
  };
};

/**
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{token: string, user: {id: string, email: string, full_name: string, role: string}}>}
 */
export const loginUser = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw error;
  }

  const { session, user } = data;

  const userMetadata = user.user_metadata || {};
  const role = userMetadata.role;
  const fullName = userMetadata.full_name;

  return {
    token: session.access_token,
    user: {
      id: user.id,
      email: user.email,
      full_name: fullName || "",
      role: role || "Driver",
    },
  };
};
