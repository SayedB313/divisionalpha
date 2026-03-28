import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

// GET /api/health — lightweight health check for uptime monitoring
export async function GET() {
  const checks: Record<string, string> = {}

  // App is running
  checks.app = 'ok'

  // Supabase connectivity
  try {
    const supabase = createServiceClient()
    const { error } = await supabase.from('sprints').select('id').limit(1)
    checks.database = error ? `error: ${error.message}` : 'ok'
  } catch (err: any) {
    checks.database = `error: ${err.message}`
  }

  // Environment variables present
  checks.env_brevo = process.env.BREVO_API_KEY ? 'set' : 'missing'
  checks.env_stripe = process.env.STRIPE_SECRET_KEY ? 'set' : 'missing'
  checks.env_minimax = process.env.MINIMAX_API_KEY ? 'set' : 'missing'
  checks.env_supabase = process.env.NEXT_PUBLIC_SUPABASE_URL ? 'set' : 'missing'

  const healthy = checks.app === 'ok' && checks.database === 'ok'

  return NextResponse.json({
    status: healthy ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    checks,
  }, { status: healthy ? 200 : 503 })
}
