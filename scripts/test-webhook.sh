#!/bin/bash
# Test the cal-webhook endpoint locally or on Vercel
# Usage: ./scripts/test-webhook.sh [url]
# Default URL: http://localhost:3000/api/cal-webhook

URL="${1:-http://localhost:3000/api/cal-webhook}"
SECRET="${CAL_WEBHOOK_SECRET:-068c6ce6-ddeb-442c-ad9b-33de15ac002b}"

PAYLOAD=$(cat <<'EOF'
{
  "triggerEvent": "BOOKING_CREATED",
  "createdAt": "2026-03-18T17:30:07.787Z",
  "payload": {
    "attendees": [
      {
        "name": "Test User",
        "email": "test@example.com",
        "timeZone": "America/Denver"
      }
    ],
    "responses": {
      "utm_source": {
        "label": "utm_source",
        "value": "meta",
        "isHidden": true
      }
    },
    "metadata": {}
  }
}
EOF
)

SIGNATURE=$(echo -n "$PAYLOAD" | openssl dgst -sha256 -hmac "$SECRET" | awk '{print $2}')

echo "URL: $URL"
echo "Signature: $SIGNATURE"
echo "---"

curl -X POST "$URL" \
  -H "Content-Type: application/json" \
  -H "x-cal-signature-256: $SIGNATURE" \
  -d "$PAYLOAD" \
  -w "\nHTTP Status: %{http_code}\n"
