import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createServiceClient } from '@/lib/supabase/server'

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2026-03-25.dahlia',
  })
}

export async function POST(request: NextRequest) {
  const body = await request.text()
  const sig = request.headers.get('stripe-signature')!

  let event: Stripe.Event

  try {
    const stripe = getStripe()
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const supabase = createServiceClient()

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const email = session.customer_email || session.customer_details?.email
      const customerId = session.customer as string

      if (!email) {
        console.error('No email in checkout session')
        break
      }

      // Check if application exists
      const { data: application } = await supabase
        .from('applications')
        .select('*')
        .eq('email', email)
        .eq('status', 'submitted')
        .single()

      if (!application) {
        console.error('No matching application for:', email)
        break
      }

      // Create auth user via Supabase Admin API
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email,
        email_confirm: true,
        user_metadata: {
          display_name: application.full_name,
        },
      })

      if (authError) {
        console.error('Error creating user:', authError)
        break
      }

      const userId = authData.user.id

      // Update the auto-created profile with application data
      await supabase.from('profiles').update({
        display_name: application.full_name,
        initials: application.full_name
          .split(' ')
          .map((n: string) => n[0])
          .join('')
          .toUpperCase()
          .slice(0, 2),
        timezone: application.timezone,
        one_liner: application.one_liner,
        primary_focus: application.primary_focus,
        current_stage: application.current_stage,
        accountability_style: application.accountability_style,
        support_instinct: application.support_instinct,
        persona_type: application.persona_type,
        why_applying: application.why_applying,
        communication_freq: application.communication_freq,
        tier: 2,
        status: 'active',
        stripe_customer_id: customerId,
        stripe_subscription_id: session.subscription as string,
        subscription_status: 'active',
      }).eq('id', userId)

      // Mark application as converted
      await supabase.from('applications').update({
        status: 'converted',
        converted_to_user_id: userId,
      }).eq('id', application.id)

      // Send magic link for first login
      await supabase.auth.admin.generateLink({
        type: 'magiclink',
        email,
      })

      console.log(`User created: ${email} (${userId})`)
      break
    }

    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription
      const customerId = subscription.customer as string

      await supabase.from('profiles').update({
        subscription_status: subscription.status,
      }).eq('stripe_customer_id', customerId)
      break
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription
      const customerId = subscription.customer as string

      await supabase.from('profiles').update({
        subscription_status: 'canceled',
        status: 'churned',
      }).eq('stripe_customer_id', customerId)
      break
    }
  }

  return NextResponse.json({ received: true })
}
