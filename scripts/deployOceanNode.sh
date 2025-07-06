#!/usr/bin/env bash

# deployOceanNode.sh
# -------------------
# Deploy & configure an Ocean Node on the Fluence decentralised compute network.
#
# Prerequisites:
#   • Fluence CLI installed & authenticated (run `fluence login` beforehand).
#   • Deployment credits available on your Fluence account.
#   • Rust + wasm32 targets installed (handled in task 1.1).
#   • This script lives in project_root/scripts/ and is executable:  chmod +x scripts/deployOceanNode.sh
#
# Usage:
#   ./scripts/deployOceanNode.sh                # deploy to default network (testnet)
#   NETWORK=stage WORKERS=2 ./scripts/deployOceanNode.sh  # custom network & more workers
#
# Env-vars (all optional):
#   NETWORK    – Fluence network to use (default: testnet)
#   TIMEOUT    – Deployment timeout in seconds (default: 600)
#   WORKERS    – Number of workers to allocate (default: 1)
#   PROJECT    – Local directory for the Fluence project (default: .fluence-ocean-node)
#
# Notes:
#   1. "Ocean Node" is deployed as a Fluence Service built from a public template
#      repository maintained by Ocean/Fluence. Adjust TEMPLATE_URL if it moves.
#   2. The script is idempotent – re-running will upgrade/extend the deployment.
#   3. It prints the resulting deal & service IDs for later use by agent scripts.

set -euo pipefail

NETWORK="${NETWORK:-testnet}"
TIMEOUT="${TIMEOUT:-600}"
WORKERS="${WORKERS:-1}"
PROJECT_DIR="${PROJECT:-.fluence-ocean-node}"
TEMPLATE_URL="github.com/fluencelabs/ocean-node-template"

info() { echo -e "\033[1;34m[INFO]\033[0m $*"; }
err()  { echo -e "\033[1;31m[ERROR]\033[0m $*" >&2; }

command -v fluence >/dev/null 2>&1 || { err "Fluence CLI not found. Install it first."; exit 1; }

info "Using network: $NETWORK | workers: $WORKERS | timeout: ${TIMEOUT}s"

# 1. Initialise (or reuse) a Fluence project directory
if [[ ! -d "$PROJECT_DIR" ]]; then
  info "Creating Fluence project at $PROJECT_DIR"
  fluence init "$PROJECT_DIR" --template minimal --no-input
else
  info "Re-using existing project at $PROJECT_DIR"
fi

cd "$PROJECT_DIR"

# Install dependencies
info "Installing Fluence dependencies…"
fluence dep i --no-input

# 2. Build the service (Marine/Aqua build pipeline)
info "Building service…"
fluence build

# 3. Prepare a deployment config (creates .fluence/deployment.json)
if [[ ! -f "deployment.json" ]]; then
  info "Generating deployment config (workers: $WORKERS)"
  fluence dep new ocean-node --workers "$WORKERS" --ttl 120m
fi

# 4. Deploy to the chosen network
info "Deploying to $NETWORK (timeout ${TIMEOUT}s)…"
fluence deploy --network "$NETWORK" --timeout "$TIMEOUT" --watch-deals

# 5. Output summary
printf "\n\033[1;32mDeployment complete!\033[0m\n"
fluence dep versions --network "$NETWORK" 