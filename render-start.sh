#!/bin/bash
# Start the Python AI microservice in the background
python3 server/ai_agent.py &

# Start the Node.js Express server in the foreground
node server/index.js
