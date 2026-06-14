# SIRH — E2E Tests (Robot Framework + SeleniumLibrary)

End-to-end UI tests for the **agent onboarding** flow of the SIRH application
(Angular + PrimeNG frontend, Spring Boot backend).

These tests drive a real browser through the activation link, the multi-step
onboarding wizard, document uploads, re-login persistence checks, submission, and
the admin validation flow — exactly as a real new agent and an administrator would.

---

## 1. Folder structure

```
e2e-tests/
├── tests/                          # Robot test suites
│   ├── onboarding_agent_e2e.robot          # happy path (golden scenario)
│   ├── onboarding_validation_errors.robot  # negative tests
│   ├── onboarding_admin_validation.robot   # admin validates a dossier
│   └── onboarding_regression.robot         # known-bug regression tests
├── resources/
│   ├── variables.robot             # all configurable variables (URLs, data, files)
│   └── keywords.robot              # reusable high-level keywords
├── files/                          # sample upload files (PDF / PNG / JPG / bad type)
├── results/                        # log.html, report.html, output.xml, screenshots/
├── requirements.txt                # Python dependencies
├── run-tests.bat                   # Windows runner
├── run-tests.sh                    # Linux/macOS runner
└── README.md
```

---

## 2. Install Python

Robot Framework runs on Python 3.8+.

- **Windows:** download from <https://www.python.org/downloads/> and tick
  *“Add Python to PATH”* during install. Verify:
  ```bat
  python --version
  pip --version
  ```
- **Linux:** `sudo apt install python3 python3-pip`
- **macOS:** `brew install python`

You also need **Google Chrome** (default) or Firefox installed.

---

## 3. Install the requirements

From the `e2e-tests/` folder:

```bash
pip install -r requirements.txt
```

This installs `robotframework`, `robotframework-seleniumlibrary`, and
`webdriver-manager`. Modern Selenium (4.6+) ships **Selenium Manager**, which
auto-downloads the correct `chromedriver`/`geckodriver` — no manual driver
install needed in most setups.

> Tip: use a virtual environment
> ```bash
> python -m venv .venv
> # Windows:  .venv\Scripts\activate
> # Linux/Mac: source .venv/bin/activate
> pip install -r requirements.txt
> ```

---

## 4. Configure BASE_URL, token & credentials

**Nothing secret is hardcoded.** Every sensitive value is read from an
environment variable (with a harmless dev default) and can be overridden on the
command line. See [`resources/variables.robot`](resources/variables.robot).

| Variable               | Env var                | Default                      | Meaning                                   |
|------------------------|------------------------|------------------------------|-------------------------------------------|
| `BASE_URL`             | `E2E_BASE_URL`         | `http://localhost:4200`      | Frontend URL (Angular `ng serve`)         |
| `BROWSER`              | `E2E_BROWSER`          | `chrome`                     | `chrome` or `firefox`                     |
| `HEADLESS`             | `E2E_HEADLESS`         | `false`                      | `true` to run without a visible window    |
| `ACTIVATION_TOKEN`     | `E2E_ACTIVATION_TOKEN` | `REPLACE_WITH_A_FRESH_TOKEN` | Token from an admin invitation            |
| `TEST_PASSWORD`        | `E2E_TEST_PASSWORD`    | `Passw0rd!Test2026`          | Password set on activation (≥ 12 chars)   |
| `AGENT_USERNAME`       | `E2E_AGENT_USERNAME`   | `agent.test`                 | Agent login                               |
| `AGENT_PASSWORD`       | `E2E_AGENT_PASSWORD`   | = `TEST_PASSWORD`            | Agent password                            |
| `ADMIN_USERNAME`       | `E2E_ADMIN_USERNAME`   | `admin`                      | Admin login                               |
| `ADMIN_PASSWORD`       | `E2E_ADMIN_PASSWORD`   | `admin`                      | Admin password                            |

### Getting a fresh activation token
The activation URL is `BASE_URL/activation?token=<token>`. Have an admin
initialise/invite a test agent, then copy the token from the invitation email/link.

### Set values — two ways

**A) Environment variables (recommended, keeps secrets out of shell history files):**
```bat
REM Windows (cmd)
set E2E_BASE_URL=http://localhost:4200
set E2E_ACTIVATION_TOKEN=eyJhbGciOi...
set E2E_AGENT_USERNAME=agent.test
set E2E_AGENT_PASSWORD=Passw0rd!Test2026
```
```bash
# Linux / macOS
export E2E_BASE_URL=http://localhost:4200
export E2E_ACTIVATION_TOKEN=eyJhbGciOi...
```

**B) Command-line override:**
```bash
robot -v BASE_URL:http://localhost:4200 -v ACTIVATION_TOKEN:eyJhbGciOi... tests/
```

> ⚠️ Do **not** commit real tokens or passwords. `.gitignore` already excludes
> `results/` and `.env`.

---

## 5. Add test files

Sample upload files already live in [`files/`](files/):
`sample-cin.pdf`, `sample-rib.pdf`, `sample-diplome.pdf`, `sample-photo.png`,
`sample-image.jpg`, and `unsupported-file.txt` (for the bad-type test).

These are minimal placeholders. If your backend strictly validates file content
(real PDF/image structure, size), replace them with real documents of the same
names, or point the variables (`CIN_FILE`, `RIB_FILE`, …) to your own files.

---

## 6. Run the tests

Make sure the **frontend and backend are running** first (e.g. `ng serve` on
`http://localhost:4200` and the Spring Boot API).

### Run everything
```bash
# from e2e-tests/
robot -d results tests/
```
or use the wrappers:
```bat
run-tests.bat
```
```bash
./run-tests.sh
```

### Run a single suite
```bash
robot -d results tests/onboarding_agent_e2e.robot
```

### Run a single test case
```bash
robot -d results -t "Agent Completes Onboarding Successfully" tests/onboarding_agent_e2e.robot
```

### Run by tag
```bash
robot -d results --include smoke tests/
robot -d results --include regression tests/
robot -d results --exclude conditional tests/
```

### Run headless (CI)
```bash
robot -d results -v HEADLESS:true tests/
```

---

## 7. Where to find the reports

After a run, open (in `results/`):

- **`report.html`** — high-level pass/fail summary per suite & test.
- **`log.html`** — step-by-step execution log; every keyword, argument and
  assertion is shown (great for screenshots in your PFE report).
- **`output.xml`** — machine-readable results (for CI dashboards / Allure).
- **`screenshots/`** — a screenshot is captured **automatically on every
  failure** (configured via `run_on_failure=Capture Page Screenshot`).

---

## 8. Using this in your PFE documentation

- Include screenshots of `report.html` (green summary) and `log.html` (a detailed
  scenario) as evidence of automated quality assurance.
- Describe the testing pyramid: unit (JUnit/Karma) → integration → **E2E (Robot)**.
- Use the **regression suite** section to demonstrate defect tracking: each test
  maps to a real reported bug, showing a professional QA process.
- Mention the **data-testid strategy** (below) as a maintainability best practice.

---

## 9. data-testid changes in the Angular app

To keep selectors stable, the following `data-testid` attributes were added to the
templates (purely additive — they do not affect rendering or behaviour):

| Component / file | Element | `data-testid` |
|---|---|---|
| `onboarding-activation` | password field | `activation-password` |
| `onboarding-activation` | confirm password | `activation-confirm-password` |
| `onboarding-activation` | submit button | `activate-account-button` |
| `login` | username | `login-username` |
| `login` | password | `login-password` |
| `login` | submit | `login-submit` |
| `agent-onboarding-wizard` | nom / prénom / CIN | `identity-nom` / `identity-prenom` / `identity-cin` |
| `agent-onboarding-wizard` | sexe select | `identity-sexe` |
| `agent-onboarding-wizard` | situation familiale select | `family-status-select` |
| `agent-onboarding-wizard` | nombre d'enfants | `children-number-input` |
| `agent-onboarding-wizard` | each child form | `child-form-1`, `child-form-2`, … |
| `agent-onboarding-wizard` | CIN upload / RIB upload | `document-upload-cin` / `document-upload-rib` |
| `agent-onboarding-wizard` | submit dossier button | `onboarding-submit-button` |
| `admin-onboarding-list` | search input / table / view button | `admin-onboarding-search` / `admin-onboarding-table` / `admin-view-onboarding-button` |
| `admin-onboarding-detail` | validate button | `admin-validate-onboarding-button` |

All keywords use these testids **with a CSS fallback** to the existing DOM
(`formControlName`, PrimeNG classes, French labels), so the suite keeps working
even where a testid is missing.

---

## 10. What bugs these tests detect

| Suite | What it catches |
|---|---|
| `onboarding_agent_e2e` | Broken activation, wizard save failures, missing persistence after relogin, document duplication, broken submission. |
| `onboarding_validation_errors` | Missing client-side validation: invalid token accepted, password mismatch/weak password let through, required fields not enforced, bad CIN/phone accepted, submit allowed without docs, unsupported file types accepted. |
| `onboarding_admin_validation` | Admin can't see uploaded docs, validation doesn't change status, validated agent still blocked from the normal space. |
| `onboarding_regression` | The 7 known defects: situation familiale not persisted, nombre d'enfants not persisted, children forms vanish on refresh, dashboard "Voir" routes wrong, document duplication in MinIO/UI, invitation poste not applied after validation, sidemenu flash after activation. |

---

## 11. Notes & adapting selectors

- The app UI is **in French**; keyword arguments use French labels
  (`Divorcé(e)`, `Masculin`, …).
- The wizard structure was verified against the source:
  **Step 1** Administratif (read-only) · **Step 2** Identité (incl. situation
  familiale + nombre d'enfants) · **Step 3** Coordonnées & famille (child forms) ·
  **Step 4** Études & formations · **Step 5** Récapitulatif (submit).
- If a selector ever drifts, update the central catalogue at the top of
  [`resources/keywords.robot`](resources/keywords.robot) — tests don't hardcode
  selectors inline.
