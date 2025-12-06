#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

BASE_URL="http://localhost:5000"

echo -e "${YELLOW}=== JWT Authentication Test ===${NC}\n"

# Step 1: Login
echo -e "${YELLOW}Step 1: Logging in...${NC}"
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }')

echo "Login Response:"
echo "$LOGIN_RESPONSE" | jq '.' 2>/dev/null || echo "$LOGIN_RESPONSE"
echo ""

# Extract token
TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.data.token' 2>/dev/null)

if [ "$TOKEN" = "null" ] || [ -z "$TOKEN" ]; then
  echo -e "${RED}❌ Failed to get token. Please check your credentials.${NC}"
  echo -e "${YELLOW}Note: Make sure you have a user with email 'test@example.com' and password 'password123'${NC}"
  echo -e "${YELLOW}Or update the credentials in this script.${NC}"
  exit 1
fi

echo -e "${GREEN}✅ Token obtained successfully${NC}"
echo "Token: ${TOKEN:0:50}..."
echo ""

# Step 2: Test protected endpoint
echo -e "${YELLOW}Step 2: Testing protected endpoint (PATCH /user/me)...${NC}"
UPDATE_RESPONSE=$(curl -s -X PATCH "$BASE_URL/user/me" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "firstName": "John",
    "lastName": "Doe"
  }')

echo "Update Response:"
echo "$UPDATE_RESPONSE" | jq '.' 2>/dev/null || echo "$UPDATE_RESPONSE"
echo ""

# Check if successful
if echo "$UPDATE_RESPONSE" | grep -q '"success":true'; then
  echo -e "${GREEN}✅ Authentication successful!${NC}"
else
  echo -e "${RED}❌ Authentication failed!${NC}"
  echo -e "${YELLOW}Check the server logs for detailed error information.${NC}"
fi
