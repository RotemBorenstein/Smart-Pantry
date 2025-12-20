import { createClient } from '@supabase/supabase-js'

// Hardcoded values from backend config.py (lines 12-13)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ceyynxrnsuggncjmpwhv.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNleXlueHJuc3VnZ25jam1wd2h2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU5NjExNzgsImV4cCI6MjA4MTUzNzE3OH0.ZyftH-9apfSUhGD0Ou_dQaUmhzhTJGsq1iL9BHQcY4k'

// Create client with auth options
export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      flowType: 'pkce'
    }
  }
)

