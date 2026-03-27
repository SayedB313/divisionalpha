#!/bin/bash
# Division Alpha — Cron Setup for Coolify Server
#
# Run this on your Coolify server to set up the agent cron dispatcher.
# The cron endpoint checks the day/time and fires the right agents:
#   - Monday 7-9am: Declaration prompts + email reminders
#   - Wednesday 11am-1pm: Check-in prompts + email reminders
#   - Friday 2-4pm: Reflection prompts + email reminders
#   - Friday 9-11pm: Weekly summary + score calculation
#   - Weekdays every 6h: Guardian engagement scan
#   - Late Mon/Wed 9-11pm: Nudge non-submitters
#
# Usage:
#   chmod +x scripts/setup-cron.sh
#   ./scripts/setup-cron.sh

CRON_SECRET="${CRON_SECRET:-div-alpha-cron-secret-change-in-production}"
SITE_URL="${SITE_URL:-https://divisionalpha.net}"

CRON_LINE="0 */3 * * * curl -sf -H 'Authorization: Bearer ${CRON_SECRET}' '${SITE_URL}/api/agents/cron' >> /var/log/divisionalpha-cron.log 2>&1"

# Check if cron job already exists
if crontab -l 2>/dev/null | grep -q "divisionalpha.net/api/agents/cron"; then
  echo "Cron job already exists. Updating..."
  crontab -l 2>/dev/null | grep -v "divisionalpha.net/api/agents/cron" | crontab -
fi

# Add the cron job
(crontab -l 2>/dev/null; echo "$CRON_LINE") | crontab -

echo "Cron job installed:"
echo "  Schedule: Every 3 hours"
echo "  Endpoint: ${SITE_URL}/api/agents/cron"
echo "  Log: /var/log/divisionalpha-cron.log"
echo ""
echo "Verify with: crontab -l"
