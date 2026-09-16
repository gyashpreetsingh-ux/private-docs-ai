#!/usr/bin/env bash
# Bash Dev Server Runner for Private Docs AI
set -e

echo "Starting PRIVATE DOCS AI Development Stack..."

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

# Start Backend
cd "$ROOT_DIR/backend"
source .venv/bin/activate || source venv/bin/activate
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000 &
BACKEND_PID=$!
echo "[+] Backend launched at http://127.0.0.1:8000 (PID: $BACKEND_PID)"

# Start Frontend
cd "$ROOT_DIR/frontend"
echo "[+] Starting Frontend at http://localhost:5174"
npm run dev

kill $BACKEND_PID
