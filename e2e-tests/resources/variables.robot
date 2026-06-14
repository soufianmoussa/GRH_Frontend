*** Settings ***
Documentation     Centralised, reusable variables for the SIRH onboarding E2E suite.
...               NOTHING SECRET should be hardcoded here. Tokens, passwords and
...               credentials are read from environment variables when provided,
...               and fall back to harmless local-dev defaults otherwise.
...
...               Override any value at run time, e.g.:
...                 robot -v BASE_URL:http://localhost:4200 -v ACTIVATION_TOKEN:%{ONBOARDING_TOKEN} tests/
...               or via environment variables (see resources below).

Library           OperatingSystem
Library           Collections

*** Variables ***
# -----------------------------------------------------------------------------
# Application under test
# -----------------------------------------------------------------------------
# Angular dev server default is http://localhost:4200 (ng serve).
${BASE_URL}             %{E2E_BASE_URL=http://localhost:4200}
${BROWSER}              %{E2E_BROWSER=chrome}
${HEADLESS}             %{E2E_HEADLESS=false}
${SELENIUM_TIMEOUT}     20 s
${SELENIUM_SPEED}       0 s

# -----------------------------------------------------------------------------
# Activation link / token
# -----------------------------------------------------------------------------
# NEVER commit a real token. Provide it at run time:
#   - via env var:  set E2E_ACTIVATION_TOKEN=xxxxx   (Windows)
#                   export E2E_ACTIVATION_TOKEN=xxxxx (Linux/Mac)
#   - or CLI:       robot -v ACTIVATION_TOKEN:xxxxx tests/onboarding_agent_e2e.robot
${ACTIVATION_TOKEN}     %{E2E_ACTIVATION_TOKEN=REPLACE_WITH_A_FRESH_TOKEN}
${INVALID_TOKEN}        this-token-does-not-exist-000000

# The real app route is  /activation?token=...
${ACTIVATION_URL}       ${BASE_URL}/activation?token=${ACTIVATION_TOKEN}
${INVALID_ACTIVATION_URL}   ${BASE_URL}/activation?token=${INVALID_TOKEN}

# Canonical onboarding routes (see onboarding.routes.ts)
${LOGIN_URL}            ${BASE_URL}/login
${DASHBOARD_URL}        ${BASE_URL}/mon-onboarding
${WIZARD_URL}           ${BASE_URL}/mon-onboarding/wizard
${ADMIN_ONBOARDING_URL}     ${BASE_URL}/admin/onboarding

# -----------------------------------------------------------------------------
# Credentials (read from env; dev defaults are placeholders only)
# -----------------------------------------------------------------------------
# Password chosen on the activation screen. Policy: minimum 12 characters.
${TEST_PASSWORD}        %{E2E_TEST_PASSWORD=Passw0rd!Test2026}
${WEAK_PASSWORD}        123

# Agent login (the username is usually the matricule or email created by admin).
${AGENT_USERNAME}       %{E2E_AGENT_USERNAME=agent.test}
${AGENT_PASSWORD}       %{E2E_AGENT_PASSWORD=${TEST_PASSWORD}}

# Admin login used by the admin-validation suite.
${ADMIN_USERNAME}       %{E2E_ADMIN_USERNAME=admin}
${ADMIN_PASSWORD}       %{E2E_ADMIN_PASSWORD=admin}

# -----------------------------------------------------------------------------
# Test agent data (used to fill the wizard). Situation 'Divorcé(e)' keeps the
# children section visible WITHOUT requiring a conjoint, which keeps the happy
# path focused on the children-persistence bugs.
# -----------------------------------------------------------------------------
&{TEST_AGENT_DATA}
...    nom=Bennani
...    prenom=Yassine
...    cin=AB123456
...    sexe=Masculin
...    situation=Divorcé(e)
...    date_naissance=15/05/1990
...    nb_enfants=2
...    adresse=12 Rue des Fleurs, Quartier Test
...    code_postal=20000
...    ville=Casablanca
...    pays=Maroc
...    telephone=+212612345678
...    banque=Banque Populaire
...    rib=123456789012345678901234

# Two children rendered on Step 3 (Coordonnées & famille)
&{CHILD_1}    nom=Bennani    prenom=Lina     sexe=Féminin     niveau=Primaire
&{CHILD_2}    nom=Bennani    prenom=Adam     sexe=Masculin    niveau=Maternelle

# -----------------------------------------------------------------------------
# Test files (live in e2e-tests/files/). Resolved to absolute paths in keywords.
# -----------------------------------------------------------------------------
${FILES_DIR}            ${CURDIR}${/}..${/}files
${TEST_FILE_PATH}       ${FILES_DIR}${/}sample-document.pdf
${CIN_FILE}             ${FILES_DIR}${/}sample-cin.pdf
${RIB_FILE}             ${FILES_DIR}${/}sample-rib.pdf
${DIPLOME_FILE}         ${FILES_DIR}${/}sample-diplome.pdf
${PHOTO_FILE}           ${FILES_DIR}${/}sample-photo.png
${IMAGE_FILE}           ${FILES_DIR}${/}sample-image.jpg
${UNSUPPORTED_FILE}     ${FILES_DIR}${/}unsupported-file.txt

# -----------------------------------------------------------------------------
# Output
# -----------------------------------------------------------------------------
${SCREENSHOT_DIR}       ${CURDIR}${/}..${/}results${/}screenshots
