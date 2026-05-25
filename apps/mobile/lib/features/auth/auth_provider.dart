import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../../core/supabase/supabase_client.dart';

/// Auth state provider — tracks current user session
final authStateProvider = StreamProvider<AuthState>((ref) {
  return supabase.auth.onAuthStateChange;
});

/// Current user provider
final currentUserProvider = Provider<User?>((ref) {
  return supabase.auth.currentUser;
});

/// Auth service for login/logout actions
class AuthService {
  Future<AuthResponse> login(String email, String password) async {
    return await supabase.auth.signInWithPassword(
      email: email,
      password: password,
    );
  }

  Future<void> logout() async {
    await supabase.auth.signOut();
  }
}

final authServiceProvider = Provider<AuthService>((ref) => AuthService());
