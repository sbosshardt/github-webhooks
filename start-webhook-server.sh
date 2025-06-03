#!/bin/bash

# Exit on any error
set -e

# Change to the script's directory
cd "$(dirname "$0")"

# Run npm install
/usr/bin/npm install

# Start the webhook server
exec /usr/bin/node webhook-server.js
