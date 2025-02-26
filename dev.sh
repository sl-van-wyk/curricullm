#!/bin/bash

# Colors for terminal output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Starting development environment...${NC}"

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo -e "${GREEN}Supabase CLI not found. Please install it with:${NC}"
    echo "npm install -g supabase"
    exit 1
fi

# Start Supabase in the background
echo -e "${GREEN}Starting Supabase local development...${NC}"
supabase start &
SUPABASE_PID=$!

# Function to handle script exit
cleanup() {
    echo -e "${GREEN}Shutting down services...${NC}"
    
    # Kill the npm process if it's running
    if [ -n "$NPM_PID" ]; then
        kill $NPM_PID 2>/dev/null
    fi
    
    # Stop Supabase
    supabase stop
    
    echo -e "${GREEN}Development environment stopped.${NC}"
    exit 0
}

# Set up trap to catch script termination
trap cleanup SIGINT SIGTERM

# Wait a moment for Supabase to initialize
sleep 3

# Start Next.js development server
echo -e "${GREEN}Starting Next.js development server...${NC}"
npm run dev &
NPM_PID=$!

echo -e "${BLUE}Development environment is running!${NC}"
echo -e "${BLUE}Press Ctrl+C to stop all services.${NC}"

# Wait for any process to exit
wait $NPM_PID
cleanup 