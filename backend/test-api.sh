#!/bin/bash

# Test script for Shipforge Backend API
# Make sure the server is running before executing this script

BASE_URL="http://localhost:5000"

echo "==================================="
echo "Shipforge Backend API Test Suite"
echo "==================================="
echo ""

# Test 1: Health Check
echo "Test 1: Health Check"
echo "GET ${BASE_URL}/api/health"
RESPONSE=$(curl -s ${BASE_URL}/api/health)
echo "Response: ${RESPONSE}"
echo ""

# Test 2: Signup
echo "Test 2: User Signup"
echo "POST ${BASE_URL}/api/auth/signup"
RESPONSE=$(curl -s -X POST ${BASE_URL}/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"testuser@example.com","password":"testpass123"}')
echo "Response: ${RESPONSE}"
echo ""

# Test 3: Login
echo "Test 3: User Login"
echo "POST ${BASE_URL}/api/auth/login"
RESPONSE=$(curl -s -X POST ${BASE_URL}/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"testuser@example.com","password":"testpass123"}')
echo "Response: ${RESPONSE}"

# Extract token for next test
TOKEN=$(echo $RESPONSE | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
echo ""

# Test 4: Get Current User (Protected Route)
echo "Test 4: Get Current User (Protected)"
echo "GET ${BASE_URL}/api/auth/me"
echo "Authorization: Bearer <token>"
RESPONSE=$(curl -s -X GET ${BASE_URL}/api/auth/me \
  -H "Authorization: Bearer ${TOKEN}")
echo "Response: ${RESPONSE}"
echo ""

# Test 5: Duplicate Signup (Should Fail)
echo "Test 5: Duplicate Signup (Should Fail)"
echo "POST ${BASE_URL}/api/auth/signup"
RESPONSE=$(curl -s -X POST ${BASE_URL}/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"testuser@example.com","password":"testpass123"}')
echo "Response: ${RESPONSE}"
echo ""

# Test 6: Wrong Password (Should Fail)
echo "Test 6: Login with Wrong Password (Should Fail)"
echo "POST ${BASE_URL}/api/auth/login"
RESPONSE=$(curl -s -X POST ${BASE_URL}/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"testuser@example.com","password":"wrongpassword"}')
echo "Response: ${RESPONSE}"
echo ""

# Test 7: No Token (Should Fail)
echo "Test 7: Access Protected Route without Token (Should Fail)"
echo "GET ${BASE_URL}/api/auth/me"
RESPONSE=$(curl -s -X GET ${BASE_URL}/api/auth/me)
echo "Response: ${RESPONSE}"
echo ""

# Test 8: Invalid Token (Should Fail)
echo "Test 8: Access Protected Route with Invalid Token (Should Fail)"
echo "GET ${BASE_URL}/api/auth/me"
RESPONSE=$(curl -s -X GET ${BASE_URL}/api/auth/me \
  -H "Authorization: Bearer invalid-token-here")
echo "Response: ${RESPONSE}"
echo ""

echo "==================================="
echo "Test Suite Complete!"
echo "==================================="
