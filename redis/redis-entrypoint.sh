#!/bin/bash
set -e  # Exit immediately if a command fails

echo "🚀 Starting Redis..."

# Run Redis in the foreground
exec redis-server /etc/redis/redis.conf
