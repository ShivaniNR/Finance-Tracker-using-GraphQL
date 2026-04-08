const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment variables');
}

// Admin client — bypasses RLS. Used server-side only.
// For user-scoped queries, we create per-request clients with the user's JWT.
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Creates a Supabase client scoped to a specific user's JWT.
 * This client respects Row-Level Security policies.
 */
function createUserClient(accessToken) {
  return createClient(supabaseUrl, process.env.SUPABASE_ANON_KEY, {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  });
}

module.exports = {
  supabaseAdmin,
  createUserClient,
};
