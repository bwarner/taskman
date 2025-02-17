#!/bin/bash

echo "🚀 Starting Redis Cluster Setup..."

# Define Redis nodes
NODES=("redis-node-1" "redis-node-2" "redis-node-3" "redis-node-4" "redis-node-5")

# Wait until all nodes respond to `ping`
echo "⏳ Waiting for Redis nodes to be ready..."
while true; do
  all_ready=true
  for node in "${NODES[@]}"; do
    if ! redis-cli -h "$node" -a "$REDIS_PASSWORD" ping 2>/dev/null | grep -q "PONG"; then
      all_ready=false
      break  # Exit loop early if any node is not ready
    fi
  done

  if [ "$all_ready" = true ]; then
    echo "✅ All Redis nodes are ready!"
    break
  fi

  sleep 1
done

# Check cluster status
echo "🔎 Checking if Redis Cluster is already formed..."
if redis-cli --cluster check redis-node-1:6379 -a "$REDIS_PASSWORD" | grep -q "OK"; then
  echo "✅ Redis Cluster is already set up!"
else
  echo "⚠️ Redis Cluster not detected. Forming a new cluster..."
  
  # Attempt to create the Redis Cluster
  redis-cli --cluster create \
    redis-node-0:6379 redis-node-1:6379 redis-node-2:6379 \
    redis-node-3:6379 redis-node-4:6379 redis-node-5:6379 \
    --cluster-replicas 1 -a "$REDIS_PASSWORD" --cluster-yes
fi

# Start Redis normally
echo "🚀 Starting Redis server..."

exec /opt/bitnami/scripts/redis-cluster/run.sh
