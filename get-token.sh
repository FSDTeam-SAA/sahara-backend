#!/bin/bash

# Get a fresh JWT token by logging in

EMAIL="${1:-test@example.com}"
PASSWORD="${2:-password123}"

echo "🔐 Logging in with:"
echo "   Email: $EMAIL"
echo "   Password: $PASSWORD"
echo ""

RESPONSE=$(curl -s -X POST http://localhost:5000/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")

echo "Response:"
echo "$RESPONSE" | jq '.' 2>/dev/null || echo "$RESPONSE"
echo ""

TOKEN=$(echo "$RESPONSE" | jq -r '.data.token' 2>/dev/null)

if [ "$TOKEN" != "null" ] && [ -n "$TOKEN" ]; then
  echo "✅ Token obtained successfully!"
  echo ""
  echo "📋 Copy this token for Postman:"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "$TOKEN"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo ""
  echo "In Postman, add this header:"
  echo "Authorization: Bearer $TOKEN"
else
  echo "❌ Failed to get token"
  echo ""
  echo "Possible reasons:"
  echo "1. User doesn't exist - Register first with:"
  echo "   curl -X POST http://localhost:5000/auth/register \\"
  echo "     -H 'Content-Type: application/json' \\"
  echo "     -d '{\"firstName\":\"Test\",\"lastName\":\"User\",\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}'"
  echo ""
  echo "2. Email not verified - Verify OTP first"
  echo "3. Wrong password"
fi
