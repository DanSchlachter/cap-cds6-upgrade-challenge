#!/bin/bash

# Test runtime errors with CDS 9
echo "Starting CDS 9 server and testing endpoints..."
echo ""

# Start server in background
npx -y -p @sap/cds@^9.0.0 cds serve > /tmp/cds9-server.log 2>&1 &
SERVER_PID=$!

# Wait for server to start
echo "Waiting for server to start..."
sleep 10

# Test if server is running
if ! kill -0 $SERVER_PID 2>/dev/null; then
    echo "❌ Server failed to start!"
    echo ""
    echo "Server log:"
    cat /tmp/cds9-server.log
    exit 1
fi

echo "✅ Server started (PID: $SERVER_PID)"
echo ""

# Try to access endpoints that use broken handlers
echo "Testing /catalog/Books (uses deprecated req.user.locale)..."
curl -s http://localhost:4004/catalog/Books 2>&1 | head -20
echo ""

echo "Testing /catalog/Authors..."
curl -s http://localhost:4004/catalog/Authors 2>&1 | head -20
echo ""

# Check server log for errors
echo "Server errors:"
grep -i "error\|deprecated\|removed" /tmp/cds9-server.log || echo "No errors in startup"

# Kill server
kill $SERVER_PID 2>/dev/null || true
wait $SERVER_PID 2>/dev/null || true

echo ""
echo "Server stopped"
