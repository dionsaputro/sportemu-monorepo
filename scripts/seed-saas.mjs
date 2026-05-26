/**
 * Sportemu SaaS Seed Script
 * Run: node scripts/seed-saas.mjs
 *
 * Creates a test trainer user (bypasses email rate limit via admin API)
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const envPath = resolve(__dirname, '../apps/web/.env.local')
const envContent = readFileSync(envPath, 'utf-8')
const env = Object.fromEntries(
  envContent.split('\n').filter(l => l && !l.startsWith('#')).map(l => l.split('=').map(s => s.trim()))
)

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
})

async function createUser(email, password, metadata) {
  const { data: existing } = await supabase.auth.admin.listUsers()
  const found = existing?.users?.find(u => u.email === email)
  if (found) {
    console.log(`  ⏭️  ${email} already exists (${found.id})`)
    return found.id
  }

  const { data, error } = await supabase.auth.admin.createUser({
    email, password, email_confirm: true, user_metadata: metadata,
  })
  if (error) { console.error(`  ❌ ${email}:`, error.message); return null }
  console.log(`  ✅ ${email} (${data.user.id})`)
  return data.user.id
}

async function seed() {
  console.log('\n🏊 Sportemu SaaS Seeder\n')

  // 1. Create a test trainer
  console.log('👤 Creating test trainer...')
  const trainerId = await createUser('trainer@test.dev', 'password123', { role: 'trainer', full_name: 'Test Trainer' })

  if (!trainerId) { console.error('Failed'); process.exit(1) }

  // 2. Ensure profile exists
  const { data: profile } = await supabase.from('profiles').select('id').eq('id', trainerId).single()
  if (!profile) {
    await supabase.from('profiles').insert({ id: trainerId, role: 'trainer', full_name: 'Test Trainer' })
    console.log('  ✅ Profile created')
  }

  // 3. Ensure trainer record exists
  const { data: trainer } = await supabase.from('trainers').select('id').eq('id', trainerId).single()
  if (!trainer) {
    await supabase.from('trainers').insert({ id: trainerId, specialty: 'renang' })
    console.log('  ✅ Trainer record created')
  }

  // 4. Check subscription
  const { data: sub } = await supabase.from('trainer_subscriptions').select('id, status, subscription_plans(name)').eq('trainer_id', trainerId).single()
  if (sub) {
    console.log(`  ✅ Subscription: ${sub.subscription_plans?.name} (${sub.status})`)
  } else {
    // Manually create free subscription
    const { data: freePlan } = await supabase.from('subscription_plans').select('id').eq('is_free', true).single()
    if (freePlan) {
      await supabase.from('trainer_subscriptions').insert({ trainer_id: trainerId, plan_id: freePlan.id, status: 'free' })
      console.log('  ✅ Free subscription created')
    }
  }

  // 5. Add some test clients
  console.log('\n👥 Creating test clients...')
  const clients = [
    { full_name: 'Rina Mulyani', phone: '081111111111', email: 'rina@test.com', created_by: trainerId },
    { full_name: 'Bowo Santoso', phone: '081222222222', email: 'bowo@test.com', created_by: trainerId },
    { full_name: 'Citra Dewi', phone: '081333333333', email: 'citra@test.com', created_by: trainerId },
  ]

  for (const c of clients) {
    const { data: existing } = await supabase.from('customers').select('id').eq('email', c.email).single()
    if (existing) { console.log(`  ⏭️  ${c.full_name} exists`); continue }
    const { error } = await supabase.from('customers').insert(c)
    if (error) console.error(`  ❌ ${c.full_name}:`, error.message)
    else console.log(`  ✅ ${c.full_name}`)
  }

  // 6. Add packages
  console.log('\n📦 Creating test packages...')
  const pkgs = [
    { name: 'Paket Renang 4x', session_count: 4, duration_days: 30, price: 800000, description: '4 sesi renang per bulan' },
    { name: 'Paket Renang 8x', session_count: 8, duration_days: 30, price: 1400000, description: '8 sesi renang per bulan' },
  ]
  for (const p of pkgs) {
    const { data: existing } = await supabase.from('packages').select('id').eq('name', p.name).single()
    if (existing) { console.log(`  ⏭️  ${p.name} exists`); continue }
    await supabase.from('packages').insert(p)
    console.log(`  ✅ ${p.name}`)
  }

  // 7. Get IDs for enrollments
  const { data: allClients } = await supabase.from('customers').select('id, full_name').eq('created_by', trainerId)
  const { data: allPkgs } = await supabase.from('packages').select('id, name, session_count')
  const pkg4 = allPkgs?.find(p => p.session_count === 4)

  // 8. Enrollments
  console.log('\n📋 Creating enrollments...')
  const rina = allClients?.find(c => c.full_name === 'Rina Mulyani')
  const bowo = allClients?.find(c => c.full_name === 'Bowo Santoso')
  const citra = allClients?.find(c => c.full_name === 'Citra Dewi')

  const enrollData = [
    { customer_id: rina?.id, trainer_id: trainerId, package_id: pkg4?.id, payment_type: 'prepaid', status: 'active', start_date: daysAgo(10), sessions_total: 4, sessions_done: 2, created_by: trainerId },
    { customer_id: bowo?.id, trainer_id: trainerId, package_id: pkg4?.id, payment_type: 'postpaid', status: 'active', start_date: daysAgo(7), sessions_total: 4, sessions_done: 1, created_by: trainerId },
    { customer_id: citra?.id, trainer_id: trainerId, package_id: pkg4?.id, payment_type: 'prepaid', status: 'active', start_date: daysAgo(3), sessions_total: 4, sessions_done: 0, created_by: trainerId },
  ].filter(e => e.customer_id && e.package_id)

  // Check if enrollments already exist
  const { count: existingEnrollments } = await supabase.from('enrollments').select('id', { count: 'exact', head: true }).eq('trainer_id', trainerId)
  if (existingEnrollments && existingEnrollments > 0) {
    console.log(`  ⏭️  ${existingEnrollments} enrollments already exist`)
  } else {
    const { error: enrErr } = await supabase.from('enrollments').insert(enrollData)
    if (enrErr) console.error('  ❌', enrErr.message)
    else console.log(`  ✅ ${enrollData.length} enrollments`)
  }

  // 9. Availability
  console.log('\n⏰ Setting availability...')
  const { count: existingAvail } = await supabase.from('trainer_availability').select('id', { count: 'exact', head: true }).eq('trainer_id', trainerId)
  if (existingAvail && existingAvail > 0) {
    console.log(`  ⏭️  Already set`)
  } else {
    const slots = [1, 2, 3, 4, 5].map(d => ({ trainer_id: trainerId, day_of_week: d, start_time: '08:00', end_time: '12:00' }))
    await supabase.from('trainer_availability').insert(slots)
    console.log('  ✅ Mon-Fri 08:00-12:00')
  }

  // 10. Sessions
  console.log('\n📅 Creating sessions...')
  const { data: enrollments } = await supabase.from('enrollments').select('id, customer_id').eq('trainer_id', trainerId)
  const { count: existingSessions } = await supabase.from('sessions').select('id', { count: 'exact', head: true }).eq('trainer_id', trainerId)

  if (existingSessions && existingSessions > 0) {
    console.log(`  ⏭️  ${existingSessions} sessions already exist`)
  } else if (enrollments && enrollments.length > 0) {
    const sessions = []
    const rinaEnr = enrollments.find(e => e.customer_id === rina?.id)
    const bowoEnr = enrollments.find(e => e.customer_id === bowo?.id)

    if (rinaEnr) {
      sessions.push(
        { enrollment_id: rinaEnr.id, trainer_id: trainerId, scheduled_date: daysAgo(8), start_time: '08:00', end_time: '09:00', status: 'completed', booking_source: 'trainer_slot' },
        { enrollment_id: rinaEnr.id, trainer_id: trainerId, scheduled_date: daysAgo(4), start_time: '08:00', end_time: '09:00', status: 'completed', booking_source: 'trainer_slot' },
        { enrollment_id: rinaEnr.id, trainer_id: trainerId, scheduled_date: daysFromNow(2), start_time: '08:00', end_time: '09:00', status: 'approved', booking_source: 'customer_propose' },
        { enrollment_id: rinaEnr.id, trainer_id: trainerId, scheduled_date: daysFromNow(5), start_time: '09:00', end_time: '10:00', status: 'proposed', booking_source: 'customer_propose' },
      )
    }
    if (bowoEnr) {
      sessions.push(
        { enrollment_id: bowoEnr.id, trainer_id: trainerId, scheduled_date: daysAgo(5), start_time: '10:00', end_time: '11:00', status: 'completed', booking_source: 'trainer_slot' },
        { enrollment_id: bowoEnr.id, trainer_id: trainerId, scheduled_date: daysFromNow(1), start_time: '10:00', end_time: '11:00', status: 'approved', booking_source: 'trainer_slot' },
        { enrollment_id: bowoEnr.id, trainer_id: trainerId, scheduled_date: daysFromNow(4), start_time: '10:00', end_time: '11:00', status: 'proposed', booking_source: 'customer_propose' },
      )
    }

    const { error: sessErr } = await supabase.from('sessions').insert(sessions)
    if (sessErr) console.error('  ❌', sessErr.message)
    else console.log(`  ✅ ${sessions.length} sessions`)
  }

  // 11. Invoice
  console.log('\n💰 Creating invoice...')
  const { count: existingInv } = await supabase.from('invoices').select('id', { count: 'exact', head: true })
    .eq('enrollment_id', enrollments?.find(e => e.customer_id === rina?.id)?.id || '')
  if (existingInv && existingInv > 0) {
    console.log('  ⏭️  Invoice exists')
  } else if (enrollments) {
    const rinaEnr = enrollments.find(e => e.customer_id === rina?.id)
    if (rinaEnr) {
      await supabase.from('invoices').insert({
        enrollment_id: rinaEnr.id,
        invoice_number: 'INV-2024-T001',
        amount: 800000,
        status: 'paid',
        due_date: daysAgo(8),
      })
      console.log('  ✅ Invoice created (paid)')
    }
  }

  console.log('\n✨ Done!\n')
  console.log('Login as trainer:')
  console.log('  Email:    trainer@test.dev')
  console.log('  Password: password123')
  console.log('')
}

seed().catch(console.error)

function daysAgo(n) {
  const d = new Date(); d.setDate(d.getDate() - n)
  return d.toISOString().split('T')[0]
}

function daysFromNow(n) {
  const d = new Date(); d.setDate(d.getDate() + n)
  return d.toISOString().split('T')[0]
}
