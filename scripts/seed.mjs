/**
 * Sportemu Seed Script
 * Run: node scripts/seed.mjs
 *
 * Creates test users and populates the database with sample data.
 * Requires: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in apps/web/.env.local
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Read env from apps/web/.env.local
const envPath = resolve(__dirname, '../apps/web/.env.local')
const envContent = readFileSync(envPath, 'utf-8')
const env = Object.fromEntries(
  envContent.split('\n').filter(l => l && !l.startsWith('#')).map(l => l.split('=').map(s => s.trim()))
)

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing SUPABASE_URL or SERVICE_ROLE_KEY in apps/web/.env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

async function createUser(email, password, metadata) {
  // Check if user already exists
  const { data: existing } = await supabase.auth.admin.listUsers()
  const found = existing?.users?.find(u => u.email === email)
  if (found) {
    console.log(`  ⏭️  User ${email} already exists (${found.id})`)
    return found.id
  }

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: metadata,
  })

  if (error) {
    console.error(`  ❌ Failed to create ${email}:`, error.message)
    return null
  }

  console.log(`  ✅ Created ${email} (${data.user.id})`)
  return data.user.id
}

async function seed() {
  console.log('\n🏊 Sportemu Seeder\n')
  console.log('📡 URL:', supabaseUrl)
  console.log('')

  // 1. Create users
  console.log('👤 Creating users...')
  const adminId = await createUser('admin@trainerapp.dev', 'password123', { role: 'admin', full_name: 'Admin Sportemu' })
  const budiId = await createUser('budi@trainerapp.dev', 'password123', { role: 'trainer', full_name: 'Budi Santoso' })
  const sariId = await createUser('sari@trainerapp.dev', 'password123', { role: 'trainer', full_name: 'Sari Dewi' })
  const andiId = await createUser('andi@trainerapp.dev', 'password123', { role: 'trainer', full_name: 'Andi Pratama' })

  if (!adminId || !budiId || !sariId || !andiId) {
    console.error('\n❌ Some users failed to create. Aborting.')
    process.exit(1)
  }

  // 2. Create trainers
  console.log('\n🏋️ Creating trainers...')
  const trainers = [
    { id: budiId, specialty: 'renang', bio: 'Pelatih renang berpengalaman 5 tahun', payment_type: 'prepaid' },
    { id: sariId, specialty: 'yoga', bio: 'Instruktur yoga bersertifikat', payment_type: 'postpaid' },
    { id: andiId, specialty: 'renang', bio: 'Pelatih renang anak & dewasa', payment_type: 'prepaid' },
  ]

  for (const t of trainers) {
    const { error } = await supabase.from('trainers').upsert(t, { onConflict: 'id' })
    if (error) console.error(`  ❌ Trainer ${t.id}:`, error.message)
    else console.log(`  ✅ Trainer ${t.specialty}`)
  }

  // 3. Specialties & trainer_specialties
  console.log('\n🎯 Linking specialties...')
  const { data: specs } = await supabase.from('specialties').select('id, name')
  const renangSpec = specs?.find(s => s.name === 'renang')
  const yogaSpec = specs?.find(s => s.name === 'yoga')

  if (renangSpec && yogaSpec) {
    await supabase.from('trainer_specialties').upsert([
      { trainer_id: budiId, specialty_id: renangSpec.id },
      { trainer_id: andiId, specialty_id: renangSpec.id },
      { trainer_id: sariId, specialty_id: yogaSpec.id },
    ], { onConflict: 'trainer_id,specialty_id' })
    console.log('  ✅ Specialties linked')
  }

  // 4. Cities & trainer locations
  console.log('\n📍 Setting locations...')
  const { data: cities } = await supabase.from('cities').select('id, name')
  const jaksel = cities?.find(c => c.name === 'Jakarta Selatan')
  const jakpus = cities?.find(c => c.name === 'Jakarta Pusat')
  const tangerang = cities?.find(c => c.name === 'Tangerang')
  const depok = cities?.find(c => c.name === 'Depok')

  if (jaksel && jakpus && tangerang) {
    // Set home cities
    await supabase.from('trainers').update({ home_city_id: jaksel.id }).eq('id', budiId)
    await supabase.from('trainers').update({ home_city_id: jakpus.id }).eq('id', sariId)
    await supabase.from('trainers').update({ home_city_id: tangerang.id }).eq('id', andiId)

    // Set available cities
    await supabase.from('trainer_available_cities').upsert([
      { trainer_id: budiId, city_id: jaksel.id },
      { trainer_id: budiId, city_id: jakpus.id },
      { trainer_id: budiId, city_id: tangerang.id },
      { trainer_id: sariId, city_id: jakpus.id },
      { trainer_id: sariId, city_id: jaksel.id },
      { trainer_id: andiId, city_id: tangerang.id },
      { trainer_id: andiId, city_id: depok?.id || tangerang.id },
    ], { onConflict: 'trainer_id,city_id' })
    console.log('  ✅ Locations set')
  }

  // 5. Trainer availability
  console.log('\n⏰ Setting availability...')
  const availSlots = [
    // Budi: Mon-Fri 07:00-12:00
    ...[1, 2, 3, 4, 5].map(d => ({ trainer_id: budiId, day_of_week: d, start_time: '07:00', end_time: '12:00' })),
    // Sari: Mon-Sat 14:00-19:00
    ...[1, 2, 3, 4, 5, 6].map(d => ({ trainer_id: sariId, day_of_week: d, start_time: '14:00', end_time: '19:00' })),
    // Andi: Tue, Thu, Sat 08:00-11:00
    ...[2, 4, 6].map(d => ({ trainer_id: andiId, day_of_week: d, start_time: '08:00', end_time: '11:00' })),
  ]
  const { error: availErr } = await supabase.from('trainer_availability').insert(availSlots)
  if (availErr) console.error('  ❌', availErr.message)
  else console.log('  ✅ Availability set')

  // 6. Packages
  console.log('\n📦 Creating packages...')
  const pkgs = [
    { name: 'Paket 4x / Bulan', session_count: 4, duration_days: 30, price: 800000, description: '4 sesi latihan per bulan' },
    { name: 'Paket 8x / Bulan', session_count: 8, duration_days: 30, price: 1400000, description: '8 sesi latihan per bulan (hemat 12.5%)' },
    { name: 'Paket 12x / Bulan', session_count: 12, duration_days: 30, price: 1800000, description: '12 sesi latihan per bulan (hemat 25%)' },
  ]
  const { data: insertedPkgs, error: pkgErr } = await supabase.from('packages').insert(pkgs).select()
  if (pkgErr && pkgErr.message.includes('duplicate')) {
    console.log('  ⏭️  Packages already exist')
  } else if (pkgErr) {
    console.error('  ❌', pkgErr.message)
  } else {
    console.log(`  ✅ ${insertedPkgs?.length || 0} packages`)
  }

  // Get package IDs
  const { data: allPkgs } = await supabase.from('packages').select('id, name, session_count')
  const pkg4 = allPkgs?.find(p => p.session_count === 4)
  const pkg8 = allPkgs?.find(p => p.session_count === 8)
  const pkg12 = allPkgs?.find(p => p.session_count === 12)

  // 7. Customers
  console.log('\n👥 Creating customers...')
  const customers = [
    { full_name: 'Rini Wulandari', phone: '081234567890', email: 'rini@email.com', notes: 'Pemula renang', city_id: jaksel?.id, created_by: adminId },
    { full_name: 'Dedi Kurniawan', phone: '081234567891', email: 'dedi@email.com', notes: 'Target: flexibility', city_id: jakpus?.id, created_by: adminId },
    { full_name: 'Maya Sari', phone: '081234567892', email: 'maya@email.com', notes: 'Yoga untuk relaksasi', city_id: jaksel?.id, created_by: adminId },
    { full_name: 'Agus Setiawan', phone: '081234567893', email: 'agus@email.com', notes: 'Renang anak', city_id: tangerang?.id, created_by: adminId },
    { full_name: 'Lina Hartono', phone: '081234567894', email: 'lina@email.com', notes: 'Yoga pemula', city_id: depok?.id, created_by: adminId },
  ]
  const { data: insertedCustomers, error: custErr } = await supabase.from('customers').insert(customers).select()
  if (custErr) console.error('  ❌', custErr.message)
  else console.log(`  ✅ ${insertedCustomers?.length || 0} customers`)

  const rini = insertedCustomers?.find(c => c.full_name === 'Rini Wulandari')
  const dedi = insertedCustomers?.find(c => c.full_name === 'Dedi Kurniawan')
  const maya = insertedCustomers?.find(c => c.full_name === 'Maya Sari')
  const agus = insertedCustomers?.find(c => c.full_name === 'Agus Setiawan')
  const lina = insertedCustomers?.find(c => c.full_name === 'Lina Hartono')

  // 8. Enrollments
  console.log('\n📋 Creating enrollments...')
  const today = new Date()
  const enrollments = [
    { customer_id: rini?.id, trainer_id: budiId, package_id: pkg4?.id, payment_type: 'prepaid', status: 'active', start_date: daysAgo(10), sessions_total: 4, sessions_done: 2, created_by: adminId },
    { customer_id: dedi?.id, trainer_id: sariId, package_id: pkg8?.id, payment_type: 'postpaid', status: 'active', start_date: daysAgo(15), sessions_total: 8, sessions_done: 3, created_by: adminId },
    { customer_id: maya?.id, trainer_id: sariId, package_id: pkg4?.id, payment_type: 'postpaid', status: 'active', start_date: daysAgo(5), sessions_total: 4, sessions_done: 1, created_by: adminId },
    { customer_id: agus?.id, trainer_id: andiId, package_id: pkg8?.id, payment_type: 'prepaid', status: 'active', start_date: daysAgo(20), sessions_total: 8, sessions_done: 5, created_by: adminId },
    { customer_id: lina?.id, trainer_id: sariId, package_id: pkg12?.id, payment_type: 'postpaid', status: 'completed', start_date: daysAgo(40), end_date: daysAgo(2), sessions_total: 12, sessions_done: 12, created_by: adminId },
  ]

  const { data: insertedEnrollments, error: enrErr } = await supabase.from('enrollments').insert(enrollments).select()
  if (enrErr) console.error('  ❌', enrErr.message)
  else console.log(`  ✅ ${insertedEnrollments?.length || 0} enrollments`)

  // 9. Sessions
  console.log('\n📅 Creating sessions...')
  const enrRini = insertedEnrollments?.find(e => e.customer_id === rini?.id)
  const enrDedi = insertedEnrollments?.find(e => e.customer_id === dedi?.id)
  const enrMaya = insertedEnrollments?.find(e => e.customer_id === maya?.id && e.trainer_id === sariId)
  const enrAgus = insertedEnrollments?.find(e => e.customer_id === agus?.id)

  const sessions = [
    // Rini: 2 completed, 1 approved upcoming, 1 proposed
    { enrollment_id: enrRini?.id, trainer_id: budiId, scheduled_date: daysAgo(8), start_time: '08:00', end_time: '09:00', status: 'completed', booking_source: 'customer_propose' },
    { enrollment_id: enrRini?.id, trainer_id: budiId, scheduled_date: daysAgo(4), start_time: '08:00', end_time: '09:00', status: 'completed', booking_source: 'customer_propose' },
    { enrollment_id: enrRini?.id, trainer_id: budiId, scheduled_date: daysFromNow(2), start_time: '08:00', end_time: '09:00', status: 'approved', booking_source: 'customer_propose' },
    { enrollment_id: enrRini?.id, trainer_id: budiId, scheduled_date: daysFromNow(6), start_time: '09:00', end_time: '10:00', status: 'proposed', booking_source: 'customer_propose' },
    // Dedi: 3 completed, 2 approved
    { enrollment_id: enrDedi?.id, trainer_id: sariId, scheduled_date: daysAgo(12), start_time: '15:00', end_time: '16:00', status: 'completed', booking_source: 'trainer_slot' },
    { enrollment_id: enrDedi?.id, trainer_id: sariId, scheduled_date: daysAgo(9), start_time: '15:00', end_time: '16:00', status: 'completed', booking_source: 'trainer_slot' },
    { enrollment_id: enrDedi?.id, trainer_id: sariId, scheduled_date: daysAgo(5), start_time: '15:00', end_time: '16:00', status: 'completed', booking_source: 'trainer_slot' },
    { enrollment_id: enrDedi?.id, trainer_id: sariId, scheduled_date: daysFromNow(1), start_time: '15:00', end_time: '16:00', status: 'approved', booking_source: 'trainer_slot' },
    { enrollment_id: enrDedi?.id, trainer_id: sariId, scheduled_date: daysFromNow(4), start_time: '15:00', end_time: '16:00', status: 'approved', booking_source: 'customer_propose' },
    // Maya: 1 completed, 1 proposed
    { enrollment_id: enrMaya?.id, trainer_id: sariId, scheduled_date: daysAgo(3), start_time: '16:00', end_time: '17:00', status: 'completed', booking_source: 'customer_propose' },
    { enrollment_id: enrMaya?.id, trainer_id: sariId, scheduled_date: daysFromNow(3), start_time: '16:00', end_time: '17:00', status: 'proposed', booking_source: 'customer_propose' },
    // Agus: 5 completed, 1 approved
    { enrollment_id: enrAgus?.id, trainer_id: andiId, scheduled_date: daysAgo(18), start_time: '09:00', end_time: '10:00', status: 'completed', booking_source: 'trainer_slot' },
    { enrollment_id: enrAgus?.id, trainer_id: andiId, scheduled_date: daysAgo(14), start_time: '09:00', end_time: '10:00', status: 'completed', booking_source: 'trainer_slot' },
    { enrollment_id: enrAgus?.id, trainer_id: andiId, scheduled_date: daysAgo(10), start_time: '09:00', end_time: '10:00', status: 'completed', booking_source: 'trainer_slot' },
    { enrollment_id: enrAgus?.id, trainer_id: andiId, scheduled_date: daysAgo(6), start_time: '09:00', end_time: '10:00', status: 'completed', booking_source: 'trainer_slot' },
    { enrollment_id: enrAgus?.id, trainer_id: andiId, scheduled_date: daysAgo(2), start_time: '09:00', end_time: '10:00', status: 'completed', booking_source: 'trainer_slot' },
    { enrollment_id: enrAgus?.id, trainer_id: andiId, scheduled_date: daysFromNow(2), start_time: '09:00', end_time: '10:00', status: 'approved', booking_source: 'trainer_slot' },
  ]

  const validSessions = sessions.filter(s => s.enrollment_id)
  const { error: sessErr } = await supabase.from('sessions').insert(validSessions)
  if (sessErr) console.error('  ❌', sessErr.message)
  else console.log(`  ✅ ${validSessions.length} sessions`)

  // 10. Invoices
  console.log('\n💰 Creating invoices...')
  if (enrRini) {
    await supabase.from('invoices').insert({
      enrollment_id: enrRini.id,
      invoice_number: 'INV-2024-0001',
      amount: 800000,
      status: 'paid',
      due_date: daysAgo(8),
    })
  }
  if (enrMaya) {
    await supabase.from('invoices').insert({
      enrollment_id: enrMaya.id,
      invoice_number: 'INV-2024-0002',
      amount: 800000,
      status: 'sent',
      due_date: daysFromNow(7),
    })
  }
  if (insertedEnrollments?.find(e => e.customer_id === lina?.id)) {
    await supabase.from('invoices').insert({
      enrollment_id: insertedEnrollments.find(e => e.customer_id === lina?.id).id,
      invoice_number: 'INV-2024-0003',
      amount: 1800000,
      status: 'sent',
      due_date: daysFromNow(14),
      notes: 'Auto-generated for completed enrollment',
    })
  }
  console.log('  ✅ 3 invoices')

  console.log('\n✨ Seed complete!\n')
  console.log('Login credentials:')
  console.log('  Admin:   admin@trainerapp.dev / password123')
  console.log('  Trainer: budi@trainerapp.dev / password123')
  console.log('  Trainer: sari@trainerapp.dev / password123')
  console.log('  Trainer: andi@trainerapp.dev / password123')
  console.log('')
}

function daysAgo(n) {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString().split('T')[0]
}

function daysFromNow(n) {
  const d = new Date()
  d.setDate(d.getDate() + n)
  return d.toISOString().split('T')[0]
}

seed().catch(console.error)
