#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  🧪 SOLUCIONES - TEST SUITE RUNNER"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check if dev server is running
if ! curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo -e "${RED}❌ Development server is not running!${NC}"
    echo -e "${YELLOW}Please start it with: npm run dev${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Development server is running${NC}"
echo ""

# Create directories if they don't exist
mkdir -p test-results
mkdir -p screenshots
mkdir -p playwright-report

# Function to run tests and capture results
run_test_suite() {
    local name=$1
    local command=$2
    
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo -e "${BLUE}🧪 Running: $name${NC}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    
    if $command; then
        echo -e "${GREEN}✅ $name - PASSED${NC}"
        return 0
    else
        echo -e "${RED}❌ $name - FAILED${NC}"
        return 1
    fi
}

# Track results
TOTAL=0
PASSED=0
FAILED=0

# Run Authentication Tests
run_test_suite "Authentication Tests" "npm run test:auth"
TOTAL=$((TOTAL + 1))
if [ $? -eq 0 ]; then PASSED=$((PASSED + 1)); else FAILED=$((FAILED + 1)); fi

# Run Job Flow Tests
run_test_suite "Job Creation Tests" "npm run test:jobs"
TOTAL=$((TOTAL + 1))
if [ $? -eq 0 ]; then PASSED=$((PASSED + 1)); else FAILED=$((FAILED + 1)); fi

# Run Pro Flow Tests
run_test_suite "Professional Features Tests" "npm run test:pro"
TOTAL=$((TOTAL + 1))
if [ $? -eq 0 ]; then PASSED=$((PASSED + 1)); else FAILED=$((FAILED + 1)); fi

# Run Visual Tests
run_test_suite "Visual/Layout Tests" "npm run test:visual"
TOTAL=$((TOTAL + 1))
if [ $? -eq 0 ]; then PASSED=$((PASSED + 1)); else FAILED=$((FAILED + 1)); fi

# Run Error Monitoring Tests
run_test_suite "Error Monitoring Tests" "npm run test:monitoring"
TOTAL=$((TOTAL + 1))
if [ $? -eq 0 ]; then PASSED=$((PASSED + 1)); else FAILED=$((FAILED + 1)); fi

# Print Summary
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  📊 TEST RESULTS SUMMARY"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "Total Test Suites:   $TOTAL"
echo -e "${GREEN}Passed:              $PASSED${NC}"
echo -e "${RED}Failed:              $FAILED${NC}"
echo ""

# Check for error reports
ERROR_REPORTS=$(ls -1 test-results/error-report-*.json 2>/dev/null | wc -l)
if [ $ERROR_REPORTS -gt 0 ]; then
    echo -e "${YELLOW}📝 Generated $ERROR_REPORTS error monitoring reports${NC}"
    echo -e "   Location: test-results/"
fi

# Check for screenshots
SCREENSHOTS=$(ls -1 screenshots/*.png 2>/dev/null | wc -l)
if [ $SCREENSHOTS -gt 0 ]; then
    echo -e "${YELLOW}📸 Generated $SCREENSHOTS screenshots${NC}"
    echo -e "   Location: screenshots/"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Open HTML report
if [ -d "playwright-report" ]; then
    echo -e "${BLUE}📊 Opening test report...${NC}"
    echo ""
    npm run test:report
fi

# Exit with appropriate code
if [ $FAILED -gt 0 ]; then
    exit 1
else
    exit 0
fi
