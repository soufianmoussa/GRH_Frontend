#!/usr/bin/env bash
# ============================================================================
#  Run the SIRH onboarding E2E suite (Linux / macOS).
#
#  Usage:
#    ./run-tests.sh                                  # run ALL tests
#    ./run-tests.sh tests/onboarding_agent_e2e.robot # run one file
#
#  Set secrets via environment variables BEFORE running, e.g.:
#    export E2E_BASE_URL=http://localhost:4200
#    export E2E_ACTIVATION_TOKEN=your-fresh-token
#    export E2E_AGENT_USERNAME=agent.test
#    export E2E_AGENT_PASSWORD='YourPassw0rd!'
#    export E2E_HEADLESS=true
# ============================================================================
set -euo pipefail
cd "$(dirname "$0")"

TARGET="${*:-tests}"

robot --outputdir results --loglevel INFO ${TARGET}

echo
echo "Reports:"
echo "  results/report.html"
echo "  results/log.html"
