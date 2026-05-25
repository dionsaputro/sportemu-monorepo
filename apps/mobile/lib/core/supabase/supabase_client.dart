import 'package:supabase_flutter/supabase_flutter.dart';

/// Access the Supabase client instance
SupabaseClient get supabase => Supabase.instance.client;

/// Supabase configuration
/// Use --dart-define or flutter_dotenv for actual values
const supabaseUrl = String.fromEnvironment(
  'SUPABASE_URL',
  defaultValue: 'http://localhost:54321',
);

const supabaseAnonKey = String.fromEnvironment(
  'SUPABASE_ANON_KEY',
  defaultValue: '',
);
