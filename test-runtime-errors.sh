#!/bin/bash

# Test runtime errors with CDS 9
echo "=========================================="
echo "CDS 9 Runtime Error Test"
echo "=========================================="
echo ""

# Kill any existing process on port 4004
lsof -ti:4004 | xargs kill -9 2>/dev/null && echo "Killed existing process on port 4004" && sleep 1

# Start server in background
echo "Starting CDS 9 server with handlers..."
npx -y -p @sap/cds@^9.0.0 cds serve > /tmp/cds9-server.log 2>&1 &
SERVER_PID=$!

# Wait for server to start (check for "server listening" message)
echo "Waiting for server (PID: $SERVER_PID)..."
for i in {1..15}; do
    if grep -q "server listening" /tmp/cds9-server.log 2>/dev/null; then
        echo "✅ Server started successfully!"
        break
    fi
    
    if ! kill -0 $SERVER_PID 2>/dev/null; then
        echo ""
        echo "❌ SERVER CRASHED DURING STARTUP!"
        echo ""
        echo "This demonstrates the CDS 9 compatibility issue!"
        echo "The handlers use removed APIs that crash during registration."
        echo ""
        echo "Server log:"
        echo "----------------------------------------"
        cat /tmp/cds9-server.log
        echo "----------------------------------------"
        echo ""
        echo "The crash happens when CDS 9 tries to load the handlers that use:"
        echo "  - srv.impl() (removed in CDS 8)"
        echo "  - srv.with() (removed in CDS 8)"  
        echo "  - req.user.locale (removed in CDS 9)"
        echo "  - req.user.tenant (removed in CDS 9)"
        echo "  - INSERT.as() (removed in CDS 8)"
        echo ""
        echo "See CDS9_CRASH_ANALYSIS.md for detailed analysis"
        exit 1
    fi
    
    if [ $i -eq 15 ]; then
        echo "⚠️  Timeout - server may be hanging"
    fi
    
    sleep 1
done

if ! kill -0 $SERVER_PID 2>/dev/null; then
    exit 1
fi

echo ""

# Try to access endpoints that use broken handlers
echo "Testing /catalog/Books (uses deprecated req.user.locale)..."
RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" http://localhost:4004/catalog/Books 2>&1)
HTTP_CODE=$(echo "$RESPONSE" | grep "HTTP_CODE:" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | grep -v "HTTP_CODE:")

if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ Status: $HTTP_CODE"
    echo "$BODY" | head -5
else
    echo "❌ Status: $HTTP_CODE"
    echo "$BODY" | head -10
fi
echo ""

echo "Testing /catalog/Authors..."
RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" http://localhost:4004/catalog/Authors 2>&1)
HTTP_CODE=$(echo "$RESPONSE" | grep "HTTP_CODE:" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | grep -v "HTTP_CODE:")

if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ Status: $HTTP_CODE"
    echo "$BODY" | head -5
else
    echo "❌ Status: $HTTP_CODE"
    echo "$BODY" | head -10
fi
echo ""

# Check server log for errors
echo "=========================================="
echo "Server Log Analysis:"
echo "=========================================="
echo ""

if grep -qi "error" /tmp/cds9-server.log; then
    echo "❌ Errors found in server log:"
    grep -i "error" /tmp/cds9-server.log
else
    echo "✅ No errors in startup log"
fi
echo ""

if grep -qi "warning\|deprecated" /tmp/cds9-server.log; then
    echo "⚠️  Warnings/Deprecations found:"
    grep -i "warning\|deprecated" /tmp/cds9-server.log
else
    echo "✅ No warnings or deprecations"
fi
echo ""

echo "Full server log saved to: /tmp/cds9-server.log"

# Kill server
kill $SERVER_PID 2>/dev/null || true
wait $SERVER_PID 2>/dev/null || true

echo ""
echo "Server stopped"
