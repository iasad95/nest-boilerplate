#!/usr/bin/env bash
set -e

TARGET=$1
HOST=$(echo "$TARGET" | cut -d: -f1)
PORT=$(echo "$TARGET" | cut -d: -f2)
TIMEOUT=${TIMEOUT:-60}

echo "Waiting for $HOST:$PORT..."
for i in $(seq 1 "$TIMEOUT"); do
  if nc -z "$HOST" "$PORT"; then
    echo "$HOST:$PORT is available."
    exit 0
  fi
  sleep 1
done

echo "Timeout waiting for $HOST:$PORT"
exit 1
