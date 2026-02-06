#!/bin/bash

# Simple Quick Test - Shows if compilation succeeds or fails
# Usage: ./quick-test.sh [version]
# Example: ./quick-test.sh 7  or  ./quick-test.sh 8  or  ./quick-test.sh 9

VERSION=${1:-9}

echo "Testing CDS $VERSION compilation..."
echo ""

case $VERSION in
    7)
        npx -y -p @sap/cds@^7.0.0 cds compile srv > /dev/null 2>&1
        ;;
    8)
        npx -y -p @sap/cds@^8.0.0 cds compile srv > /dev/null 2>&1
        ;;
    9)
        npx -y -p @sap/cds@^9.0.0 cds compile srv > /dev/null 2>&1
        ;;
    *)
        echo "Invalid version. Use: 7, 8, or 9"
        echo "Example: ./quick-test.sh 9"
        exit 1
        ;;
esac

if [ $? -eq 0 ]; then
    echo "✅ CDS $VERSION: Compilation successful"
else
    echo "❌ CDS $VERSION: Compilation failed"
    echo ""
    echo "Run for detailed output:"
    echo "  npm run compile:cds$VERSION"
fi
