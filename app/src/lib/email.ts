// Brevo (formerly Sendinblue) — 300 emails/day free (9k/month)
// No SDK needed, just their REST API

const FROM_NAME = 'Division Alpha'
const FROM_EMAIL = 'noreply@divisionalpha.net'

interface SendEmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

export async function sendEmail({ to, subject, html, text }: SendEmailOptions) {
  const apiKey = process.env.BREVO_API_KEY
  if (!apiKey) {
    console.warn('[email] BREVO_API_KEY not set, skipping email')
    return null
  }

  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'accept': 'application/json',
      'content-type': 'application/json',
      'api-key': apiKey,
    },
    body: JSON.stringify({
      sender: { name: FROM_NAME, email: FROM_EMAIL },
      to: [{ email: to }],
      subject,
      htmlContent: html,
      textContent: text || undefined,
    }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }))
    console.error('[email] Send failed:', err)
    throw new Error(err.message || `Brevo API error: ${res.status}`)
  }

  return res.json()
}

// ─── Email Templates ──────────────────────────────────

const FOOTER = `
  <p style="margin-top:32px;padding-top:16px;border-top:1px solid #e3ddd0;font-size:11px;color:#948d7e;font-family:monospace;">
    Division Alpha &middot; AI-orchestrated peer accountability
  </p>
`

function wrap(content: string): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:32px 16px;background:#faf7f0;font-family:'DM Sans',system-ui,sans-serif;color:#1c1a15;line-height:1.6;">
  <div style="max-width:560px;margin:0 auto;">
    <p style="font-size:11px;letter-spacing:0.08em;text-transform:uppercase;color:#948d7e;font-family:monospace;margin-bottom:24px;">
      Division Alpha
    </p>
    ${content}
    ${FOOTER}
  </div>
</body>
</html>`
}

export function mondayDeclarationReminder(name: string, week: number, sprintNum: number): SendEmailOptions {
  return {
    to: '',
    subject: `Week ${week} — Time to declare`,
    html: wrap(`
      <h2 style="font-size:22px;font-weight:700;margin:0 0 8px;">Monday. Declaration time.</h2>
      <p>${name}, Sprint ${sprintNum} Week ${week} is live. Your squad is waiting on your goals.</p>
      <p>Open the app and declare what you're committing to this week. Be specific. Be measurable.</p>
      <a href="https://divisionalpha.net" style="display:inline-block;margin-top:16px;padding:12px 24px;background:#3d6b4a;color:#fff;text-decoration:none;font-weight:600;font-size:14px;">
        Declare now
      </a>
    `),
    text: `${name}, it's Monday — Sprint ${sprintNum} Week ${week}. Time to declare your goals. Open Division Alpha to get started.`,
  }
}

export function wednesdayCheckinReminder(name: string, week: number, sprintNum: number): SendEmailOptions {
  return {
    to: '',
    subject: `Week ${week} — Check-in time`,
    html: wrap(`
      <h2 style="font-size:22px;font-weight:700;margin:0 0 8px;">Wednesday. Signal check.</h2>
      <p>${name}, how are your goals tracking? Green, yellow, or red — your squad needs to know.</p>
      <a href="https://divisionalpha.net" style="display:inline-block;margin-top:16px;padding:12px 24px;background:#3d6b4a;color:#fff;text-decoration:none;font-weight:600;font-size:14px;">
        Check in now
      </a>
    `),
    text: `${name}, it's Wednesday — Sprint ${sprintNum} Week ${week}. Time to check in with your squad. Green, yellow, or red?`,
  }
}

export function fridayReflectionReminder(name: string, week: number, sprintNum: number): SendEmailOptions {
  return {
    to: '',
    subject: `Week ${week} — Reflect on your week`,
    html: wrap(`
      <h2 style="font-size:22px;font-weight:700;margin:0 0 8px;">Friday. Look back.</h2>
      <p>${name}, what landed this week? What didn't? What are you carrying forward?</p>
      <p>Your squad reads these. Make it real.</p>
      <a href="https://divisionalpha.net" style="display:inline-block;margin-top:16px;padding:12px 24px;background:#3d6b4a;color:#fff;text-decoration:none;font-weight:600;font-size:14px;">
        Reflect now
      </a>
    `),
    text: `${name}, it's Friday — Sprint ${sprintNum} Week ${week}. Time to reflect. What landed, what didn't, what you're carrying forward.`,
  }
}

export function squadNudge(name: string, squadName: string, action: string): SendEmailOptions {
  return {
    to: '',
    subject: `Your squad ${squadName} is waiting`,
    html: wrap(`
      <h2 style="font-size:22px;font-weight:700;margin:0 0 8px;">Your squad is moving.</h2>
      <p>${name}, ${squadName} has been active but we haven't seen you ${action} yet this week.</p>
      <p>No judgment. Just showing up matters.</p>
      <a href="https://divisionalpha.net" style="display:inline-block;margin-top:16px;padding:12px 24px;background:#3d6b4a;color:#fff;text-decoration:none;font-weight:600;font-size:14px;">
        Open Division Alpha
      </a>
    `),
    text: `${name}, your squad ${squadName} is active but you haven't ${action} yet. No judgment — just show up.`,
  }
}

export function lifeCheckDm(name: string): SendEmailOptions {
  return {
    to: '',
    subject: 'Just checking in',
    html: wrap(`
      <h2 style="font-size:22px;font-weight:700;margin:0 0 8px;">Hey ${name}.</h2>
      <p>We noticed you've been quiet. No pressure, no guilt — just checking if you're okay.</p>
      <p>If life got heavy, that's what the Pause Protocol is for. Your squad will be here when you're ready.</p>
      <a href="https://divisionalpha.net" style="display:inline-block;margin-top:16px;padding:12px 24px;background:#3d6b4a;color:#fff;text-decoration:none;font-weight:600;font-size:14px;">
        Open Division Alpha
      </a>
    `),
    text: `Hey ${name}. We noticed you've been quiet. No pressure — just checking if you're okay. If life got heavy, the Pause Protocol is there for you.`,
  }
}

export function sprintKickoff(name: string, sprintNum: number, squadName: string): SendEmailOptions {
  return {
    to: '',
    subject: `Sprint ${sprintNum} starts now`,
    html: wrap(`
      <h2 style="font-size:22px;font-weight:700;margin:0 0 8px;">Sprint ${sprintNum} is live.</h2>
      <p>${name}, you've been matched with ${squadName}. Six weeks. Real goals. Real accountability.</p>
      <p>Your kickoff ceremony is ready. Meet your squad and commit.</p>
      <a href="https://divisionalpha.net" style="display:inline-block;margin-top:16px;padding:12px 24px;background:#3d6b4a;color:#fff;text-decoration:none;font-weight:600;font-size:14px;">
        Join kickoff
      </a>
    `),
    text: `${name}, Sprint ${sprintNum} is live. You're in ${squadName}. Your kickoff ceremony is ready — meet your squad and commit.`,
  }
}

export function sprintCompletion(name: string, sprintNum: number, score: number): SendEmailOptions {
  return {
    to: '',
    subject: `Sprint ${sprintNum} complete — your results`,
    html: wrap(`
      <h2 style="font-size:22px;font-weight:700;margin:0 0 8px;">Sprint ${sprintNum} is done.</h2>
      <p>${name}, you showed up for six weeks. That matters more than any number.</p>
      <p style="font-size:28px;font-weight:700;color:#3d6b4a;margin:16px 0;">
        Operator Score: ${score}
      </p>
      <p>Your completion ceremony is ready. Reflect, give gratitude, and decide what's next.</p>
      <a href="https://divisionalpha.net" style="display:inline-block;margin-top:16px;padding:12px 24px;background:#3d6b4a;color:#fff;text-decoration:none;font-weight:600;font-size:14px;">
        View results
      </a>
    `),
    text: `${name}, Sprint ${sprintNum} is done. Operator Score: ${score}. Your completion ceremony is ready.`,
  }
}
