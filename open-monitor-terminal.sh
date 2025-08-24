#!/bin/bash

# Script to open a new Terminal window and run SSL monitoring
# This will open a dedicated terminal window for the monitoring process

# Get the current directory
CURRENT_DIR=$(pwd)

echo "🔒 Opening new Terminal window for SSL monitoring..."
echo "This will open Terminal.app with the monitoring script running"
echo ""

# Check if we're on macOS
if [[ "$OSTYPE" != "darwin"* ]]; then
    echo "❌ This script is designed for macOS Terminal.app"
    echo "Please run './start-ssl-monitor.sh' in a new terminal window manually"
    exit 1
fi

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
echo "🚀 Opening new Terminal window..."

# Open new Terminal window and run the monitor
osascript <<EOF
tell application "Terminal"
    do script "cd '$CURRENT_DIR' && echo '🔒 SSL Certificate Background Monitor' && echo 'Domain: study.pbradygeorgen.com' && echo 'This terminal will show real-time SSL validation progress' && echo 'Press Ctrl+C to stop monitoring' && echo '' && ./monitor-ssl-background.sh"
    set custom title of front window to "SSL Monitor - study.pbradygeorgen.com"
    activate
end tell
EOF

echo "✅ New Terminal window opened!"
echo "📱 The monitoring script is now running in a dedicated window"
echo "🔔 You'll receive desktop notifications for important events"
echo ""
echo "💡 Keep that terminal window visible to see real-time progress"
echo "🛑 Use Ctrl+C in the monitoring terminal to stop when done"
