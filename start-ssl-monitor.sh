#!/bin/bash

# Launcher script for SSL Certificate Background Monitor
# Run this in a new terminal window to start monitoring

echo "🔒 Starting SSL Certificate Background Monitor..."
echo "This will run in the background and show desktop notifications"
echo "Domain: study.pbradygeorgen.com"
echo "Press Ctrl+C to stop monitoring"
echo ""

# Check if AWS CLI is configured
if ! aws sts get-caller-identity &> /dev/null; then
    echo "❌ AWS CLI not configured. Please run 'aws configure' first."
    exit 1
fi

# Check if jq is installed
if ! command -v jq &> /dev/null; then
    echo "❌ jq is required but not installed. Please install jq first."
    exit 1
fi

echo "✅ Prerequisites check passed"
echo "🚀 Starting monitor..."
echo ""

# Run the background monitor
./monitor-ssl-background.sh
