// Joshua GPS — Supabase connection settings.
//
// Fill these two values in from your Supabase project:
//   Supabase Dashboard -> Project Settings -> API
//     - "Project URL"      -> url
//     - "anon public" key  -> anonKey
//
// The anon key is safe to ship in the browser. Your data is protected by the
// Row Level Security rules in supabase-schema.sql, not by hiding this key.
//
// Until you replace the placeholders below, the app keeps working in the old
// offline/local-only mode (login: admin / bigblaze, data stays on the device).

window.SUPABASE_CONFIG = {
  url: "https://arcegpvzuabntrjcbmjk.supabase.co",
  anonKey: "sb_publishable_KEvYvPWk1NMmSrJqbmFumw_wrSeCwun"
};
