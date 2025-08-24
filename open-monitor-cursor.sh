#!/bin/bash

# Script to open a new Cursor terminal tab and run SSL monitoring
# This will open a new terminal tab within Cursor for the monitoring process

echo "🔒 Opening new Cursor terminal tab for SSL monitoring..."
echo "This will create a new terminal tab within Cursor"
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
echo ""
echo "🚀 To start SSL monitoring in a new Cursor terminal tab:"
echo ""
echo "1. Press Cmd+Shift+` (backtick) to open a new terminal tab"
echo "2. In the new tab, run: ./start-ssl-monitor.sh"
echo ""
echo "💡 Or manually run: ./monitor-ssl-background.sh"
echo ""
echo "🔔 You'll receive desktop notifications for important events"
echo "🛑 Use Ctrl+C in the monitoring terminal to stop when done"
echo ""
echo "📱 The monitoring will run in the background and show real-time progress"
