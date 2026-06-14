*** Settings ***
Documentation     ADMIN-side validation flow.
...
...               An administrator opens the onboarding dashboard, finds a submitted
...               agent, reviews uploaded documents, validates the dossier, and then
...               the agent should gain access to the normal agent space.
...
...               PREREQUISITE: an agent dossier already in "PENDING_VALIDATION"
...               (run onboarding_agent_e2e.robot first, or seed one).
...               Provide the agent search term via:
...                 -v AGENT_SEARCH:<name|matricule|email>

Resource          ../resources/keywords.robot
Suite Setup       Open Browser To App
Suite Teardown    Close Browser Session
Test Setup        Set Screenshot Directory    ${SCREENSHOT_DIR}

*** Variables ***
${AGENT_SEARCH}    %{E2E_AGENT_SEARCH=Bennani}

*** Test Cases ***
Admin Validates A Submitted Onboarding
    [Documentation]    Login as admin -> find submitted agent -> review documents
    ...                -> validate -> status becomes "Validé".
    [Tags]    admin    validation

    Login As Admin
    Open Admin Onboarding Dashboard
    Search Onboarding For Agent    ${AGENT_SEARCH}
    Open First Onboarding Details

    # Reviewer must be able to see the uploaded pieces
    Verify Uploaded Documents Are Visible

    # Validate and confirm the status flips to validated
    Validate Onboarding
    Verify Onboarding Status Is    Valid

Validated Agent Reaches Normal Agent Space
    [Documentation]    After validation, the agent logging in should land on an
    ...                active space (dossier no longer "en cours" / wizard locked).
    [Tags]    admin    validation    agent-access
    Login As Agent
    Go To    ${DASHBOARD_URL}
    Wait Until Page Contains Element    css=.hub-host    timeout=${SELENIUM_TIMEOUT}
    # A validated/active dossier shows the success banner.
    Run Keyword And Continue On Failure
    ...    Wait Until Page Contains    valide    timeout=10 s
