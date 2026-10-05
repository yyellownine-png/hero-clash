#!/data/data/com.termux/files/usr/bin/bash
set -e
cd "$(dirname "$0")"
python3 -m venv .venv 2>/dev/null || true
. .venv/bin/activate
pip install -q -r backend/requirements.txt
python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000
