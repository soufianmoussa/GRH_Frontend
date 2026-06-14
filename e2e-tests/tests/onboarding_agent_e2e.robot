*** Settings ***
Documentation     END-TO-END happy path for a NEW agent completing onboarding.
...
...               This simulates a real agent who receives an activation link,
...               sets a password, fills the multi-step wizard, uploads documents,
...               re-logs in to prove persistence, and submits the dossier.
...
...               REALITY NOTE (verified against the Angular source):
...                 - The wizard has 5 steps: Administratif (read-only), Identité,
...                   Coordonnées & famille, Études & formations, Récapitulatif.
...                 - "Situation familiale" + "Nombre d'enfants" are on Step 2 (Identité).
...                 - Child forms render on Step 3 (Coordonnées) from the children count.
...                 - There is NO single "documents step": uploads are inline
...                   (CIN on Step 2, RIB on Step 3).
...
...               PREREQUISITES (provided at run time, never committed):
...                 -v ACTIVATION_TOKEN:<fresh token from an admin invitation>
...                 -v AGENT_USERNAME:<agent login>  -v AGENT_PASSWORD:<password>

Resource          ../resources/keywords.robot
Suite Setup       Open Browser To App
Suite Teardown    Close Browser Session
Test Setup        Set Screenshot Directory    ${SCREENSHOT_DIR}

*** Test Cases ***
Agent Completes Onboarding Successfully
    [Documentation]    Full golden path: activate -> fill wizard -> upload -> relogin
    ...                -> verify persistence -> submit -> status "en attente de validation".
    [Tags]    e2e    smoke    happy-path

    # --- 1. Activate the account from the invitation link ---------------------
    Open Onboarding Activation Page
    Activate Agent Account    ${TEST_PASSWORD}
    Confirm Account Activation
    Verify Redirected To Onboarding Dashboard

    # --- 2. Identité (personal info + family situation live on Step 2) --------
    Open Onboarding Wizard
    Fill Personal Information Step
    Fill Family Situation Step    situation=Divorcé(e)    nb_enfants=2
    Upload Required Documents
    Save Current Step

    # --- 3. Verify exactly 2 child forms appear on Step 3 ---------------------
    Verify Children Form Count    2

    # --- 4. Coordonnées + fill both child forms, then save -------------------
    Fill Contact And Address Step
    Fill Children Forms Dynamically    ${CHILD_1}    ${CHILD_2}
    Save Current Step

    # --- 5. Logout and log back in as the same agent -------------------------
    Logout
    Login As Agent

    # --- 6. Persistence check (situation + children survive a relogin) -------
    Verify Saved Data Still Exists    expected_children=2

    # --- 7. Documents: save several times, assert no duplicate ---------------
    Upload Single Document Repeatedly    times=3    file=${RIB_FILE}
    Verify No Duplicate Document Shown

    # --- 8. Submit and verify the status changed ----------------------------
    Submit Onboarding
    Verify Success Message
