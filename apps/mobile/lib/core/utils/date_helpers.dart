import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

/// Format date to Indonesian locale string
String formatDate(DateTime date) {
  return DateFormat('dd MMM yyyy', 'id').format(date);
}

/// Format time (HH:mm)
String formatTime(String time) {
  return time.substring(0, 5); // "08:00:00" → "08:00"
}

/// Check if a date is today
bool isToday(DateTime date) {
  final now = DateTime.now();
  return date.year == now.year && date.month == now.month && date.day == now.day;
}

/// Parse time string to TimeOfDay
TimeOfDay parseTime(String time) {
  final parts = time.split(':');
  return TimeOfDay(hour: int.parse(parts[0]), minute: int.parse(parts[1]));
}
