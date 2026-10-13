# SafeGuard Mobile

<p align="center">
  <img src="docs/assets/safeguard-mobile-banner.svg" alt="SafeGuard Mobile — report, investigate, prevent" width="100%">
</p>

<p align="center">
  <a href="https://github.com/Abdullah6482/safeguard-mobile/actions/workflows/ci.yml"><img src="https://github.com/Abdullah6482/safeguard-mobile/actions/workflows/ci.yml/badge.svg" alt="CI status"></a>
  <img src="https://img.shields.io/badge/Expo-SDK%2057-000020?logo=expo&logoColor=white" alt="Expo SDK 57">
  <img src="https://img.shields.io/badge/React%20Native-0.86-61DAFB?logo=react&logoColor=111827" alt="React Native 0.86">
  <img src="https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?logo=supabase&logoColor=white" alt="Supabase">
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-F4B942" alt="MIT license"></a>
</p>

SafeGuard Mobile is an offline-first HSE incident reporting and investigation application for field teams. Reporters can capture an event in minutes—even without connectivity—while investigators claim cases, assess four dimensions of impact, define corrective action, and forward a complete record for management review.

The companion [SafeGuard Web portal](https://github.com/Abdullah6482/safeguard-web) completes the lifecycle with manager decisions, analytics, and portfolio governance.

## Product preview

<p align="center"><em>Captured from the running Expo web build at a 390 × 844 mobile viewport.</em></p>

<table>
  <tr>
    <th>Secure sign in</th>
    <th>Reporter home</th>
    <th>Work context</th>
  </tr>
  <tr>
    <td><img src="docs/screenshots/mobile/mobile-login.jpg" alt="SafeGuard secure sign-in screen" width="260"></td>
    <td><img src="docs/screenshots/mobile/reporter-home.jpg" alt="Reporter home and safety score" width="260"></td>
    <td><img src="docs/screenshots/mobile/reporter-context.jpg" alt="Reporter work-context screen" width="260"></td>
  </tr>
  <tr>
    <th>Incident classification</th>
    <th>Incident details</th>
    <th>Initial risk matrix</th>
  </tr>
  <tr>
    <td><img src="docs/screenshots/mobile/reporter-incident-type.jpg" alt="Incident type selection" width="260"></td>
    <td><img src="docs/screenshots/mobile/reporter-details.jpg" alt="Incident details form" width="260"></td>
    <td><img src="docs/screenshots/mobile/reporter-risk-matrix.jpg" alt="Five-by-five initial risk assessment" width="260"></td>
  </tr>
  <tr>
    <th>Submission confirmation</th>
    <th>Investigator queue</th>
    <th>Investigation detail</th>
  </tr>
  <tr>
    <td><img src="docs/screenshots/mobile/reporter-success.jpg" alt="Successful incident submission" width="260"></td>
    <td><img src="docs/screenshots/mobile/investigator-dashboard.jpg" alt="Investigator incident queue" width="260"></td>
    <td><img src="docs/screenshots/mobile/investigator-report-detail.jpg" alt="Investigator report detail" width="260"></td>
  </tr>
  <tr>
    <th colspan="3">Manager handoff</th>
  </tr>
  <tr>
    <td colspan="3" align="center"><img src="docs/screenshots/mobile/investigator-forwarded.jpg" alt="Investigation forwarded to manager review" width="260"></td>
  </tr>
</table>

The gallery uses demo records and shows the complete role-aware path from reporting through investigation handoff. See the [screenshot manifest](docs/screenshots/mobile/README.md) for the screen index.

## Two role-specific experiences

| Reporter | Investigator |
|---|---|
| Guided incident submission | Assigned and unassigned investigation queues |
| Camera or gallery evidence | Atomic incident claiming |
| GPS and reverse-geocoded location | Evidence and reporter-context review |
| 5×5 initial risk assessment | People, Asset, Environment, and Reputation scoring |
| Durable offline queue | Root-cause and CAPA documentation |
| Safety points and achievements | Audited handoff to manager review |

## Field workflow

```mermaid
flowchart LR
    A[Context] --> B[Incident type]
    B --> C[Details + location]
    C --> D[Photo evidence]
    D --> E[5×5 risk matrix]
    E --> F{Online?}
    F -->|Yes| G[Submit to Supabase]
    F -->|No| H[Durable local queue]
    H -->|Connectivity returns| G
    G --> I[Investigator claims]
    I --> J[Four-pillar assessment]
    J --> K[Root cause + CAPA]
    K --> L[Manager review]
```

## Reliability by design

- Evidence is copied into application-owned storage before offline queuing.
- Every report receives a stable `client_submission_id` for idempotent retries.
- Pending work synchronizes at startup and whenever the app becomes active.
- Retryable failures use exponential backoff with jitter.
- Permanently invalid items are quarantined so one report cannot block the queue.
- Claiming and investigation submission run through atomic PostgreSQL functions.
- Safety points and audit records are written in the same transaction as investigation completion.

## Architecture

```text
Expo SDK 57 + React Native 0.86
              │
              ├── Role-aware React Navigation stacks
              ├── Reporter and investigator screens
              ├── Report/investigation service layer
              └── Offline queue + sync coordinator
                              │
                         Supabase API
                              │
        ┌─────────────────────┼──────────────────────┐
        │                     │                      │
      Auth             PostgreSQL/RLS          Photo Storage
                              │
                  Transactional workflow RPCs
```

See [the architecture notes](docs/ARCHITECTURE.md) and [mobile reliability migration](supabase/migrations/20260929_mobile_reliability.sql).

## Technology

- Expo SDK 57, React 19, and React Native 0.86
- React Navigation native stack
- Supabase Auth, PostgreSQL, Storage, and RPCs
- AsyncStorage, Expo FileSystem, Secure Store, Camera, Location, and Network
- Jest with the Expo preset
- EAS development, preview APK, and production profiles

## Run locally

Requirements: Node.js 22+, Expo Go compatible with SDK 57, and access to a configured SafeGuard Supabase project.

```bash
git clone https://github.com/Abdullah6482/safeguard-mobile.git
cd safeguard-mobile
npm ci
cp .env.example .env
npm start
```

On Windows PowerShell, use `Copy-Item .env.example .env` instead of `cp`.

Configure only the public mobile credentials:

```dotenv
EXPO_PUBLIC_SUPABASE_URL=https://PROJECT_REF.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_your_key
```

Never embed a service-role or `sb_secret_...` key in a mobile application.

## Verification

```bash
npm test             # 38 tests across 16 suites
npm run doctor       # Expo dependency and configuration checks
npm run check        # Tests followed by Expo Doctor
```

## Repository map

```text
screens/reporter/           guided reporting workflow
screens/investigator/       investigation and CAPA workflow
navigation/                 auth-aware role routing
lib/reportService.js        online/idempotent report submission
lib/investigationService.js protected transition RPC wrappers
lib/offlineQueue.js         durable local queue and evidence retention
lib/syncService.js          retry and synchronization coordination
supabase/migrations/        reliability constraints and RPCs
__tests__/                  reliability and domain unit tests
```

## Security note

Client routing improves the user experience; it is not treated as the security boundary. Supabase grants, Row Level Security policies, and role-checking database functions enforce access on the server. Administrative reset tooling requires an explicitly supplied temporary secret and rejects legacy JWT service-role keys.

See [SECURITY.md](SECURITY.md) for responsible disclosure guidance.

## License

Released under the [MIT License](LICENSE).
