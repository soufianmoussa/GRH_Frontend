*** Settings ***
Documentation     REGRESSION suite for known/observed onboarding bugs.
...
...               Each test maps to ONE reported defect. A passing test means the
...               bug is fixed; a failing test reproduces it. Keep these even after
...               fixes to guard against re-introduction.

Resource          ../resources/keywords.robot
Suite Setup       Open Browser To App
Suite Teardown    Close Browser Session
Test Setup        Set Screenshot Directory    ${SCREENSHOT_DIR}

*** Test Cases ***
BUG Situation Familiale Persists After Relogin
    [Documentation]    Bug: "situation familiale is not saved after relogin".
    ...                Set situation on Step 2, save, relogin, expect it preserved.
    [Tags]    regression    persistence
    Login As Agent
    Open Onboarding Wizard
    Fill Family Situation Step    situation=Divorcé(e)    nb_enfants=2
    Save Current Step
    Logout
    Login As Agent
    Open Onboarding Wizard
    Go To Wizard Step    Identit
    # The p-select should still display the previously chosen label
    Wait Until Page Contains    Divorc    timeout=${SELENIUM_TIMEOUT}

BUG Nombre Enfants Persists After Relogin
    [Documentation]    Bug: "nombre d'enfants is not saved after relogin".
    [Tags]    regression    persistence
    Login As Agent
    Open Onboarding Wizard
    Fill Family Situation Step    situation=Divorcé(e)    nb_enfants=3
    Save Current Step
    Logout
    Login As Agent
    Open Onboarding Wizard
    Go To Wizard Step    Identit
    ${nb}=    Get Value    ${SEL_CHILDREN_NUMBER}
    Should Be Equal As Integers    ${nb}    3
    ...    msg=REGRESSION: nombre d'enfants reset after relogin (got ${nb})

BUG Children Forms Survive A Refresh
    [Documentation]    Bug: "children forms disappear after refresh".
    ...                After saving, reloading the page must still render the child forms.
    [Tags]    regression    children
    Login As Agent
    Open Onboarding Wizard
    Fill Family Situation Step    situation=Divorcé(e)    nb_enfants=2
    Save Current Step
    Reload Page
    Wait Until Page Contains Element    css=.wizard-host    timeout=${SELENIUM_TIMEOUT}
    Verify Children Form Count    2

BUG Dashboard Voir Button Opens Correct Step
    [Documentation]    Bug: "dashboard 'Voir' button redirects to wrong step".
    ...                Each journey card on the hub must route into the wizard
    ...                (mon-onboarding/wizard), not an unrelated/legacy route.
    [Tags]    regression    navigation
    Login As Agent
    Go To    ${DASHBOARD_URL}
    Wait Until Page Contains Element    css=.journey-card    timeout=${SELENIUM_TIMEOUT}
    Click Element    xpath=(//a[contains(@class,'journey-card')])[1]
    Wait Until Location Contains    mon-onboarding/wizard    timeout=${SELENIUM_TIMEOUT}
    Page Should Contain Element    css=.wizard-stepper

BUG Saving Documents Multiple Times Does Not Duplicate
    [Documentation]    Bug: "saving documents multiple times duplicates files in MinIO/UI".
    ...                Re-uploading + saving the same doc must keep a single UI entry.
    [Tags]    regression    documents
    Login As Agent
    Open Onboarding Wizard
    Upload Single Document Repeatedly    times=3    file=${RIB_FILE}
    Verify No Duplicate Document Shown

BUG Assigned Poste Applied After Validation
    [Documentation]    Bug: "after admin validation, assigned poste from invitation
    ...                is not applied". After validation the admin detail must show
    ...                an active affectation with the invitation's poste.
    [Tags]    regression    admin    poste
    Login As Admin
    Open Admin Onboarding Dashboard
    Search Onboarding For Agent    Bennani
    Open First Onboarding Details
    # The hero shows a green "Affecte : <poste>" tag once the poste is applied.
    Wait Until Page Contains    Affect    timeout=${SELENIUM_TIMEOUT}
    ${tag}=    Get Text    xpath=//p-tag[contains(.,'Affect')]
    Should Not Contain    ${tag}    poste)
    ...    msg=REGRESSION: affectation shows placeholder 'poste' - invitation poste not applied

BUG No Sidemenu Flash After Activation
    [Documentation]    Bug: "after account activation, agent sidemenu appears for a
    ...                split second before the onboarding flow".
    ...                Immediately after activation the layout should route to the
    ...                onboarding hub/wizard and NOT show the standard agent sidemenu.
    [Tags]    regression    activation    layout
    Open Onboarding Activation Page
    Activate Agent Account    ${TEST_PASSWORD}
    Confirm Account Activation
    Verify Redirected To Onboarding Dashboard
    # The full app sidebar/menu should not be present on the onboarding layout.
    Page Should Not Contain Element    css=app-sidebar, .layout-sidebar, .app-sidemenu
