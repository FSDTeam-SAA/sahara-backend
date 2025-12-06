# JWT Authentication Testing Guide

## 🔍 Problem Summary

You're getting `401 Unauthorized` with error: **"invalid signature"**

### Root Cause
The JWT token you're using was signed with a **different JWT_SECRET** than what the server is currently using to verify it.

---

## ✅ Solution: Get a Fresh Token

### Step 1: Check Server Logs for OTP

I've updated the email service to log OTPs to the console. When you register a user, check your server terminal (where `npm run start:dev` is running) for output like:

```
📧 Sending OTP email to: demo@example.com
🔑 OTP Code: 123456
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Step 2: Complete Registration Flow in Postman

#### 2.1 Register a New User

**POST** `http://localhost:5000/auth/register`

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "firstName": "Demo",
  "lastName": "User",
  "email": "demo@example.com",
  "password": "demo123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "message": "User registered successfully. OTP sent to email.",
    "userId": "..."
  }
}
```

#### 2.2 Verify OTP

Check your server terminal for the OTP code, then:

**POST** `http://localhost:5000/auth/verify-otp`

**Body:**
```json
{
  "email": "demo@example.com",
  "token": "123456"
}
```
*(Replace 123456 with the actual OTP from server logs)*

**Response:**
```json
{
  "message": "Email verified successfully"
}
```

#### 2.3 Login to Get JWT Token

**POST** `http://localhost:5000/auth/login`

**Body:**
```json
{
  "email": "demo@example.com",
  "password": "demo123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**✅ COPY THIS TOKEN!**

---

### Step 3: Test Protected Endpoint

**PATCH** `http://localhost:5000/user/me`

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```
*(Replace with your actual token)*

**Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "phoneNum": 1234567890
}
```

**Expected Response:**
```json
{
  "statusCode": 200,
  "success": true,
  "message": "User updated successfully",
  "data": {
    "firstName": "John",
    "lastName": "Doe",
    ...
  }
}
```

---

## 🔧 Using Helper Scripts

I've created two helper scripts:

### get-token.sh
Get a fresh JWT token quickly:

```bash
./get-token.sh demo@example.com demo123
```

This will login and display the token in a copy-friendly format.

### test-auth.sh
Complete authentication flow test:

```bash
./test-auth.sh
```

This will:
1. Login with test credentials
2. Extract the JWT token
3. Test the protected endpoint
4. Show you the results

---

## 🐛 Debugging

### Server Logs

With the enhanced logging, you'll now see:

**When JWT Strategy Initializes:**
```
🔐 JwtStrategy initialized
   Secret: 501e1a8dbf...
   Length: 32
```

**When Request Comes In:**
```
🛡️ JwtAuthGuard - Authorization header: ✅ Present
🔍 JWT Payload received: { sub: '...', role: '...', ... }
✅ User validated: { userId: '...', role: '...' }
userId <actual-user-id>
```

**If There's an Error:**
```
❌ No authorization header found
❌ Invalid authorization header format
❌ Authentication failed: JsonWebTokenError: invalid signature
```

---

## ⚠️ Common Mistakes

### 1. Wrong Port
❌ `http://localhost:3000`  
✅ `http://localhost:5000`

### 2. Wrong Authorization Header Format
❌ `Authorization: eyJhbGc...`  
✅ `Authorization: Bearer eyJhbGc...`

### 3. Using Old Token
❌ Token from before server restart  
✅ Fresh token from recent login

### 4. User Not Verified
❌ Trying to login without verifying OTP  
✅ Verify OTP first, then login

---

## 📝 Quick Reference

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/auth/register` | POST | Create new user |
| `/auth/verify-otp` | POST | Verify email with OTP |
| `/auth/login` | POST | Get JWT token |
| `/user/me` | PATCH | Update user profile (protected) |

---

## 🎯 Next Steps

1. **Check your server terminal** for OTP codes when registering
2. **Complete the verification flow** (register → verify OTP → login)
3. **Use the fresh token** in your protected endpoint requests
4. **Check server logs** for detailed debugging information

The "invalid signature" error will be resolved once you use a token that was created with the current JWT_SECRET!
