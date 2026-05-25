// ============================================================
// Sportemu — Shared Types & Zod Schemas
// ============================================================

import { z } from 'zod'

// --- Enums ---

export type UserRole = 'admin' | 'trainer'
export type PaymentType = 'prepaid' | 'postpaid'
export type SessionStatus = 'proposed' | 'approved' | 'rejected' | 'completed' | 'cancelled' | 'missed'
export type BookingSource = 'customer_propose' | 'trainer_slot'
export type EnrollmentStatus = 'active' | 'completed' | 'cancelled' | 'suspended'
export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'
export type PaymentStatus = 'pending' | 'verified' | 'rejected'
export type CheckInType = 'check_in' | 'check_out'
export type NotificationType =
  | 'booking_proposed'
  | 'booking_approved'
  | 'booking_rejected'
  | 'checkin_reminder'
  | 'payment_verified'
  | 'payment_rejected'
  | 'invoice_created'

// --- Interfaces ---

export interface Profile {
  id: string
  role: UserRole
  full_name: string
  phone?: string
  avatar_url?: string
  fcm_token?: string
  created_at: string
  updated_at: string
}

export interface Trainer {
  id: string
  specialty?: string
  bio?: string
  payment_type: PaymentType
  is_active: boolean
  created_at: string
  profiles?: Profile
}

export interface TrainerAvailability {
  id: string
  trainer_id: string
  day_of_week: number
  start_time: string
  end_time: string
  is_active: boolean
}

export interface Package {
  id: string
  name: string
  session_count: number
  duration_days: number
  price: number
  description?: string
  is_active: boolean
  created_at: string
}

export interface Customer {
  id: string
  full_name: string
  phone?: string
  email?: string
  address?: string
  notes?: string
  created_by?: string
  created_at: string
  updated_at: string
}

export interface Enrollment {
  id: string
  customer_id: string
  trainer_id: string
  package_id: string
  payment_type: PaymentType
  status: EnrollmentStatus
  start_date: string
  end_date?: string
  sessions_total: number
  sessions_done: number
  notes?: string
  created_by?: string
  created_at: string
  updated_at: string
  // Relations
  customers?: Customer
  trainers?: Trainer
  packages?: Package
}

export interface Session {
  id: string
  enrollment_id: string
  trainer_id: string
  scheduled_date: string
  start_time: string
  end_time: string
  status: SessionStatus
  booking_source: BookingSource
  notes?: string
  rejection_reason?: string
  created_at: string
  updated_at: string
  // Relations
  enrollments?: Enrollment
  check_ins?: CheckIn[]
}

export interface CheckIn {
  id: string
  session_id: string
  trainer_id: string
  type: CheckInType
  photo_url: string
  latitude?: number
  longitude?: number
  server_ts: string
}

export interface Invoice {
  id: string
  enrollment_id: string
  invoice_number: string
  amount: number
  status: InvoiceStatus
  due_date?: string
  notes?: string
  created_at: string
  updated_at: string
  // Relations
  enrollments?: Enrollment
  payments?: Payment[]
}

export interface Payment {
  id: string
  invoice_id: string
  amount: number
  status: PaymentStatus
  proof_url?: string
  proof_uploaded_at?: string
  verified_by?: string
  verified_at?: string
  rejection_reason?: string
  notes?: string
  created_at: string
}

export interface Notification {
  id: string
  user_id: string
  type: NotificationType
  title: string
  body?: string
  data?: Record<string, unknown>
  is_read: boolean
  created_at: string
}

// --- Zod Schemas (for form validation) ---

export const loginSchema = z.object({
  email: z.string().email('Email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
})

export const customerSchema = z.object({
  full_name: z.string().min(1, 'Nama wajib diisi'),
  phone: z.string().optional(),
  email: z.string().email('Email tidak valid').optional().or(z.literal('')),
  address: z.string().optional(),
  notes: z.string().optional(),
})

export const packageSchema = z.object({
  name: z.string().min(1, 'Nama paket wajib diisi'),
  session_count: z.number().min(1, 'Minimal 1 sesi'),
  duration_days: z.number().min(1, 'Minimal 1 hari'),
  price: z.number().min(0, 'Harga tidak boleh negatif'),
  description: z.string().optional(),
})

export const trainerSchema = z.object({
  full_name: z.string().min(1, 'Nama wajib diisi'),
  email: z.string().email('Email tidak valid'),
  phone: z.string().optional(),
  specialty: z.string().optional(),
  bio: z.string().optional(),
  payment_type: z.enum(['prepaid', 'postpaid']),
})

export const sessionProposalSchema = z.object({
  scheduled_date: z.string().min(1, 'Tanggal wajib diisi'),
  start_time: z.string().min(1, 'Jam mulai wajib diisi'),
  end_time: z.string().min(1, 'Jam selesai wajib diisi'),
  notes: z.string().optional(),
})

export const enrollmentSchema = z.object({
  customer_id: z.string().uuid('Customer wajib dipilih'),
  trainer_id: z.string().uuid('Trainer wajib dipilih'),
  package_id: z.string().uuid('Paket wajib dipilih'),
  payment_type: z.enum(['prepaid', 'postpaid']),
  start_date: z.string().min(1, 'Tanggal mulai wajib diisi'),
  notes: z.string().optional(),
})

export const availabilitySchema = z.object({
  day_of_week: z.number().min(0).max(6),
  start_time: z.string().min(1, 'Jam mulai wajib diisi'),
  end_time: z.string().min(1, 'Jam selesai wajib diisi'),
})

// --- Type Inferences from Zod ---

export type LoginInput = z.infer<typeof loginSchema>
export type CustomerInput = z.infer<typeof customerSchema>
export type PackageInput = z.infer<typeof packageSchema>
export type TrainerInput = z.infer<typeof trainerSchema>
export type SessionProposalInput = z.infer<typeof sessionProposalSchema>
export type EnrollmentInput = z.infer<typeof enrollmentSchema>
export type AvailabilityInput = z.infer<typeof availabilitySchema>
