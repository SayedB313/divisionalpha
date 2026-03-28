#!/usr/bin/env bash
# register-stripe-webhooks.sh
# Ensures the Stripe webhook endpoint has all required events registered.
# Run once after deploy or after adding new webhook handlers.
#
# Usage:
#   STRIPE_SECRET_KEY=sk_live_... SITE_URL=https://divisionalpha.net ./scripts/register-stripe-webhooks.sh
#   OR just run it from the project root after setting env vars in your shell.

set -euo pipefail

STRIPE_KEY="${STRIPE_SECRET_KEY:?STRIPE_SECRET_KEY is required}"
SITE_URL="${NEXT_PUBLIC_SITE_URL:-https://divisionalpha.net}"
ENDPOINT_URL="${SITE_URL}/api/webhooks/stripe"

REQUIRED_EVENTS=(
  "checkout.session.completed"
  "customer.subscription.updated"
  "customer.subscription.deleted"
  "customer.subscription.paused"
  "customer.subscription.resumed"
  "invoice.payment_failed"
  "charge.failed"
)

echo "==> Looking for existing webhook endpoint: $ENDPOINT_URL"

# List all webhook endpoints and find ours
ENDPOINTS=$(curl -s -u "${STRIPE_KEY}:" \
  "https://api.stripe.com/v1/webhook_endpoints?limit=100")

EXISTING_ID=$(echo "$ENDPOINTS" | python3 -c "
import sys, json
data = json.load(sys.stdin)
for ep in data.get('data', []):
    if ep['url'] == '${ENDPOINT_URL}':
        print(ep['id'])
        break
" 2>/dev/null || true)

# Build comma-separated event list
EVENTS_PARAM=$(printf "&enabled_events[]=%s" "${REQUIRED_EVENTS[@]}")
EVENTS_PARAM="${EVENTS_PARAM:1}"  # strip leading &

if [ -z "$EXISTING_ID" ]; then
  echo "==> No existing endpoint found. Creating new webhook endpoint..."
  RESULT=$(curl -s -u "${STRIPE_KEY}:" \
    -X POST "https://api.stripe.com/v1/webhook_endpoints" \
    -d "url=${ENDPOINT_URL}" \
    -d "api_version=2026-03-25.dahlia" \
    $(printf -- "-d 'enabled_events[]=%s' " "${REQUIRED_EVENTS[@]}"))
  echo "$RESULT" | python3 -c "
import sys, json
data = json.load(sys.stdin)
if 'id' in data:
    print('Created:', data['id'])
    print('Secret:', data.get('secret', '(not returned — check Stripe Dashboard)'))
    print()
    print('IMPORTANT: Add STRIPE_WEBHOOK_SECRET to your Coolify env vars:')
    print('  STRIPE_WEBHOOK_SECRET=' + data.get('secret', ''))
else:
    print('Error:', json.dumps(data, indent=2))
"
else
  echo "==> Found endpoint: $EXISTING_ID — updating events..."
  RESULT=$(curl -s -u "${STRIPE_KEY}:" \
    -X POST "https://api.stripe.com/v1/webhook_endpoints/${EXISTING_ID}" \
    $(printf -- "-d 'enabled_events[]=%s' " "${REQUIRED_EVENTS[@]}"))
  echo "$RESULT" | python3 -c "
import sys, json
data = json.load(sys.stdin)
if 'id' in data:
    print('Updated:', data['id'])
    print('Events:', ', '.join(data.get('enabled_events', [])))
else:
    print('Error:', json.dumps(data, indent=2))
"
fi

echo ""
echo "==> Done. Verify at: https://dashboard.stripe.com/webhooks"
