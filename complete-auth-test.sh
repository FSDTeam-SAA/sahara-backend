#!/bin/bash

echo "🧪 Complete Authentication Flow Test"
echo "===================================="
echo ""

# Step 1: Register
echo "📝 Step 1: Registering user..."
REGISTER_RESPONSE=$(curl -s -X POST http://localhost:5000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Quick",
    "lastName": "Test",
    "email": "quicktest@example.com",
    "password": "test123"
  }')

echo "$REGISTER_RESPONSE" | jq '.' 2>/dev/null || echo "$REGISTER_RESPONSE"
echo ""

# Step 2: Get OTP from response (you'll need to check server logs)
echo "⚠️  Check your server terminal for the OTP code!"
echo "Look for: 🔑 OTP Code: XXXXXX"
echo ""
read -p "Enter the OTP from server logs: " OTP

# Step 3: Verify OTP
echo ""
echo "✅ Step 2: Verifying OTP..."
VERIFY_RESPONSE=$(curl -s -X POST http://localhost:5000/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"quicktest@example.com\",
    \"token\": \"$OTP\"
  }")

echo "$VERIFY_RESPONSE" | jq '.' 2>/dev/null || echo "$VERIFY_RESPONSE"
echo ""

# Step 4: Login
echo "🔐 Step 3: Logging in..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:5000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "quicktest@example.com",
    "password": "test123"
  }')

echo "$LOGIN_RESPONSE" | jq '.' 2>/dev/null || echo "$LOGIN_RESPONSE"
echo ""

TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.data.token' 2>/dev/null)

if [ "$TOKEN" != "null" ] && [ -n "$TOKEN" ]; then
  echo "✅ SUCCESS! Token obtained:"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "$TOKEN"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo ""
  
  # Step 5: Test protected endpoint
  echo "🧪 Step 4: Testing protected endpoint..."
  UPDATE_RESPONSE=$(curl -s -X PATCH http://localhost:5000/user/me \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d '{
      "firstName": "Updated",
      "lastName": "Name"
    }')
  
  echo "$UPDATE_RESPONSE" | jq '.' 2>/dev/null || echo "$UPDATE_RESPONSE"
  echo ""
  
  if echo "$UPDATE_RESPONSE" | grep -q '"success":true'; then
    echo "🎉 ALL TESTS PASSED! Authentication is working correctly!"
  else
    echo "❌ Protected endpoint test failed"
  fi
else
  echo "❌ Failed to get token"
fi
