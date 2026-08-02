/* ============================================================
   config.js – Environment Variables & Supabase Client
   ============================================================ */

'use strict';

const Config = (() => {
  const SUPABASE_URL = 'https://malyhkiumfplkkwdvnab.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1hbHloa2l1bWZwbGtrd2R2bmFiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU2NjI5ODQsImV4cCI6MjEwMTIzODk4NH0.Kr95uaGZB1CFwJEzvpx-D-NhqeRWY3twurV-fytaQTw';

  // Initialize Supabase Client if available
  let supabase = null;
  if (window.supabase) {
    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  } else {
    console.error("Supabase script failed to load!");
  }

  return { supabase };
})();
