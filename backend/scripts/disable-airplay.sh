#!/bin/bash

# Script to disable macOS AirPlay Receiver (which uses port 5000)
# This allows the backend server to use port 5000

echo "Disabling macOS AirPlay Receiver..."

# Disable AirPlay Receiver
defaults write com.apple.controlcenter.plist AirplayRecieverEnabled -bool false

# Restart ControlCenter to apply changes
killall ControlCenter 2>/dev/null || true

echo "AirPlay Receiver disabled. Port 5000 should now be available."
echo "To re-enable later, run:"
echo "  defaults write com.apple.controlcenter.plist AirplayRecieverEnabled -bool true"
echo "  killall ControlCenter"

