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
    const priceId = process.env.STRIPE_PRICE_ID_ENTER || process.env.STRIPE_PRICE_ID_SPRINT_ACCESS

    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 })
    }

    if (!priceId) {
      return NextResponse.json({ error: 'Stripe price not configured' }, { status: 500 })
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
          price: priceId,
          quantity: 1,
        },
      ],
      metadata: {
        product_tier: 'ENTER',
        product_name: 'Division Alpha ENTER',
        proving_ground_length: '40 days',
        applicant_name: name || '',
        applicant_email: email,
      },
      subscription_data: {
        metadata: {
          product_tier: 'ENTER',
        },
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
