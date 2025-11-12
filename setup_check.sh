#!/bin/bash
# setup_check.sh - Verify Study Agent setup

set -e

echo "================================"
echo "Study Agent Setup Verification"
echo "================================"
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Counters
checks_passed=0
checks_failed=0

check_command() {
    if command -v $1 &> /dev/null; then
        echo -e "${GREEN}✓${NC} $1 is installed"
        ((checks_passed++))
    else
        echo -e "${RED}✗${NC} $1 is not installed"
        ((checks_failed++))
    fi
}

check_python_package() {
    if python -c "import $1" 2>/dev/null; then
        echo -e "${GREEN}✓${NC} Python package '$1' is available"
        ((checks_passed++))
    else
        echo -e "${RED}✗${NC} Python package '$1' is missing"
        ((checks_failed++))
    fi
}

echo "Checking System Requirements..."
check_command "python3"
check_command "node"
check_command "npm"

echo ""
echo "Checking Backend Virtual Environment..."
if [ -d "backend/.venv" ]; then
    echo -e "${GREEN}✓${NC} Virtual environment exists at backend/.venv"
    ((checks_passed++))
else
    echo -e "${RED}✗${NC} Virtual environment not found. Run: cd backend && python -m venv .venv"
    ((checks_failed++))
fi

echo ""
echo "Checking Backend Dependencies..."
cd backend 2>/dev/null || { echo "backend/ directory not found"; exit 1; }

# Source venv if it exists
if [ -f ".venv/bin/activate" ]; then
    source .venv/bin/activate
    
    check_python_package "fastapi"
    check_python_package "langchain"
    check_python_package "google"
    check_python_package "pydantic"
    check_python_package "faiss"
fi

cd ..

echo ""
echo "Checking Configuration Files..."
if [ -f "backend/.env" ]; then
    echo -e "${GREEN}✓${NC} backend/.env exists"
    ((checks_passed++))
else
    echo -e "${YELLOW}⚠${NC} backend/.env not found. Copy from .env.example and add API keys"
fi

if [ -f ".env.example" ]; then
    echo -e "${GREEN}✓${NC} .env.example template found"
    ((checks_passed++))
else
    echo -e "${RED}✗${NC} .env.example template not found"
    ((checks_failed++))
fi

if [ -f ".gitignore" ]; then
    echo -e "${GREEN}✓${NC} .gitignore exists"
    ((checks_passed++))
else
    echo -e "${YELLOW}⚠${NC} .gitignore not found"
fi

echo ""
echo "Checking Frontend..."
if [ -f "frontend/package.json" ]; then
    echo -e "${GREEN}✓${NC} frontend/package.json exists"
    ((checks_passed++))
else
    echo -e "${RED}✗${NC} frontend/package.json not found"
    ((checks_failed++))
fi

if [ -d "frontend/node_modules" ]; then
    echo -e "${GREEN}✓${NC} frontend dependencies installed"
    ((checks_passed++))
else
    echo -e "${YELLOW}⚠${NC} frontend/node_modules not found. Run: cd frontend && npm install"
fi

echo ""
echo "================================"
echo -e "Results: ${GREEN}$checks_passed passed${NC}, ${RED}$checks_failed failed${NC}"
echo "================================"
echo ""

if [ $checks_failed -eq 0 ]; then
    echo -e "${GREEN}✓ All checks passed! You're ready to go.${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Configure API keys: edit backend/.env and add GOOGLE_API_KEY or OPENAI_API_KEY"
    echo "2. Start backend: cd backend && source .venv/bin/activate && uvicorn main:app --reload"
    echo "3. Start frontend: cd frontend && npm run dev"
else
    echo -e "${RED}✗ Some checks failed. Please fix the issues above.${NC}"
fi
