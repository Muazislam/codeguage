# CodeGuage

A read-only mobile app that connects to your [WakaTime](https://wakatime.com) account and shows
your coding activity: today's total, the last 7 and 30 days, language/project/editor breakdowns,
and a daily chart.

This is the implementation of `PRODUCT_REQUIREMENTS.md`.

## Architecture

```
┌────────────────────────┐        HTTPS        ┌──────────────────────────┐
│  Expo React Native app │ ──────────────────► │  Node.js backend         │
│  (Android / iOS)       │   token exchange    │  (holds OAuth secret)    │
└──────────┬─────────────┘                     └────────────┬─────────────┘
           │                                                │
           │  Bearer / Basic auth                           │ client_id + client_secret
           ▼                                                ▼
     https://wakatime.com/api/v1                    https://wakatime.com/oauth
```

The WakaTime OAuth 2.0 token endpoint **requires a client secret**. A secret cannot be shipped in a
mobile bundle, so the app never sees it. Instead:

1. The app starts the OAuth authorization flow and receives a short-lived `code`.
2. The app sends the `code` to the CodeGuage backend.
3. The backend exchanges it for tokens using the secret.
4. The app stores the tokens in encrypted secure storage and calls the WakaTime API directly.

As a convenience fallback (and for quick local testing) the app can also connect with a
user-supplied WakaTime **API key**, which is entered at runtime and stored only in device secure
storage — it is never part of the bundle.

## Tech stack

- **Mobile:** Expo React Native + TypeScript + Expo Router
- **Charts:** `react-native-gifted-charts` (on `react-native-svg`)
- **Auth:** WakaTime OAuth 2.0 (with an API-key fallback)
- **Storage:** `expo-secure-store` (encrypted; `localStorage` on web)
- **Backend:** Node.js + Express (TypeScript, run with `tsx`)
- **Tests:** Node's built-in test runner via `tsx`

## Repository layout

```
.
├── src/                     # Expo app (routes live in src/app)
│   ├── app/                 # Expo Router screens
│   ├── api/                 # Backend client
│   ├── auth/                # Session provider
│   ├── components/          # UI components
│   ├── hooks/               # useStats, useTheme
│   ├── lib/                 # Pure logic + unit tests
│   ├── storage/             # Secure credential storage
│   └── theme/               # Dark mode / theme context
├── server/                  # OAuth token-exchange backend
├── app.json                 # Expo config
├── PRODUCT_REQUIREMENTS.md
```

## Prerequisites

- Node.js 20+
- A WakaTime account
- For OAuth: a WakaTime OAuth app created at <https://wakatime.com/apps>

## Setup

### 1. Backend

```bash
cd server
cp .env.example .env
# edit .env with your WakaTime OAuth client id + secret
npm install
npm run dev
```

Environment variables (`server/.env`):

| Variable | Description |
| --- | --- |
| `PORT` | Port to listen on (default `8787`). |
| `WAKATIME_CLIENT_ID` | OAuth app client id. |
| `WAKATIME_CLIENT_SECRET` | OAuth app client secret (never sent to the app). |
| `ALLOWED_REDIRECT_URIS` | Comma-separated allow-list, e.g. `codeguage://oauth`. |

### 2. Mobile app

```bash
cp .env.example .env
# set EXPO_PUBLIC_API_URL to your backend and EXPO_PUBLIC_WAKATIME_CLIENT_ID to your client id
npm install
npm run android      # or: npm start, then press "a"
```

On the WakaTime OAuth app, register the redirect URI shown on the app's connect screen
(`codeguage://oauth` for native builds).

> Expo Go cannot complete a custom-scheme OAuth redirect. Use an EAS/dev build for OAuth, or use
> the "Connect with API key" option for quick testing.

## Testing & checks

```bash
npm test                 # mobile unit tests (pure logic)
npm run typecheck        # TypeScript for the app
npm run lint             # ESLint

cd server
npm test                 # backend unit tests
npm run typecheck
```

## Building for Android

```bash
npm install -g eas-cli
eas login
eas build:configure
eas build --platform android --profile preview
```

This produces an installable APK. Testers can install it directly — no developer tools required.

## MVP scope

Included: WakaTime connection, today's total, last 7 days, last 30 days, language/project/editor
breakdowns, daily chart, refresh button, error handling, loading states, dark mode.

Intentionally excluded: sending heartbeats, a WakaTime competitor, desktop tracking, team
dashboards, social features, notifications, custom billing, AI coding analytics, manual time
editing. The app is strictly read-only.

## Security notes

- The WakaTime client secret lives only in `server/.env` and is never bundled into the app.
- OAuth access/refresh tokens and API keys are stored in `expo-secure-store` on the device.
- The app only reads data (`read_stats` scope); it never writes heartbeats.

## Success criteria

- Connect WakaTime in under two minutes.
- Today's total matches the WakaTime dashboard.
- Weekly language totals match WakaTime.
- Works on Android.
- API failures show understandable messages.
- No secret key appears in the mobile bundle.
- A fresh install needs no developer tools.
