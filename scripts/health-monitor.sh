#!/usr/bin/env bash
# health-monitor.sh — self-hosted uptime monitoring for divisionalpha.net
#
# Checks /api/health every invocation. Sends a Brevo alert email on 3 consecutive failures.
# Install as a cron (every 5 minutes):
#   */5 * * * * root /opt/da-health-monitor.sh >> /var/log/da-health-monitor.log 2>&1
#
# Required env vars (or set them below):
#   BREVO_API_KEY    — from Coolify env
#   ALERT_EMAIL      — where to send alerts
#   SITE_URL         — site to monitor

set -euo pipefail

SITE_URL="${SITE_URL:-https://divisionalpha.net}"
BREVO_API_KEY="${BREVO_API_KEY:?BREVO_API_KEY required}"
ALERT_EMAIL="${ALERT_EMAIL:-sbw919@gmail.com}"
STATE_FILE="/var/lib/da-health-monitor.state"
MAX_FAILS=3

mkdir -p "$(dirname "$STATE_FILE")"
FAIL_COUNT=$(cat "$STATE_FILE" 2>/dev/null || echo "0")

TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

HTTP_CODE=$(curl -sf -o /dev/null -w "%{http_code}" "${SITE_URL}/api/health" 2>/dev/null || echo "000")

if [ "$HTTP_CODE" = "200" ]; then
  if [ "$FAIL_COUNT" -gt 0 ]; then
    echo "[$TIMESTAMP] RECOVERED after $FAIL_COUNT failures (HTTP $HTTP_CODE)"
    # Send recovery email
    curl -s -X POST "https://api.brevo.com/v3/smtp/email" \
      -H "api-key: $BREVO_API_KEY" \
      -H "Content-Type: application/json" \
      -d "{
        \"sender\": {\"name\": \"Division Alpha Monitor\", \"email\": \"noreply@divisionalpha.net\"},
        \"to\": [{\"email\": \"$ALERT_EMAIL\"}],
        \"subject\": \"[RECOVERED] divisionalpha.net is back up\",
        \"htmlContent\": \"<p>divisionalpha.net recovered after $FAIL_COUNT consecutive failures.</p><p>Current status: HTTP $HTTP_CODE</p><p>Time: $TIMESTAMP</p>\"
      }" > /dev/null
  else
    echo "[$TIMESTAMP] OK (HTTP $HTTP_CODE)"
  fi
  echo "0" > "$STATE_FILE"
else
  FAIL_COUNT=$((FAIL_COUNT + 1))
  echo "$FAIL_COUNT" > "$STATE_FILE"
  echo "[$TIMESTAMP] FAIL #$FAIL_COUNT (HTTP $HTTP_CODE)"

  if [ "$FAIL_COUNT" -ge "$MAX_FAILS" ]; then
    echo "[$TIMESTAMP] Sending alert (failure threshold reached)"
    curl -s -X POST "https://api.brevo.com/v3/smtp/email" \
      -H "api-key: $BREVO_API_KEY" \
      -H "Content-Type: application/json" \
      -d "{
        \"sender\": {\"name\": \"Division Alpha Monitor\", \"email\": \"noreply@divisionalpha.net\"},
        \"to\": [{\"email\": \"$ALERT_EMAIL\"}],
        \"subject\": \"[DOWN] divisionalpha.net is not responding\",
        \"htmlContent\": \"<p><strong>divisionalpha.net appears to be down.</strong></p><p>$FAIL_COUNT consecutive health check failures.</p><p>Last HTTP status: $HTTP_CODE</p><p>URL checked: ${SITE_URL}/api/health</p><p>Time: $TIMESTAMP</p><p>Check Coolify: http://100.76.178.67:8000</p>\"
      }" > /dev/null
  fi
fi
