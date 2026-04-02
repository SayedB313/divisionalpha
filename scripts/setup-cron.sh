#!/usr/bin/env bash
# Division Alpha — Cron Setup for Coolify Server
#
# Installs the agent dispatch cron into /etc/cron.d/ (requires sudo/root).
# The cron endpoint checks day/time and fires the right agents:
#   - Monday 7-9am ET:    Declaration prompts + email reminders
#   - Wednesday 11am-1pm ET: Check-in prompts + email reminders
#   - Friday 2-4pm ET:    Reflection prompts + email reminders
#   - Friday 9-11pm ET:   Weekly summary + score calculation
#   - Weekdays, 6-hourly: Guardian engagement scan
#   - Late Mon/Wed:       Nudge non-submitters
#
# Usage (on server as root or with sudo):
#   CRON_SECRET=your-secret ./scripts/setup-cron.sh
#
# Env vars:
#   CRON_SECRET  — must match CRON_SECRET in Coolify env vars
#   SITE_URL     — defaults to https://divisionalpha.net

set -euo pipefail

CRON_SECRET="${CRON_SECRET:?CRON_SECRET is required}"
SITE_URL="${SITE_URL:-https://divisionalpha.net}"
CRON_FILE="/etc/cron.d/divisionalpha"

sudo tee "$CRON_FILE" > /dev/null << CRON
# Division Alpha — agent dispatch (every 3 hours)
CRON_TZ=UTC
0 */3 * * * root curl -sf -H 'Authorization: Bearer ${CRON_SECRET}' '${SITE_URL}/api/agents/cron' >> /var/log/divisionalpha-cron.log 2>&1
CRON

sudo chmod 644 "$CRON_FILE"

echo "Cron installed at $CRON_FILE:"
sudo cat "$CRON_FILE"
echo ""
echo "Verify: sudo systemctl status cron"
echo "Log:    sudo tail -f /var/log/divisionalpha-cron.log"
