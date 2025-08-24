#!/bin/bash

# Quick Start SSL Monitor for Cursor
# This will start monitoring in current terminal and guide you to open a new one

echo "🔒 Quick Start SSL Monitor for Cursor"
echo "====================================="
echo ""

# Check prerequisites
if ! aws sts get-caller-identity &> /dev/null; then
    echo "❌ AWS CLI not configured. Please run 'aws configure' first."
    exit 1
fi

if ! command -v jq &> /dev/null; then
    echo "❌ jq is required but not installed. Please install jq first."
    exit 1
fi

echo "✅ Prerequisites check passed"
echo ""
echo "🚀 Starting SSL monitoring in THIS terminal..."
echo "💡 You should open a NEW terminal tab for development"
echo ""

echo "📱 To open a new terminal tab in Cursor:"
echo "   Press Cmd+Shift+\` (backtick)"
echo ""
echo "🔄 This terminal will now show SSL monitoring progress"
echo "🔔 You'll receive desktop notifications for important events"
echo ""

# Start the monitor in the current terminal
echo "Starting monitor in 3 seconds..."
sleep 3
echo ""
echo "🔒 SSL Certificate Background Monitor Started"
echo "============================================"
echo "Domain: study.pbradygeorgen.com"
echo "Polling every 60 seconds..."
echo "Press Ctrl+C to stop monitoring"
echo ""

# Run the monitor
./monitor-ssl-background.sh
