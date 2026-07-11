import { createClient } from "@supabase/supabase-js";

// Publishable frontend credentials. Vercel env vars override these defaults.
// Data access remains protected by Supabase Auth and row-level security.
const defaultSupabaseUrl = "https://fhdcxmerkerzzexchcjq.supabase.co";
const defaultSupabasePublishableKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZoZGN4bWVya2VyenpleGNoY2pxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM3MDgzOTAsImV4cCI6MjA5OTI4NDM5MH0.aSZpZMuQ8V9MytP-MIGvX2y6yqI5PqU-kh5glOZJixs";

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string | undefined) || defaultSupabaseUrl;
const supabaseKey = ((import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? import.meta.env.VITE_SUPABASE_ANON_KEY) as string | undefined) || defaultSupabasePublishableKey;

export const supabaseConfigured = Boolean(supabaseUrl && supabaseKey);

export const supabase = supabaseConfigured
  ? createClient(supabaseUrl!, supabaseKey!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    })
  : null;

export const CLOUD_ASSET_BUCKET = "tide-assets";
