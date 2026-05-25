import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

interface EnrollmentCheckPayload {
  enrollment_id: string
}

serve(async (req) => {
  try {
    const payload: EnrollmentCheckPayload = await req.json()
    const { enrollment_id } = payload

    // Create admin client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // Get enrollment details
    const { data: enrollment, error: enrollError } = await supabase
      .from('enrollments')
      .select('*, packages(price)')
      .eq('id', enrollment_id)
      .single()

    if (enrollError || !enrollment) {
      return new Response(
        JSON.stringify({ error: 'Enrollment not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Only process postpaid enrollments that are completed
    if (enrollment.payment_type !== 'postpaid') {
      return new Response(
        JSON.stringify({ message: 'Not postpaid, skipping' }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    }

    if (enrollment.sessions_done < enrollment.sessions_total) {
      return new Response(
        JSON.stringify({ message: 'Not all sessions completed yet' }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Check if invoice already exists
    const { data: existingInvoice } = await supabase
      .from('invoices')
      .select('id')
      .eq('enrollment_id', enrollment_id)
      .limit(1)

    if (existingInvoice && existingInvoice.length > 0) {
      return new Response(
        JSON.stringify({ message: 'Invoice already exists' }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Generate invoice number
    const { data: invoiceNumber } = await supabase
      .rpc('generate_invoice_number')

    if (!invoiceNumber) {
      return new Response(
        JSON.stringify({ error: 'Failed to generate invoice number' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Create invoice
    const amount = enrollment.packages?.price || 0
    const dueDate = new Date()
    dueDate.setDate(dueDate.getDate() + 14) // 14 days to pay

    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .insert({
        enrollment_id,
        invoice_number: invoiceNumber,
        amount,
        status: 'sent',
        due_date: dueDate.toISOString().split('T')[0],
        notes: `Auto-generated invoice for completed enrollment`,
      })
      .select()
      .single()

    if (invoiceError) {
      return new Response(
        JSON.stringify({ error: invoiceError.message }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Update enrollment status to completed
    await supabase
      .from('enrollments')
      .update({ status: 'completed' })
      .eq('id', enrollment_id)

    // Create notification for admin(s)
    const { data: admins } = await supabase
      .from('profiles')
      .select('id')
      .eq('role', 'admin')

    if (admins && admins.length > 0) {
      const notifications = admins.map((admin) => ({
        user_id: admin.id,
        type: 'invoice_created' as const,
        title: 'Invoice Baru Dibuat',
        body: `Invoice ${invoiceNumber} telah dibuat otomatis untuk enrollment yang selesai.`,
        data: { invoice_id: invoice.id, enrollment_id },
      }))

      await supabase.from('notifications').insert(notifications)
    }

    return new Response(
      JSON.stringify({
        message: 'Auto-invoice created',
        invoice_number: invoiceNumber,
        amount,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})
