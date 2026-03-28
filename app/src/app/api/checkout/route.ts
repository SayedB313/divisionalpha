import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2026-03-25.dahlia',
  })
}

export async function POST(request: NextRequest) {
  try {
    const stripe = getStripe()
    const { email, name } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 })
    }

    const origin = request.headers.get('origin')
      || process.env.NEXT_PUBLIC_SITE_URL
      || 'https://divisionalpha.net'

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      customer_email: email,
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID_SPRINT_ACCESS!,
          quantity: 1,
        },
      ],
      metadata: {
        applicant_name: name || '',
        applicant_email: email,
      },
      success_url: `${origin}?checkout=success`,
      cancel_url: `${origin}?checkout=cancel`,
    })

    return NextResponse.json({ url: session.url })
  } catch (err: any) {
    console.error('Checkout error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
