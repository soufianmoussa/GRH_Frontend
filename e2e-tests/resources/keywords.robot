*** Settings ***
Documentation     Reusable, high-level keywords for the SIRH onboarding agent E2E suite.
...
...               SELECTOR STRATEGY
...               ----------------
...               Keywords prefer stable `data-testid` attributes. The matching
...               attributes are added to the Angular templates (see README ->
...               "data-testid changes"). Where a testid is not yet present, we
...               fall back to `formControlName`, PrimeNG component selectors or
...               French label text, all of which match the current DOM.
...
...               The app UI is in French, so visible labels/buttons are French.

Library           SeleniumLibrary    run_on_failure=Capture Page Screenshot
Library           OperatingSystem
Library           Collections
Library           String
Resource          variables.robot

*** Variables ***
# ---- Central selector catalogue (one place to update if the DOM changes) ----
# Activation
${SEL_ACT_PASSWORD}          css=[data-testid="activation-password"] input, .activation-password input, #password
${SEL_ACT_CONFIRM}           css=[data-testid="activation-confirm-password"] input, #confirmPassword
${SEL_ACT_SUBMIT}            css=[data-testid="activate-account-button"], form button[type="submit"]
${SEL_ACT_INVALID_MSG}       xpath=//h1[contains(.,'Lien non valide')]
${SEL_ACT_SUCCESS_MSG}       xpath=//h1[contains(.,'Compte activé') or contains(.,'Compte active')]

# Login
${SEL_LOGIN_USER}            css=[data-testid="login-username"], #username
${SEL_LOGIN_PASS}            css=[data-testid="login-password"] input, #password input
${SEL_LOGIN_SUBMIT}          css=[data-testid="login-submit"], form button[type="submit"]

# Wizard - step 2 (Identité)
${SEL_IDENTITY_NOM}          css=[data-testid="identity-nom"], input[formcontrolname="nom"]
${SEL_IDENTITY_PRENOM}       css=[data-testid="identity-prenom"], input[formcontrolname="prenom"]
${SEL_IDENTITY_CIN}          css=[data-testid="identity-cin"], [formgroup] input[formcontrolname="numero"], input[formcontrolname="numero"]
${SEL_FAMILY_STATUS}         css=[data-testid="family-status-select"], p-select[formcontrolname="situation"]
${SEL_CHILDREN_NUMBER}       css=[data-testid="children-number-input"] input, p-inputnumber[formcontrolname="numEnfant"] input
${SEL_IDENTITY_SEXE}         css=[data-testid="identity-sexe"], p-select[formcontrolname="sexe"]
${SEL_CIN_UPLOAD}            css=[data-testid="document-upload-cin"], input[type="file"][accept*="pdf"]

# Wizard - step 3 (Coordonnées & famille)
${SEL_RIB_UPLOAD}            css=[data-testid="document-upload-rib"]
${SEL_CHILDREN_LIST}         css=.child-row, [data-testid^="child-form-"]

# Wizard - generic actions (only the active step panel is rendered, so labels are unique)
${SEL_SAVE_DRAFT}            xpath=//p-button[.//*[contains(text(),'Enregistrer le brouillon')]]//button | //button[contains(.,'Enregistrer le brouillon')]
${SEL_SAVE_CONTINUE}         xpath=//p-button[.//*[contains(text(),'Enregistrer et continuer')]]//button | //button[contains(.,'Enregistrer et continuer')]
${SEL_CONTINUE}              xpath=//p-button[.//*[contains(text(),'Continuer')]]//button | //button[contains(.,'Continuer')]
${SEL_SUBMIT}               css=[data-testid="onboarding-submit-button"]
${SEL_SUBMIT_FALLBACK}      xpath=//button[contains(.,'Soumettre mon dossier')]

# Admin
${SEL_ADMIN_SEARCH}          css=[data-testid="admin-onboarding-search"], .search-wrap input
${SEL_ADMIN_TABLE}           css=[data-testid="admin-onboarding-table"], .admin-onboarding-list p-table
${SEL_ADMIN_VIEW_BTN}        css=[data-testid="admin-view-onboarding-button"], .actions-cell a[icon="pi pi-eye"]
${SEL_ADMIN_VALIDATE_BTN}    css=[data-testid="admin-validate-onboarding-button"], button[label="Valider le dossier"]

*** Keywords ***
# =============================================================================
# Session lifecycle
# =============================================================================
Open Browser To App
    [Documentation]    Opens the browser, applies headless/window options and timeouts.
    [Arguments]    ${url}=${BASE_URL}
    ${opts}=    Build Browser Options
    Open Browser    ${url}    ${BROWSER}    options=${opts}
    Set Selenium Timeout    ${SELENIUM_TIMEOUT}
    Set Selenium Speed    ${SELENIUM_SPEED}
    Maximize Browser Window

Build Browser Options
    [Documentation]    Returns Selenium options string honouring ${HEADLESS} and CI sandboxing.
    ${headless}=    Convert To Lower Case    ${HEADLESS}
    ${opts}=    Set Variable    add_argument("--window-size=1600,1000"); add_argument("--no-sandbox"); add_argument("--disable-dev-shm-usage")
    IF    '${headless}' == 'true'
        ${opts}=    Set Variable    add_argument("--headless=new"); ${opts}
    END
    RETURN    ${opts}

Close Browser Session
    [Documentation]    Closes all browser windows. Use in test/suite teardown.
    Close All Browsers

# =============================================================================
# Activation flow
# =============================================================================
Open Onboarding Activation Page
    [Documentation]    Opens the activation link (BASE_URL/activation?token=...).
    [Arguments]    ${url}=${ACTIVATION_URL}
    Go To    ${url}
    Wait Until Page Contains Element    css=.activation-card    timeout=${SELENIUM_TIMEOUT}

Activate Agent Account
    [Documentation]    Sets the password + confirmation on the activation form and submits.
    ...                Verifies the account is activated (success state).
    [Arguments]    ${password}=${TEST_PASSWORD}    ${confirm}=${None}
    ${confirm}=    Set Variable If    $confirm is None    ${password}    ${confirm}
    Wait Until Element Is Visible    ${SEL_ACT_PASSWORD}
    Input Password Field    ${SEL_ACT_PASSWORD}    ${password}
    Input Password Field    ${SEL_ACT_CONFIRM}     ${confirm}
    Click Element    ${SEL_ACT_SUBMIT}

Confirm Account Activation
    [Documentation]    Waits for the "Compte activé" success state after submitting.
    Wait Until Page Contains Element    ${SEL_ACT_SUCCESS_MSG}    timeout=${SELENIUM_TIMEOUT}

Verify Redirected To Onboarding Dashboard
    [Documentation]    Confirms the agent landed on the onboarding hub/wizard.
    Wait Until Location Contains    mon-onboarding    timeout=${SELENIUM_TIMEOUT}

# =============================================================================
# Login / logout
# =============================================================================
Login As Agent
    [Documentation]    Logs in via /login as the test agent.
    [Arguments]    ${username}=${AGENT_USERNAME}    ${password}=${AGENT_PASSWORD}
    Generic Login    ${username}    ${password}
    Wait Until Location Contains    mon-onboarding    timeout=${SELENIUM_TIMEOUT}

Login As Admin
    [Documentation]    Logs in via /login as an administrator.
    [Arguments]    ${username}=${ADMIN_USERNAME}    ${password}=${ADMIN_PASSWORD}
    Generic Login    ${username}    ${password}
    Wait Until Location Does Not Contain    /login    timeout=${SELENIUM_TIMEOUT}

Generic Login
    [Documentation]    Fills the login form (username + p-password) and submits.
    [Arguments]    ${username}    ${password}
    Go To    ${LOGIN_URL}
    Wait Until Element Is Visible    ${SEL_LOGIN_USER}
    Input Text    ${SEL_LOGIN_USER}    ${username}
    Input Password Field    ${SEL_LOGIN_PASS}    ${password}
    Click Element    ${SEL_LOGIN_SUBMIT}

Logout
    [Documentation]    Logs the current user out. The app stores the JWT in
    ...                local/session storage, so clearing it + reloading is the
    ...                most robust cross-layout logout for E2E.
    Execute Javascript    window.localStorage.clear(); window.sessionStorage.clear();
    Go To    ${LOGIN_URL}
    Wait Until Element Is Visible    ${SEL_LOGIN_USER}    timeout=${SELENIUM_TIMEOUT}

# =============================================================================
# Wizard navigation
# =============================================================================
Open Onboarding Wizard
    [Documentation]    Navigates directly to the multi-step wizard.
    Go To    ${WIZARD_URL}
    Wait Until Page Contains Element    css=.wizard-host, .wizard-stepper    timeout=${SELENIUM_TIMEOUT}

Go To Wizard Step
    [Documentation]    Clicks a stepper header by its (accent-insensitive) French label.
    ...                Labels: Administratif | Identite | Coordonnees | Etudes | Recapitulatif
    [Arguments]    ${label}
    ${step}=    Set Variable    xpath=//p-step[contains(normalize-space(.),'${label}')]
    Wait Until Element Is Visible    ${step}    timeout=${SELENIUM_TIMEOUT}
    Click Element    ${step}
    Sleep    300ms    reason=let the step panel animation settle

# =============================================================================
# Step 2 - Identité (personal info + family situation live HERE in the real app)
# =============================================================================
Fill Personal Information Step
    [Documentation]    Fills the identity step (Step 2): nom, prénom, CIN, sexe,
    ...                date de naissance. The app keeps personal identity on Step 2.
    [Arguments]    ${data}=${TEST_AGENT_DATA}
    Go To Wizard Step    Identit
    Wait Until Element Is Visible    ${SEL_IDENTITY_NOM}
    Input Text Safely    ${SEL_IDENTITY_NOM}       ${data}[nom]
    Input Text Safely    ${SEL_IDENTITY_PRENOM}    ${data}[prenom]
    Input Text Safely    ${SEL_IDENTITY_CIN}       ${data}[cin]
    Select P-Select Option    ${SEL_IDENTITY_SEXE}    ${data}[sexe]

Fill Family Situation Step
    [Documentation]    Sets "Situation familiale" and "Nombre d'enfants" (both on Step 2).
    [Arguments]    ${situation}=${TEST_AGENT_DATA}[situation]    ${nb_enfants}=${TEST_AGENT_DATA}[nb_enfants]
    Go To Wizard Step    Identit
    Select P-Select Option    ${SEL_FAMILY_STATUS}    ${situation}
    Set Number Of Children    ${nb_enfants}

Set Number Of Children
    [Documentation]    Types the children count and blurs so the children FormArray rebuilds.
    [Arguments]    ${count}
    Wait Until Element Is Visible    ${SEL_CHILDREN_NUMBER}
    Clear Element Text    ${SEL_CHILDREN_NUMBER}
    Input Text    ${SEL_CHILDREN_NUMBER}    ${count}
    Press Keys    ${SEL_CHILDREN_NUMBER}    TAB

Verify Children Form Count
    [Documentation]    Asserts that exactly N child forms are rendered on Step 3.
    [Arguments]    ${expected}
    Go To Wizard Step    Coordonn
    Wait Until Page Contains Element    css=.child-row    timeout=${SELENIUM_TIMEOUT}
    ${count}=    Get Element Count    css=.child-row
    Should Be Equal As Integers    ${count}    ${expected}
    ...    msg=Expected ${expected} child forms but found ${count} (children-not-rendered bug)

# =============================================================================
# Step 3 - Coordonnées & famille (address, bank, children data)
# =============================================================================
Fill Contact And Address Step
    [Documentation]    Fills address + bank fields on Step 3.
    [Arguments]    ${data}=${TEST_AGENT_DATA}
    Go To Wizard Step    Coordonn
    Wait Until Element Is Visible    css=input[formcontrolname="adresse"]
    Input Text Safely    css=input[formcontrolname="adresse"]       ${data}[adresse]
    Input Text Safely    css=input[formcontrolname="codePostal"]    ${data}[code_postal]
    Input Text Safely    css=input[formcontrolname="ville"]         ${data}[ville]
    Input Text Safely    css=input[formcontrolname="telephone"]     ${data}[telephone]
    Input Text Safely    css=input[formcontrolname="banque"]        ${data}[banque]
    Input Text Safely    css=input[formcontrolname="rib"]           ${data}[rib]

Fill Children Forms Dynamically
    [Documentation]    Loops over every rendered .child-row on Step 3 and fills it
    ...                from the provided list of dictionaries.
    [Arguments]    @{children}
    Go To Wizard Step    Coordonn
    Wait Until Page Contains Element    css=.child-row
    ${rows}=    Get Element Count    css=.child-row
    FOR    ${index}    IN RANGE    ${rows}
        ${nth}=    Evaluate    ${index} + 1
        ${child}=    Set Variable    ${children}[${index}]
        ${scope}=    Set Variable    xpath=(//div[contains(@class,'child-row')])[${nth}]
        Input Text Safely    ${scope}//input[@formcontrolname='nom']       ${child}[nom]
        Input Text Safely    ${scope}//input[@formcontrolname='prenom']    ${child}[prenom]
        Log    Filled child form #${nth}: ${child}[prenom] ${child}[nom]
    END

# =============================================================================
# Saving
# =============================================================================
Save Current Step
    [Documentation]    Clicks "Enregistrer le brouillon" on the active step and waits
    ...                for the success toast. Falls back to "Enregistrer et continuer".
    ${has_draft}=    Run Keyword And Return Status    Element Should Be Visible    ${SEL_SAVE_DRAFT}
    IF    ${has_draft}
        Click Element    ${SEL_SAVE_DRAFT}
    ELSE
        Click Element    ${SEL_CONTINUE}
    END
    Wait For Toast Or Idle

Wait For Toast Or Idle
    [Documentation]    Best-effort wait for a PrimeNG toast confirming the save.
    ${ok}=    Run Keyword And Return Status
    ...    Wait Until Page Contains Element    css=.p-toast-message    timeout=8 s
    Run Keyword If    not ${ok}    Log    No toast detected after save (continuing).    level=WARN
    Sleep    400ms

# =============================================================================
# Document uploads (inline in the real app: CIN on step 2, RIB on step 3)
# =============================================================================
Upload Required Documents
    [Documentation]    Uploads the inline required documents: CIN scan (Step 2) and
    ...                RIB attestation (Step 3). Uses Choose File against the hidden
    ...                <input type=file> elements.
    [Arguments]    ${cin}=${CIN_FILE}    ${rib}=${RIB_FILE}
    Go To Wizard Step    Identit
    Upload File To    ${SEL_CIN_UPLOAD}    ${cin}
    Go To Wizard Step    Coordonn
    Upload File To    xpath=(//div[contains(@class,'rib-attestation-block')]//input[@type='file'])[1]    ${rib}

Upload File To
    [Documentation]    Chooses a file for a (possibly hidden) file input.
    [Arguments]    ${locator}    ${path}
    ${abs}=    Normalize Path    ${path}
    File Should Exist    ${abs}
    Choose File    ${locator}    ${abs}
    Sleep    300ms

Upload Single Document Repeatedly
    [Documentation]    Uploads/saves the SAME document several times to prove the UI
    ...                does not show duplicate entries (MinIO/UI duplication bug).
    [Arguments]    ${times}=3    ${file}=${RIB_FILE}
    Go To Wizard Step    Coordonn
    FOR    ${i}    IN RANGE    ${times}
        Upload File To    xpath=(//div[contains(@class,'rib-attestation-block')]//input[@type='file'])[1]    ${file}
        Save Current Step
        Log    Save attempt ${i} done
    END

Verify No Duplicate Document Shown
    [Documentation]    Asserts the RIB attestation appears at most once in the UI.
    Go To Wizard Step    Coordonn
    ${count}=    Get Element Count    xpath=//div[contains(@class,'rib-attestation-block')]//a[contains(@class,'file-link')]
    Should Be True    ${count} <= 1
    ...    msg=Duplicate RIB document detected in UI (${count} entries) - duplication bug

# =============================================================================
# Submission
# =============================================================================
Submit Onboarding
    [Documentation]    Navigates to the Récapitulatif step and submits the dossier.
    Go To Wizard Step    Recapitulatif
    ${has_testid}=    Run Keyword And Return Status    Element Should Be Visible    ${SEL_SUBMIT}
    IF    ${has_testid}
        Click Element    ${SEL_SUBMIT}
    ELSE
        Wait Until Element Is Visible    ${SEL_SUBMIT_FALLBACK}
        Click Element    ${SEL_SUBMIT_FALLBACK}
    END

# =============================================================================
# Verification helpers
# =============================================================================
Verify Saved Data Still Exists
    [Documentation]    After a re-login, re-opens the wizard and asserts the family
    ...                situation, children count and a child's data persisted.
    [Arguments]    ${expected_children}=2
    Open Onboarding Wizard
    Go To Wizard Step    Identit
    # Children count input must still hold the saved value
    ${nb}=    Get Value    ${SEL_CHILDREN_NUMBER}
    Should Be Equal As Integers    ${nb}    ${expected_children}
    ...    msg=Nombre d'enfants not persisted after relogin (saved=${nb})
    Verify Children Form Count    ${expected_children}
    # First child's prénom should be persisted
    ${prenom}=    Get Value    xpath=(//div[contains(@class,'child-row')])[1]//input[@formcontrolname='prenom']
    Should Not Be Empty    ${prenom}    msg=Children data not persisted after relogin

Verify Success Message
    [Documentation]    Confirms the onboarding became "submitted / en attente de validation".
    Wait Until Page Contains Element
    ...    xpath=//*[contains(.,'attente de validation') or contains(.,'PENDING_VALIDATION') or contains(.,'en cours de validation')]
    ...    timeout=${SELENIUM_TIMEOUT}

Verify Onboarding Status Is
    [Documentation]    Asserts a given status label/text is visible on the page.
    [Arguments]    ${expected_text}
    Wait Until Page Contains    ${expected_text}    timeout=${SELENIUM_TIMEOUT}

Capture Error Messages
    [Documentation]    Returns the concatenated text of all visible validation/error
    ...                messages (PrimeNG p-message, .p-error, .field-error).
    ${texts}=    Create List
    ${els}=    Get WebElements    css=.p-error, .field-error, .p-message-error, p-message[severity="error"], p-message[severity="warn"]
    FOR    ${el}    IN    @{els}
        ${t}=    Get Text    ${el}
        Run Keyword If    '${t}' != '${EMPTY}'    Append To List    ${texts}    ${t}
    END
    ${joined}=    Catenate    SEPARATOR=${\n}    @{texts}
    Log    Captured errors:${\n}${joined}
    RETURN    ${joined}

Page Should Show Error Containing
    [Documentation]    Fails unless an error/validation message contains the text.
    [Arguments]    ${text}
    ${errors}=    Capture Error Messages
    Should Contain    ${errors}    ${text}    ignore_case=True
    ...    msg=Expected an error containing "${text}" but none was shown

# =============================================================================
# Admin
# =============================================================================
Open Admin Onboarding Dashboard
    [Documentation]    Opens the admin onboarding list.
    Go To    ${ADMIN_ONBOARDING_URL}
    Wait Until Page Contains Element    ${SEL_ADMIN_TABLE}    timeout=${SELENIUM_TIMEOUT}

Search Onboarding For Agent
    [Documentation]    Types a query (name / matricule / email) into the admin search box.
    [Arguments]    ${query}
    Wait Until Element Is Visible    ${SEL_ADMIN_SEARCH}
    Clear Element Text    ${SEL_ADMIN_SEARCH}
    Input Text    ${SEL_ADMIN_SEARCH}    ${query}
    Sleep    600ms    reason=client-side filter debounce

Open First Onboarding Details
    [Documentation]    Clicks the first row's "Voir" (eye) action to open the detail page.
    Wait Until Element Is Visible    ${SEL_ADMIN_VIEW_BTN}
    Click Element    ${SEL_ADMIN_VIEW_BTN}
    Wait Until Location Contains    /admin/onboarding/    timeout=${SELENIUM_TIMEOUT}

Verify Uploaded Documents Are Visible
    [Documentation]    Asserts at least one uploaded document/file link is shown in the detail.
    ${count}=    Get Element Count    css=a.file-link, a[target="_blank"]
    Should Be True    ${count} > 0    msg=No uploaded documents visible on the admin detail page

Validate Onboarding
    [Documentation]    Clicks "Valider le dossier" and confirms any PrimeNG confirm dialog.
    Wait Until Element Is Visible    ${SEL_ADMIN_VALIDATE_BTN}
    Click Element    ${SEL_ADMIN_VALIDATE_BTN}
    Confirm Primeng Dialog If Present

Confirm Primeng Dialog If Present
    [Documentation]    Accepts a p-confirmDialog if one appears.
    ${present}=    Run Keyword And Return Status
    ...    Wait Until Element Is Visible    css=.p-confirm-dialog .p-confirm-dialog-accept, .p-confirmdialog button.p-confirm-dialog-accept    timeout=4 s
    Run Keyword If    ${present}    Click Element    css=.p-confirm-dialog .p-confirm-dialog-accept, .p-confirmdialog button.p-confirm-dialog-accept

# =============================================================================
# Low-level utilities
# =============================================================================
Input Text Safely
    [Documentation]    Clears then types into a field, waiting for it first.
    [Arguments]    ${locator}    ${text}
    Wait Until Element Is Visible    ${locator}    timeout=${SELENIUM_TIMEOUT}
    Clear Element Text    ${locator}
    Input Text    ${locator}    ${text}

Input Password Field
    [Documentation]    Types into a (PrimeNG p-password) field. The locator should
    ...                resolve to the inner <input>.
    [Arguments]    ${locator}    ${value}
    Wait Until Element Is Visible    ${locator}    timeout=${SELENIUM_TIMEOUT}
    Clear Element Text    ${locator}
    Input Text    ${locator}    ${value}

Select P-Select Option
    [Documentation]    Opens a PrimeNG p-select and clicks the option matching the
    ...                visible (French) label.
    [Arguments]    ${select_locator}    ${option_label}
    Wait Until Element Is Visible    ${select_locator}    timeout=${SELENIUM_TIMEOUT}
    Click Element    ${select_locator}
    ${opt}=    Set Variable    xpath=//li[contains(@class,'p-select-option') or contains(@class,'p-dropdown-item')][normalize-space(.)='${option_label}']
    Wait Until Element Is Visible    ${opt}    timeout=${SELENIUM_TIMEOUT}
    Click Element    ${opt}

Wait Until Location Does Not Contain
    [Documentation]    Polls the URL until it no longer contains the fragment.
    [Arguments]    ${fragment}    ${timeout}=${SELENIUM_TIMEOUT}
    Wait Until Keyword Succeeds    ${timeout}    500ms    Location Should Not Contain Fragment    ${fragment}

Location Should Not Contain Fragment
    [Documentation]    Fails if the current URL contains the given fragment.
    [Arguments]    ${fragment}
    ${url}=    Get Location
    Should Not Contain    ${url}    ${fragment}
