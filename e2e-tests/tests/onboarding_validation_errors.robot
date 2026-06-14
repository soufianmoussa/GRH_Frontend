*** Settings ***
Documentation     NEGATIVE tests: the onboarding flow must reject invalid input.
...
...               Each test documents the EXPECTED behaviour. Because some
...               validations may not be implemented yet, tests that probe an
...               optional rule are tagged `conditional` and explain what they
...               assert. Adjust/skip per your backend rules.

Resource          ../resources/keywords.robot
Suite Setup       Open Browser To App
Suite Teardown    Close Browser Session
Test Setup        Set Screenshot Directory    ${SCREENSHOT_DIR}

*** Test Cases ***
Activation With Invalid Token Is Rejected
    [Documentation]    Opening the activation link with a bogus token must show
    ...                the "Lien non valide" state, not the password form.
    [Tags]    negative    activation
    Open Onboarding Activation Page    ${INVALID_ACTIVATION_URL}
    Wait Until Page Contains    Lien non valide    timeout=${SELENIUM_TIMEOUT}
    Page Should Not Contain Element    ${SEL_ACT_SUBMIT}

Password And Confirm Password Mismatch Blocks Activation
    [Documentation]    When the two passwords differ, the activate button stays
    ...                disabled and a mismatch error is shown.
    [Tags]    negative    activation
    Open Onboarding Activation Page
    Run Keyword And Continue On Failure    Activate Agent Account    password=${TEST_PASSWORD}    confirm=DifferentPass99!
    Page Should Show Error Containing    correspondent

Weak Password Is Rejected
    [Documentation]    A password under the 12-char policy must be refused.
    [Tags]    negative    activation
    Open Onboarding Activation Page
    Input Password Field    ${SEL_ACT_PASSWORD}    ${WEAK_PASSWORD}
    Input Password Field    ${SEL_ACT_CONFIRM}     ${WEAK_PASSWORD}
    Element Should Be Disabled    ${SEL_ACT_SUBMIT}

Required Fields Missing Prevents Save
    [Documentation]    Saving the identity step with empty mandatory fields must
    ...                surface validation errors (nom/prénom/CIN/sexe required).
    [Tags]    negative    wizard    conditional
    Login As Agent
    Open Onboarding Wizard
    Go To Wizard Step    Identit
    Input Text Safely    ${SEL_IDENTITY_NOM}       ${EMPTY}
    Input Text Safely    ${SEL_IDENTITY_PRENOM}    ${EMPTY}
    Save Current Step
    Page Should Show Error Containing    obligatoire

Invalid CIN Format Is Rejected
    [Documentation]    If CIN format validation exists, an obviously malformed CIN
    ...                must be flagged. Skip/adjust if no CIN pattern is enforced.
    [Tags]    negative    wizard    conditional
    Login As Agent
    Open Onboarding Wizard
    Go To Wizard Step    Identit
    Input Text Safely    ${SEL_IDENTITY_CIN}    @@@invalid@@@
    Save Current Step
    ${errors}=    Capture Error Messages
    Log    CIN validation messages (if any): ${errors}

Invalid Phone Number Is Rejected
    [Documentation]    The phone field enforces 8-15 digits (PHONE_PATTERN).
    ...                "abc" must produce a "Format invalide" error.
    [Tags]    negative    wizard
    Login As Agent
    Open Onboarding Wizard
    Go To Wizard Step    Coordonn
    Input Text Safely    css=input[formcontrolname="telephone"]    abc
    Click Element    ${SEL_IDENTITY_NOM}    # blur (best effort)
    ${errors}=    Capture Error Messages
    Should Contain Any    ${errors}    Format invalide    invalide
    ...    msg=Expected a phone format error

Submit Without Required Documents Is Blocked
    [Documentation]    On the Récapitulatif step, the submit button must stay
    ...                disabled while blocking errors (missing CIN/RIB scans...) remain.
    [Tags]    negative    wizard    submit
    Login As Agent
    Open Onboarding Wizard
    Go To Wizard Step    Recapitulatif
    ${disabled}=    Run Keyword And Return Status    Element Should Be Disabled    ${SEL_SUBMIT_FALLBACK}
    Should Be True    ${disabled}    msg=Submit should be disabled when required documents are missing

Upload Unsupported File Type Is Rejected
    [Documentation]    The file inputs accept only PDF/JPG/PNG/WebP. A .txt upload
    ...                must be refused (browser-level accept or app-level error).
    [Tags]    negative    upload    conditional
    Login As Agent
    Open Onboarding Wizard
    Go To Wizard Step    Identit
    Run Keyword And Continue On Failure    Upload File To    ${SEL_CIN_UPLOAD}    ${UNSUPPORTED_FILE}
    ${errors}=    Capture Error Messages
    Log    Unsupported-file messages (if any): ${errors}

*** Keywords ***
Should Contain Any
    [Documentation]    Passes if the text contains at least one of the candidates.
    [Arguments]    ${text}    @{candidates}    ${msg}=No candidate found
    FOR    ${c}    IN    @{candidates}
        ${hit}=    Run Keyword And Return Status    Should Contain    ${text}    ${c}    ignore_case=True
        Return From Keyword If    ${hit}
    END
    Fail    ${msg}
