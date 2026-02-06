#!/bin/bash

# Test CDS 6, 7, 8, 9 compilation
# This script shows the differences in compilation across CDS versions

echo "=========================================="
echo "CAP CDS Version Compatibility Test"
echo "=========================================="
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test CDS 6 (current version)
echo -e "${GREEN}Testing CDS 6 (current version)...${NC}"
echo "Command: npx cds compile srv"
npx cds compile srv > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ CDS 6: Compilation successful${NC}"
else
    echo -e "${RED}❌ CDS 6: Compilation failed${NC}"
fi
echo ""

# Test CDS 7
echo -e "${YELLOW}Testing CDS 7...${NC}"
echo "Command: npx -y -p @sap/cds@^7.0.0 cds compile srv"
npx -y -p @sap/cds@^7.0.0 cds compile srv > /tmp/cds7-output.txt 2>&1
if [ $? -eq 0 ]; then
    echo -e "${YELLOW}⚠️  CDS 7: Compilation successful (may have warnings)${NC}"
    if grep -q "deprecat\|warning" /tmp/cds7-output.txt; then
        echo "   Found deprecation warnings - check /tmp/cds7-output.txt"
    fi
else
    echo -e "${RED}❌ CDS 7: Compilation failed${NC}"
    echo "   First error:"
    head -20 /tmp/cds7-output.txt | tail -10
fi
echo ""

# Test CDS 8
echo -e "${YELLOW}Testing CDS 8...${NC}"
echo "Command: npx -y -p @sap/cds@^8.0.0 cds compile srv"
npx -y -p @sap/cds@^8.0.0 cds compile srv > /tmp/cds8-output.txt 2>&1
if [ $? -eq 0 ]; then
    echo -e "${YELLOW}⚠️  CDS 8: Compilation successful (may have warnings)${NC}"
    if grep -q "deprecat\|warning" /tmp/cds8-output.txt; then
        echo "   Found deprecation warnings - check /tmp/cds8-output.txt"
    fi
else
    echo -e "${RED}❌ CDS 8: Compilation failed${NC}"
    echo "   First error:"
    head -20 /tmp/cds8-output.txt | tail -10
fi
echo ""

# Test CDS 9
echo -e "${YELLOW}Testing CDS 9...${NC}"
echo "Command: npx -y -p @sap/cds@^9.0.0 cds compile srv"
npx -y -p @sap/cds@^9.0.0 cds compile srv > /tmp/cds9-output.txt 2>&1
if [ $? -eq 0 ]; then
    echo -e "${YELLOW}⚠️  CDS 9: Compilation successful (may have warnings)${NC}"
    if grep -q "deprecat\|warning" /tmp/cds9-output.txt; then
        echo "   Found deprecation warnings - check /tmp/cds9-output.txt"
    fi
else
    echo -e "${RED}❌ CDS 9: Compilation failed${NC}"
    echo "   First error:"
    head -20 /tmp/cds9-output.txt | tail -10
fi
echo ""

# Summary
echo "=========================================="
echo "Summary"
echo "=========================================="
echo ""
echo "Full output saved to:"
echo "  - /tmp/cds7-output.txt"
echo "  - /tmp/cds8-output.txt"
echo "  - /tmp/cds9-output.txt"
echo ""
echo "To view detailed output:"
echo "  cat /tmp/cds7-output.txt"
echo "  cat /tmp/cds8-output.txt"
echo "  cat /tmp/cds9-output.txt"
echo ""
echo "To test the application with specific versions:"
echo "  npm run test:cds7"
echo "  npm run test:cds8"
echo "  npm run test:cds9"
echo ""
echo "See TEST_UPGRADES.md for more details."
