// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://nnfgvnxyfberngtbukpv.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5uZmd2bnh5ZmJlcm5ndGJ1a3B2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYyMzM5MjEsImV4cCI6MjA2MTgwOTkyMX0.4iXnh8LoraMzfZ7ppPJozWp63PIhrHNoPktPpUoRmsA";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);