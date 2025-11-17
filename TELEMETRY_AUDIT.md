# AFFiNE Telemetry & External Communications Audit

**Date:** 2025-11-17
**Purpose:** Comprehensive audit of all telemetry, analytics, error reporting, and external data transmission in AFFiNE
**Goal:** Enable complete removal of telemetry for self-hosted deployments where no data should be sent to external services

---

## Executive Summary

This audit identified **11 primary categories** of external data transmission in the AFFiNE codebase:

1. **Analytics & Event Tracking** (Mixpanel)
2. **Error Reporting** (Sentry, Firebase Crashlytics)
3. **Performance Monitoring** (OpenTelemetry, Perfsee)
4. **Auto-Update Mechanisms** (Electron)
5. **Payment Processing** (Stripe, RevenueCat)
6. **Customer Communication** (Customer.io)
7. **CAPTCHA Services** (Cloudflare Turnstile)
8. **AI Model Services** (OpenAI, Anthropic, Google, FAL.ai, etc.)
9. **OAuth Authentication** (Google, GitHub, Apple)
10. **Cloud Storage & CDN** (AWS S3, Cloudflare R2)
11. **Email Services** (SMTP)

**Current State:** Telemetry is **enabled by default** with user opt-out available. Self-hosted mode reduces but does not eliminate all external communications.

---

## 1. Frontend Telemetry & Analytics

### 1.1 Mixpanel Analytics

**Status:** ⚠️ Active by default, user can opt-out
**Impact:** HIGH - Tracks virtually every user interaction

**Implementation:**
- **Location:** `/packages/frontend/track/src/mixpanel.ts`
- **Package:** `mixpanel-browser` v2.56.0
- **Endpoint:** `https://telemetry.affine.run` (custom AFFiNE server, not Mixpanel's)
- **Token:** `BUILD_CONFIG.MIXPANEL_TOKEN` environment variable

**Data Collected:**
- User identification (email, name, avatar when signed in)
- App metadata: version, build type, editor version, platform, distribution
- **874+ tracked events** defined in `/packages/frontend/track/src/events.ts`
- Page views (automatic tracking enabled)
- User properties and profiles

**Event Categories:**
- App lifecycle (updates, downloads, settings)
- Authentication (sign in/out, account management)
- Workspace operations (create, upgrade, import, export)
- Document operations (create, edit, delete, share, publish)
- Editor interactions (formatting, block operations)
- AI/Copilot usage (all AI actions tracked)
- Payment flows (subscriptions, billing, upgrades)
- Collaboration (sharing, permissions, comments)
- Templates, recordings, integrations
- Navigation, search, and UI interactions

**Auto-Tracking:**
- **File:** `/packages/frontend/track/src/auto.ts`
- DOM elements with `data-event-props` attribute automatically track clicks
- Event hierarchy: `page.segment.module.event`

**Configuration:**
```typescript
mixpanelBrowser.init(BUILD_CONFIG.MIXPANEL_TOKEN, {
  track_pageview: true,
  persistence: 'localStorage',
  api_host: 'https://telemetry.affine.run',
  ignore_dnt: true, // ⚠️ Ignores Do Not Track browser setting
});
```

**User Control:**
- Setting: `enableTelemetry` in localStorage (`affine-settings` key)
- Default: **TRUE** (opt-out model)
- UI location: Settings → About → Enable Telemetry toggle
- Methods: `mixpanel.opt_out_tracking()` / `opt_in_tracking()`

**Files to Remove/Modify:**
- `/packages/frontend/track/src/mixpanel.ts` - Core implementation
- `/packages/frontend/track/src/events.ts` - 874 lines of event definitions
- `/packages/frontend/track/src/auto.ts` - Auto-tracking system
- `/packages/frontend/track/src/index.ts` - Main export
- `/packages/frontend/track/src/types.ts` - Type definitions
- `/packages/frontend/core/src/modules/telemetry/` - Telemetry service integration
- `/packages/frontend/core/src/bootstrap/telemetry.ts` - Bootstrap initialization
- **150+ files** with `track.` function calls across the codebase

---

### 1.2 Sentry Error Tracking

**Status:** ⚠️ Active by default, user can opt-out
**Impact:** HIGH - Sends all errors and performance traces

**Implementation:**

**Frontend/Web:**
- **Location:** `/packages/frontend/track/src/sentry.ts`
- **Package:** `@sentry/react` v9.2.0
- **DSN:** `BUILD_CONFIG.SENTRY_DSN` environment variable

**Electron Desktop:**
- **Location:** `/packages/frontend/apps/electron/src/main/index.ts` (lines 110-125)
- **Package:** `@sentry/electron` v7.0.0
- **Also:** Preload script at `/packages/frontend/apps/electron/src/preload/bootstrap.ts`

**Data Collected:**
- Error messages and stack traces
- Performance traces (React Router navigation timing)
- User context (if identified)
- App metadata: distribution, appVersion, editorVersion
- Component stack traces
- Environment: build type (stable/beta/canary/internal)

**Features:**
- React Router v6 browser tracing integration
- Custom error boundaries
- Source maps automatically uploaded during build (see section 5)
- Debug mode in development builds

**Configuration:**
```typescript
Sentry.init({
  dsn: BUILD_CONFIG.SENTRY_DSN,
  debug: BUILD_CONFIG.debug ?? false,
  environment: BUILD_CONFIG.appBuildType,
  integrations: [
    Sentry.reactRouterV6BrowserTracingIntegration({
      useEffect: React.useEffect,
      useLocation,
      useNavigationType,
      createRoutesFromChildren,
      matchRoutes,
    })
  ],
});
```

**Error Boundaries:**
- `/packages/frontend/core/src/components/affine/affine-error-boundary/index.tsx`
- Wraps app with Sentry's ErrorBoundary component
- Custom fallback UI for error display

**User Control:**
- Respects same `enableTelemetry` setting as Mixpanel
- When disabled: `sentry.disable()` is called
- When enabled: `sentry.enable()` is called

**Files to Remove/Modify:**
- `/packages/frontend/track/src/sentry.ts`
- `/packages/frontend/apps/electron/src/main/index.ts` (Sentry init section)
- `/packages/frontend/apps/electron/src/preload/bootstrap.ts` (Sentry import)
- `/packages/frontend/core/src/components/affine/affine-error-boundary/index.tsx`
- `/packages/frontend/core/src/desktop/router.tsx` (Sentry router wrapper)
- `/packages/frontend/core/src/mobile/router.tsx` (Sentry router wrapper)

---

### 1.3 Source Maps Upload

**Status:** ⚠️ Active in CI/CD builds
**Impact:** MEDIUM - Enables readable stack traces in Sentry

**Implementation:**

**Webpack Plugin:**
- **Location:** `/tools/cli/src/webpack/index.ts` (lines 278-285)
- **Package:** `@sentry/webpack-plugin` v3.0.0
- **Triggered:** During production builds when `SENTRY_AUTH_TOKEN` is set

**ESBuild Plugin (Electron):**
- **Location:** `/packages/frontend/apps/electron/scripts/common.ts` (lines 43-54)
- **Package:** `@sentry/esbuild-plugin` v3.0.0

**Configuration:**
```typescript
sentryWebpackPlugin({
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
})
```

**GitHub Workflows:**
- `.github/workflows/release-desktop.yml` (lines 47-52, 86-90)
- `.github/workflows/release-mobile.yml` (lines 36-48, 65-76)
- `.github/workflows/build-images.yml` (lines 42-46, 76-80)
- `.github/actions/setup-sentry/action.yml` (Sentry CLI setup)

**Environment Variables:**
- `SENTRY_ORG` - Organization name
- `SENTRY_PROJECT` - Project name (affine/affine-web/affine-admin)
- `SENTRY_AUTH_TOKEN` - Authentication for uploads
- `SENTRY_DSN` - Data source name for error reporting
- `SENTRY_RELEASE` - Release version identifier

**Files to Remove/Modify:**
- `/tools/cli/src/webpack/index.ts` (remove Sentry plugin)
- `/packages/frontend/apps/electron/scripts/common.ts` (remove Sentry plugin)
- All GitHub workflow files (remove Sentry environment variables)
- `.github/actions/setup-sentry/action.yml` (remove entire action)

---

### 1.4 Perfsee Performance Monitoring

**Status:** ⚠️ Active when `PERFSEE_TOKEN` is set
**Impact:** MEDIUM - Performance profiling

**Implementation:**
- **Location:** `/tools/cli/src/webpack/index.ts` (line 277)
- **Package:** `@perfsee/webpack` v1.13.0
- **Project:** 'affine-toeverything'
- **Trigger:** Production builds only

**Files to Remove/Modify:**
- `/tools/cli/src/webpack/index.ts` (remove Perfsee plugin)
- Environment variable: `PERFSEE_TOKEN`

---

### 1.5 BlockSuite Telemetry

**Status:** ⚠️ Integrated with main telemetry system
**Impact:** MEDIUM - Tracks editor-specific interactions

**Implementation:**
- **Location:** `/blocksuite/affine/shared/src/services/telemetry-service/`
- Service interface for BlockSuite editor events
- Delegates to frontend track system

**Event Types:**
- Element creation (shapes, notes, text, images)
- Element updates and modifications
- Document creation (page vs edgeless mode)
- Block creation and manipulation
- Attachment operations (upload, reload)
- Link creation and editing
- LaTeX equation creation
- Mind map interactions
- Element locking
- Tool selection in edgeless mode
- Database view changes
- Citation tracking
- Code block interactions
- Slash menu usage

**Files:**
- `/blocksuite/affine/shared/src/services/telemetry-service/telemetry-service.ts`
- `/blocksuite/affine/shared/src/services/telemetry-service/types.ts`
- `/blocksuite/affine/shared/src/services/telemetry-service/citation.ts`
- `/blocksuite/affine/shared/src/services/telemetry-service/database.ts`
- `/blocksuite/affine/shared/src/services/telemetry-service/code-block.ts`
- `/blocksuite/affine/shared/src/services/telemetry-service/slash-menu.ts`
- `/blocksuite/affine/shared/src/services/telemetry-service/note.ts`
- `/blocksuite/affine/shared/src/services/telemetry-service/link.ts`

---

### 1.6 AI Action Tracking

**Status:** ⚠️ Active when AI features are used
**Impact:** MEDIUM - Detailed AI usage analytics

**Implementation:**
- **Location:** `/packages/frontend/core/src/blocksuite/ai/provider/tracker.ts`
- Tracks all AI copilot interactions

**Events:**
- `AI action invoked` - When user triggers AI
- `AI action aborted` - When AI action is cancelled
- `AI result discarded` - When user rejects AI output
- `AI result accepted` - When user accepts AI output

**Metadata Tracked:**
- Action type (generate, rewrite, translate, etc.)
- Page mode (page/edgeless)
- Segment (toolbar, panel, etc.)
- Module (format bar, chat panel, etc.)
- Object type (doc, note, text, image)
- Control method (how action was triggered)
- Paywall and auth prompts shown

**Files to Remove/Modify:**
- `/packages/frontend/core/src/blocksuite/ai/provider/tracker.ts`

---

## 2. Backend Telemetry & Monitoring

### 2.1 OpenTelemetry (Metrics & Tracing)

**Status:** ⚠️ Optional, disabled by default
**Impact:** HIGH when enabled - Comprehensive server monitoring

**Implementation:**
- **Location:** `/packages/backend/server/src/base/metrics/`
- **Packages:**
  - `@opentelemetry/api` v1.9.0
  - `@opentelemetry/sdk-node` v0.57.2
  - `@opentelemetry/exporter-prometheus` v0.57.2
  - `@opentelemetry/exporter-zipkin` v1.30.1
  - `@google-cloud/opentelemetry-cloud-trace-exporter` v2.4.1
  - `@opentelemetry/host-metrics` v0.36.0

**Instrumentation:**
- NestJS Core
- HTTP requests/responses
- GraphQL queries and mutations
- IORedis operations
- Socket.IO events
- Prisma database queries

**Metric Scopes:**
- `socketio` - WebSocket connection metrics
- `gql` - GraphQL query performance
- `jwst` - JWT operations
- `auth` - Authentication metrics
- `controllers` - API controller timing
- `doc` - Document operations
- `sse` - Server-Sent Events
- `mail` - Email service metrics
- `ai` - AI service usage
- `event` - Event bus metrics
- `queue` - Job queue metrics
- `storage` - Storage operations
- `process` - System process metrics

**Exporters:**
- **Prometheus:** Metrics endpoint at `/metrics`
- **Zipkin:** Distributed tracing export
- **Google Cloud Trace:** For GCP deployments

**Host Metrics:**
- CPU usage
- Memory usage
- System-level metrics

**Configuration:**
```typescript
// config.ts
defineModuleConfig('metrics', {
  enabled: {
    desc: 'Enable metric and tracing collection',
    default: false, // ✅ Disabled by default
  },
});
```

**Trace Sampling:**
- 10% sampling rate (TraceIdRatioBasedSampler with 0.1)
- Service name: 'affine-cloud'

**Files to Remove/Modify:**
- `/packages/backend/server/src/base/metrics/opentelemetry.ts`
- `/packages/backend/server/src/base/metrics/metrics.ts`
- `/packages/backend/server/src/base/metrics/config.ts`
- `/packages/backend/server/src/plugins/gcloud/metrics.ts` (GCP-specific)
- All `@opentelemetry/*` dependencies in package.json

---

### 2.2 Customer.io Integration

**Status:** ⚠️ Optional, disabled by default
**Impact:** MEDIUM - User lifecycle tracking

**Implementation:**
- **Location:** `/packages/backend/server/src/plugins/customerio/`
- **Endpoint:** `https://track.customer.io/api/v1/`
- **Purpose:** Email automation and user lifecycle tracking

**Events Tracked:**
- `user.created` - New user registration
- `user.updated` - Profile updates
- `user.deleted` - Account deletion

**Data Transmitted:**
- User ID
- Name
- Email address
- Account creation timestamp

**Configuration:**
```typescript
defineModuleConfig('customerIo', {
  enabled: {
    desc: 'Enable customer.io integration',
    default: false, // ✅ Disabled by default
  },
  token: {
    desc: 'Customer.io token',
    default: '',
  },
});
```

**API Operations:**
1. `PUT /api/v1/customers/{userId}` - Create/update customer
2. `POST /api/v1/customers/{email}/suppress` - Suppress emails
3. `DELETE /api/v1/customers/{userId}` - Delete customer

**Files to Remove/Modify:**
- `/packages/backend/server/src/plugins/customerio/service.ts`
- `/packages/backend/server/src/plugins/customerio/config.ts`
- `/packages/backend/server/src/plugins/customerio/index.ts`

---

## 3. Mobile Platform Telemetry

### 3.1 Firebase (Android)

**Status:** ⚠️ Active on Android builds
**Impact:** HIGH - Crash reporting and analytics

**Implementation:**

**Firebase Crashlytics:**
- **Location:** `/packages/frontend/apps/android/App/app/src/main/java/app/affine/pro/utils/logger/CrashlyticsTree.kt`
- **Purpose:** Crash reporting and error logging
- Timber logging tree that forwards to Firebase
- Logs: INFO, WARN, ERROR, ASSERT levels
- Records exceptions automatically
- Custom keys: `affine_version`

**Firebase Analytics:**
- Included via Firebase SDK
- Event tracking on Android

**Initialization:**
- **File:** `/packages/frontend/apps/android/App/app/src/main/java/app/affine/pro/AFFiNEApp.kt`
- Only active in release builds
- Debug builds use `AffineDebugTree` (local logging only)

**Configuration:**
- **Build file:** `/packages/frontend/apps/android/App/app/build.gradle`
- Plugin: `firebase.crashlytics`
- Google Services integration required

**Files to Remove/Modify:**
- `/packages/frontend/apps/android/App/app/src/main/java/app/affine/pro/utils/logger/CrashlyticsTree.kt`
- `/packages/frontend/apps/android/App/app/src/main/java/app/affine/pro/AFFiNEApp.kt` (remove Firebase init)
- `/packages/frontend/apps/android/App/app/build.gradle` (remove Firebase plugin)
- Remove `google-services.json` configuration

---

### 3.2 App Tracking Transparency (iOS)

**Status:** ⚠️ Active on iOS builds
**Impact:** MEDIUM - Requests tracking permission

**Implementation:**
- **Location:** `/packages/frontend/apps/ios/src/app.tsx`
- **Package:** `@capacitor-community/app-tracking-transparency`
- **Purpose:** Compliance with Apple's App Tracking Transparency requirements

**Behavior:**
- Requests tracking permission on app startup
- Required for any tracking on iOS 14.5+
- If permission denied, should disable all tracking

**Code:**
```typescript
AppTrackingTransparency.requestPermission()
```

**Files to Remove/Modify:**
- `/packages/frontend/apps/ios/src/app.tsx` (remove ATT request)
- Package dependency: `@capacitor-community/app-tracking-transparency`

---

## 4. Auto-Update Mechanism

### 4.1 Electron Auto-Updater

**Status:** ⚠️ Active by default in Electron, user can disable
**Impact:** MEDIUM - Phones home for updates

**Implementation:**
- **Location:** `/packages/frontend/apps/electron/src/main/updater/`
- **Package:** `electron-updater`
- **Update endpoint:** `https://affine.pro/api/worker/releases`

**Files:**
- `electron-updater.ts` - Main orchestrator
- `affine-update-provider.ts` - Custom provider for AFFiNE releases
- `windows-updater.ts` - Windows-specific implementation

**Behavior:**
1. Checks for updates when app window gains focus
2. Minimum interval: 30 minutes between checks
3. Queries: `https://affine.pro/api/worker/releases?channel={buildType}&minimal=true`
4. Downloads update metadata from GitHub releases (via AFFiNE proxy)
5. Can auto-download updates if configured

**Configuration:**
- User settings:
  - `autoCheckUpdate` (default: true in stable/beta)
  - `autoDownloadUpdate` (default: false)
- Disabled in:
  - Development mode
  - "internal" build type

**Update Flow:**
```typescript
// Line 142-155 in electron-updater.ts
app.on('browser-window-focus', () => {
  if (configured && config.autoCheckUpdate &&
      lastCheckTime + 1000 * 1800 < Date.now()) {
    await checkForUpdates();
  }
});
```

**Data Transmitted:**
- Build channel (stable/beta/canary)
- Current app version (implicit in update check)
- Platform/architecture (implicit)

**User Control:**
- Settings UI for auto-check and auto-download
- Can be completely disabled
- Update prompts shown to user before installation

**Files to Remove/Modify:**
- `/packages/frontend/apps/electron/src/main/updater/electron-updater.ts`
- `/packages/frontend/apps/electron/src/main/updater/affine-update-provider.ts`
- `/packages/frontend/apps/electron/src/main/updater/windows-updater.ts`
- `/packages/frontend/apps/electron/src/main/updater/custom-github-provider.ts`

---

## 5. Payment & Subscription Services

### 5.1 Stripe

**Status:** ⚠️ Active when payment features are used
**Impact:** HIGH - Payment processing

**Implementation:**
- **Location:** `/packages/backend/server/src/plugins/payment/stripe.ts`
- **Package:** `stripe` v17.4.0
- **Purpose:** Primary payment processor

**Data Transmitted:**
- Customer information
- Payment methods
- Subscription data
- Billing information
- Webhook events

**Note:** Essential for payment features but not needed for self-hosted deployments without subscriptions.

**Files to Remove/Modify:**
- `/packages/backend/server/src/plugins/payment/stripe.ts`
- All Stripe webhook handlers
- Frontend Stripe integration components

---

### 5.2 RevenueCat

**Status:** ⚠️ Active for mobile in-app purchases
**Impact:** HIGH - Mobile subscription management

**Implementation:**
- **Location:** `/packages/backend/server/src/plugins/payment/revenuecat/service.ts`
- **API Base:** `https://api.revenuecat.com`
- **Purpose:** Manage App Store and Google Play subscriptions

**Endpoints:**
1. `/v1/subscribers/identify` - Link user IDs
2. `/v2/projects/{projectId}/entitlements/{entId}` - Get entitlements
3. `/v2/projects/{projectId}/customers/{customerId}/aliases` - Get aliases
4. `/v2/projects/{projectId}/subscriptions` - Get subscriptions
5. `/v2/projects/{projectId}/customers/{customerId}/subscriptions` - User subscriptions

**Data Transmitted:**
- User IDs (app_user_id)
- Subscription identifiers
- Customer IDs
- Receipt validation data

**Configuration:**
- `REVENUECAT_API_KEY` - API authentication
- Project ID configuration

**Files to Remove/Modify:**
- `/packages/backend/server/src/plugins/payment/revenuecat/service.ts`
- `/packages/backend/server/src/plugins/payment/revenuecat/config.ts`
- RevenueCat-related frontend code in mobile apps

---

## 6. CAPTCHA & Security Services

### 6.1 Cloudflare Turnstile

**Status:** ⚠️ Active when CAPTCHA is enabled
**Impact:** MEDIUM - Anti-bot verification

**Implementation:**

**Frontend:**
- **Location:** `/packages/frontend/core/src/components/sign-in/captcha.tsx`
- **Package:** `@marsidev/react-turnstile` v1.1.0
- **Site Key:** `BUILD_CONFIG.CAPTCHA_SITE_KEY`

**Backend:**
- **Location:** `/packages/backend/server/src/plugins/captcha/service.ts`
- **Endpoint:** `https://challenges.cloudflare.com/turnstile/v0/siteverify`

**Verification Flow:**
1. User completes CAPTCHA challenge
2. Frontend receives token
3. Backend verifies with Cloudflare

**Data Transmitted:**
- CAPTCHA token
- User IP address
- Secret key
- Idempotency key

**Configuration:**
- `CAPTCHA_SITE_KEY` - Public site key
- `CAPTCHA_SECRET` - Secret key for verification
- `CAPTCHA_ENABLED` - Enable/disable flag

**Files to Remove/Modify:**
- `/packages/frontend/core/src/components/sign-in/captcha.tsx`
- `/packages/backend/server/src/plugins/captcha/service.ts`
- `/packages/backend/server/src/plugins/captcha/config.ts`

---

## 7. AI Model Services (Backend)

**Status:** ⚠️ Active when AI features are used
**Impact:** HIGH - Sends user content to external AI providers

### 7.1 OpenAI

**Implementation:**
- **Location:** `/packages/backend/server/src/plugins/copilot/providers/openai.ts`
- **Package:** `@ai-sdk/openai` v2.0.56
- **Endpoint:** `https://api.openai.com/v1` (configurable)

**Models:**
- GPT-4, GPT-4o, GPT-3.5 (chat completions)
- DALL-E (image generation)
- text-embedding-ada-002 (embeddings)

**Data Transmitted:**
- User prompts
- Document content for context
- Generated content
- Usage metrics

---

### 7.2 Anthropic (Claude)

**Implementation:**
- **Location:**
  - `providers/anthropic/official.ts` - Official API
  - `providers/anthropic/vertex.ts` - Google Vertex AI integration
- **Package:** `@ai-sdk/anthropic` v2.0.38
- **Endpoint:** `https://api.anthropic.com/v1`

**Models:**
- Claude Sonnet
- Claude Opus
- Claude Haiku

---

### 7.3 Google Gemini

**Implementation:**
- **Location:**
  - `providers/gemini/gemini.ts` - Google AI
  - `providers/gemini/vertex.ts` - Vertex AI
- **Packages:**
  - `@ai-sdk/google` v2.0.24
  - `@ai-sdk/google-vertex` v3.0.54
- **Endpoint:** `https://generativelanguage.googleapis.com/v1beta`

**Models:**
- Gemini Pro
- Gemini Flash
- text-embedding-004

---

### 7.4 FAL.ai

**Implementation:**
- **Location:** `/packages/backend/server/src/plugins/copilot/providers/fal.ts`
- **Package:** `@fal-ai/serverless-client` v0.15.0
- **Endpoint:** `https://fal.run/fal-ai/*`

**Purpose:** Image generation and manipulation
- Flux
- SDXL
- Image upscaling
- Background removal

---

### 7.5 Other AI Services

- **Perplexity** (`@ai-sdk/perplexity` v2.0.14) - Search-augmented AI
- **Exa** (`exa-js` v1.6.13) - Web search for AI context
- **Unsplash** - Stock photo search

**AI Model Storage:**
- `https://models.affine.pro/fal/` - Custom model files

**Files to Remove/Modify:**
- Entire `/packages/backend/server/src/plugins/copilot/providers/` directory
- AI configuration in backend server
- Frontend AI components

---

## 8. Cloud Services & Storage

### 8.1 AWS S3

**Status:** ⚠️ Active when cloud storage is configured
**Impact:** HIGH - Stores user files

**Implementation:**
- **Location:** `/packages/backend/server/src/base/storage/providers/s3.ts`
- **Packages:**
  - `@aws-sdk/client-s3` v3.779.0
  - `@aws-sdk/s3-request-presigner` v3.779.0

**Operations:**
- File upload/download
- Presigned URL generation
- Blob storage

**Note:** Configurable for self-hosted S3-compatible storage.

---

### 8.2 Cloudflare R2

**Status:** ⚠️ Alternative to S3
**Implementation:** `/packages/backend/server/src/base/storage/providers/r2.ts`
**Note:** S3-compatible API with custom presigned URL handling.

---

### 8.3 Build Asset Upload

**Status:** ⚠️ Active during CI/CD builds
**Implementation:**
- **Location:** `/tools/cli/src/webpack/s3-plugin.ts`
- **Purpose:** Upload build assets to CDN during release builds

**Files to Remove/Modify:**
- `/tools/cli/src/webpack/s3-plugin.ts`

---

## 9. Authentication Services

### 9.1 OAuth Providers

**Status:** ⚠️ Active when users sign in with OAuth
**Impact:** MEDIUM - Third-party authentication

**Providers:**
- **Google OAuth** (`/packages/backend/server/src/plugins/oauth/providers/google.ts`)
- **GitHub OAuth** (`providers/github.ts`)
- **Apple OAuth** (configured in `config.ts`)
- **OIDC** (Generic OpenID Connect - `providers/oidc.ts`)

**Package:** `google-auth-library` v10.2.0

**Data Transmitted:**
- Authentication tokens
- User profile information (name, email, avatar)
- OAuth authorization codes

**Note:** Can be replaced with self-hosted OIDC provider or disabled entirely.

---

## 10. Communication Services

### 10.1 Email (SMTP)

**Status:** ⚠️ Active when email features are configured
**Impact:** MEDIUM - Sends user emails

**Implementation:**
- **Location:** `/packages/backend/server/src/core/mail/config.ts`
- **Package:** `nodemailer` v7.0.0

**Configuration:**
- Primary SMTP server
- Fallback SMTP server
- Environment variables:
  - `MAILER_HOST`
  - `MAILER_USER`
  - `MAILER_PASSWORD`

**Email Templates:**
- **Package:** `@react-email/components` v0.0.38
- Templates for verification, password reset, notifications

**Note:** Fully configurable for self-hosted SMTP servers.

---

### 10.2 Real-Time Sync (Socket.IO)

**Status:** ✅ Self-hosted (not a third-party service)
**Impact:** LOW - Required for real-time collaboration

**Implementation:**
- **Location:** `/packages/backend/server/src/core/sync/gateway.ts`
- **Packages:**
  - `socket.io` v4.8.1 (server)
  - `socket.io-client` v4.8.1 (client)
  - `@socket.io/redis-adapter` v8.3.0

**Purpose:** Document synchronization and real-time collaboration
**Note:** Runs on your own server, but uses Redis for scaling.

---

## 11. External Content & Embeds

### 11.1 Link Preview Service

**Status:** ⚠️ Active when users paste URLs
**Impact:** LOW - Fetches link metadata

**Implementation:**
- **Endpoint:** `/api/worker/link-preview` (relative to AFFiNE server)
- **Location:** `/packages/frontend/core/src/blocksuite/view-extensions/link-preview-service/`

**Flow:**
1. User pastes URL in document
2. Frontend requests preview from AFFiNE worker
3. Worker fetches metadata (title, description, image)
4. Returns structured data

**Note:** Runs on AFFiNE servers, not a third-party service.

---

### 11.2 Image Proxy Service

**Status:** ⚠️ Active for external images
**Implementation:**
- **Endpoint:** `/api/worker/image-proxy`
- **Purpose:** Proxy external images to avoid CORS issues

**Note:** Runs on AFFiNE servers.

---

### 11.3 Embedded Content (Third-Party Iframes)

**Status:** ⚠️ Active when users embed content
**Impact:** MEDIUM - Loads external resources

**Embeds:**
- **YouTube** (`blocksuite/affine/blocks/embed/src/embed-youtube-block/`)
- **Loom** (`embed-loom-block/`)
- **Figma** (various embed configs)

**Behavior:**
- Loads iframe from external service
- External service can track views
- Privacy implication: third-party receives user IP

**Note:** User-initiated, but consider adding privacy warnings.

---

## 12. Development & Build Tools

### 12.1 Local Logging (Not External)

**Status:** ✅ Local only (no external transmission)

**Electron Logger:**
- **Location:** `/packages/frontend/apps/electron/src/main/logger.ts`
- **Package:** `electron-log` v5.4.3
- **Transports:** File and Console only
- **Storage:** Local file system

**Android Logger:**
- **Timber** framework with local file logging
- Only CrashlyticsTree sends to external service (see section 3.1)

---

## 13. Hardcoded External URLs

**Status:** ⚠️ Links to AFFiNE services
**Impact:** LOW - Informational links

**Official URLs in Codebase:**
- `https://affine.pro/what-is-new` - Changelog
- `https://affine.pro/download` - Download page
- `https://affine.pro/pricing` - Pricing
- `https://affine.pro/redirect/discord` - Discord invite
- `https://affine.pro/redirect/license` - License requests
- `https://affine.pro/templates` - Template gallery
- `https://community.affine.pro` - Community forum
- `https://docs.affine.pro` - Documentation
- `https://cdn.affine.pro/error.png` - Error page asset

**Testing/Development:**
- `https://affine.fail` - Canary testing
- `https://insider.affine.pro` - Beta/Internal builds

**Note:** These are mostly UI links, low privacy impact.

---

## 14. Configuration & Environment Variables

### Frontend Build Configuration

**File:** `/tools/utils/src/build-config.ts`

**Key Variables:**
- `SENTRY_DSN` - Sentry error tracking
- `MIXPANEL_TOKEN` - Mixpanel analytics
- `CAPTCHA_SITE_KEY` - Turnstile CAPTCHA
- `PERFSEE_TOKEN` - Performance monitoring
- `DEBUG_JOTAI` - State debugging flag

### Backend Configuration

**Self-Hosted Config:** `.docker/selfhost/schema.json`

**Metrics:**
```typescript
metrics: {
  enabled: false, // Disabled by default
}
```

**Customer.io:**
```typescript
customerIo: {
  enabled: false, // Disabled by default
  token: '',
}
```

**CAPTCHA:**
```typescript
captcha: {
  enabled: true,
  turnstile: {
    secret: '',
  }
}
```

---

## 15. User Privacy Controls

### Current Privacy Settings

**Storage Location:** localStorage, key: `affine-settings`

**Setting:**
```typescript
{
  enableTelemetry: true, // ⚠️ DEFAULT IS TRUE (opt-out model)
}
```

**UI Control:**
- Settings → About → Enable Telemetry (toggle switch)
- When disabled:
  - Sentry: `sentry.disable()`
  - Mixpanel: `mixpanel.opt_out_tracking()`

**Impact of Disabling:**
- ✅ Stops Mixpanel event tracking
- ✅ Stops Sentry error reporting
- ❌ Does NOT stop auto-update checks
- ❌ Does NOT stop payment service communications
- ❌ Does NOT stop AI service requests
- ❌ Does NOT stop OAuth communications

---

## Removal Strategy for Self-Hosted Deployments

### Phase 1: Frontend Telemetry (PRIORITY: HIGH)

**Goal:** Remove all analytics and error tracking from client applications.

**Actions:**
1. **Remove Mixpanel:**
   - Delete `/packages/frontend/track/src/mixpanel.ts`
   - Delete `/packages/frontend/track/src/events.ts`
   - Delete `/packages/frontend/track/src/auto.ts`
   - Remove all `track.` function calls (150+ files)
   - Remove package: `mixpanel-browser`

2. **Remove Sentry:**
   - Delete `/packages/frontend/track/src/sentry.ts`
   - Remove Sentry from Electron main process
   - Remove error boundary Sentry integration
   - Remove source map upload plugins
   - Remove packages: `@sentry/react`, `@sentry/electron`
   - Remove GitHub workflow Sentry steps

3. **Remove Perfsee:**
   - Remove webpack plugin
   - Remove package: `@perfsee/webpack`

4. **Remove Telemetry Service:**
   - Delete `/packages/frontend/core/src/modules/telemetry/` directory
   - Delete `/packages/frontend/core/src/bootstrap/telemetry.ts`
   - Delete `/packages/frontend/core/src/components/telemetry/`

5. **Remove BlockSuite Telemetry:**
   - Delete `/blocksuite/affine/shared/src/services/telemetry-service/` directory
   - Remove all telemetry service registrations

6. **Remove AI Tracking:**
   - Delete `/packages/frontend/core/src/blocksuite/ai/provider/tracker.ts`
   - Remove tracking calls from AI components

### Phase 2: Backend Telemetry (PRIORITY: HIGH)

**Actions:**
1. **Remove OpenTelemetry:**
   - Delete `/packages/backend/server/src/base/metrics/` directory
   - Delete `/packages/backend/server/src/plugins/gcloud/metrics.ts`
   - Remove all `@opentelemetry/*` packages
   - Remove Prometheus, Zipkin exporters

2. **Remove Customer.io:**
   - Delete `/packages/backend/server/src/plugins/customerio/` directory
   - Remove customer.io event listeners

3. **Remove Backend Mixpanel:**
   - Search for backend `mixpanel` package usage
   - Remove any server-side event tracking

### Phase 3: Mobile Telemetry (PRIORITY: HIGH)

**Actions:**
1. **Remove Firebase (Android):**
   - Delete `/packages/frontend/apps/android/App/app/src/main/java/app/affine/pro/utils/logger/CrashlyticsTree.kt`
   - Remove Firebase initialization from `AFFiNEApp.kt`
   - Remove Firebase plugins from `build.gradle`
   - Remove `google-services.json`

2. **Remove App Tracking Transparency (iOS):**
   - Remove ATT request from `/packages/frontend/apps/ios/src/app.tsx`
   - Remove package: `@capacitor-community/app-tracking-transparency`

### Phase 4: Auto-Update (PRIORITY: MEDIUM)

**Options:**
1. **Disable by Default:**
   - Change default `autoCheckUpdate` to `false`
   - Change default `autoDownloadUpdate` to `false`

2. **Complete Removal:**
   - Delete `/packages/frontend/apps/electron/src/main/updater/` directory
   - Remove `electron-updater` package
   - Remove update UI components

3. **Self-Hosted Update Server:**
   - Implement custom update endpoint
   - Point to self-hosted release server

### Phase 5: External Services (PRIORITY: MEDIUM)

**Actions:**
1. **Remove CAPTCHA:**
   - Delete captcha components
   - Delete backend captcha plugin
   - Remove Turnstile package

2. **Make OAuth Optional:**
   - Ensure all OAuth providers can be disabled
   - Add configuration flags for each provider
   - Implement email/password-only authentication mode

3. **Remove Payment Services (if not needed):**
   - Delete Stripe plugin
   - Delete RevenueCat plugin
   - Remove payment UI components

### Phase 6: AI Services (PRIORITY: LOW)

**Note:** AI services are user-initiated and require API keys. For self-hosted:
- Document how to use self-hosted AI models
- Add support for local LLM APIs (Ollama, LM Studio, etc.)
- Make all AI providers optional and configurable

### Phase 7: Configuration Changes (PRIORITY: HIGH)

**Actions:**
1. **Change Telemetry Default:**
   ```typescript
   // In settings.ts
   enableTelemetry: false, // Change from true to false
   ```

2. **Add Self-Hosted Mode Detection:**
   - Detect if running in self-hosted environment
   - Automatically disable all telemetry
   - Show warning if telemetry code is reached in self-hosted mode

3. **Environment Variables:**
   - Remove all telemetry-related environment variables from examples
   - Add `.env.selfhosted` template without telemetry

4. **Build Configuration:**
   - Add `SELF_HOSTED=true` build flag
   - Exclude telemetry code when building for self-hosted
   - Use webpack DefinePlugin to strip telemetry code

### Phase 8: Documentation (PRIORITY: HIGH)

**Actions:**
1. Create `SELF_HOSTED_PRIVACY.md` document explaining:
   - What was removed
   - What remains (if anything)
   - How to verify no data is sent
   - Network endpoints that are still contacted

2. Update build documentation:
   - How to build without telemetry
   - How to verify telemetry-free builds

3. Create testing checklist:
   - Network monitoring to verify no external calls
   - Steps to audit self-hosted deployment

---

## Testing Strategy

### Network Monitoring
1. **Browser DevTools:**
   - Monitor Network tab for all requests
   - Filter for external domains
   - Verify only user-initiated requests occur

2. **Desktop App:**
   - Use network proxy (Charles, Fiddler, mitmproxy)
   - Monitor all HTTP/HTTPS traffic
   - Verify no telemetry endpoints contacted

3. **Mobile Apps:**
   - Use platform-specific network monitoring
   - Verify no Firebase, analytics, or tracking requests

### Automated Testing
1. **Unit Tests:**
   - Mock telemetry functions
   - Verify they're never called in self-hosted mode

2. **Integration Tests:**
   - Test full user workflows
   - Assert no external requests except user-initiated ones

3. **Build Verification:**
   - Check built bundles for telemetry code
   - Verify environment variables not embedded

---

## Verification Checklist

After removing telemetry, verify:

- [ ] No requests to `telemetry.affine.run`
- [ ] No requests to `sentry.io`
- [ ] No Mixpanel tracking calls
- [ ] No Sentry error reports
- [ ] No auto-update checks (or user-controlled only)
- [ ] No Firebase requests (Android)
- [ ] No App Tracking Transparency prompts (iOS)
- [ ] No Customer.io requests
- [ ] No OpenTelemetry exports
- [ ] No Perfsee uploads
- [ ] localStorage `enableTelemetry` defaults to false
- [ ] Build process doesn't upload source maps
- [ ] CI/CD workflows don't set telemetry environment variables
- [ ] All external service API keys are optional
- [ ] Documentation clearly states what's removed

---

## Risk Assessment

### Low Risk Removals (Safe to Remove)
- ✅ Mixpanel analytics
- ✅ Sentry error tracking
- ✅ OpenTelemetry metrics
- ✅ Customer.io
- ✅ Perfsee
- ✅ Firebase Crashlytics
- ✅ Source map uploads

### Medium Risk Removals (May Affect Features)
- ⚠️ Auto-updater (users need manual updates)
- ⚠️ CAPTCHA (may need alternative anti-bot)
- ⚠️ OAuth (need alternative auth methods)

### High Risk Removals (Core Features)
- ❌ Payment services (needed for subscriptions)
- ❌ AI services (core features require AI)
- ❌ Email service (needed for auth, notifications)
- ❌ Storage services (S3/R2 needed for file storage)

**Recommendation:** Keep high-risk services but make them configurable for self-hosted alternatives.

---

## Recommended Implementation Plan

### For Pure Self-Hosted (No External Services)

**Minimum Required:**
1. Remove all analytics (Mixpanel, Sentry, OpenTelemetry, Firebase)
2. Disable auto-updates or point to self-hosted update server
3. Remove Customer.io
4. Make CAPTCHA optional
5. Configure OAuth to use self-hosted OIDC or disable entirely
6. Use self-hosted storage (MinIO, self-hosted S3)
7. Use self-hosted SMTP for email
8. Use local or self-hosted AI models (optional)

**Configuration Flag:**
Add `AFFINE_SELF_HOSTED=true` environment variable that:
- Disables all telemetry at build time
- Removes telemetry code from bundles
- Defaults all external services to disabled
- Shows warnings if external services are misconfigured

### Build-Time Optimization

Use webpack DefinePlugin to completely remove telemetry code:
```javascript
new webpack.DefinePlugin({
  'process.env.AFFINE_SELF_HOSTED': JSON.stringify(process.env.AFFINE_SELF_HOSTED || 'false'),
})
```

Then wrap all telemetry code:
```typescript
if (process.env.AFFINE_SELF_HOSTED !== 'true') {
  // Telemetry code here - will be stripped by webpack
}
```

This ensures zero telemetry code is even included in self-hosted builds.

---

## Summary Statistics

**Total External Services Identified:** 25+
**Telemetry/Analytics Services:** 6 (Mixpanel, Sentry, OpenTelemetry, Perfsee, Firebase Analytics, Customer.io)
**Error Reporting Services:** 3 (Sentry, Firebase Crashlytics, OpenTelemetry)
**Payment Services:** 2 (Stripe, RevenueCat)
**AI Services:** 7+ (OpenAI, Anthropic, Google, FAL.ai, Perplexity, Exa, Unsplash)
**Auth Services:** 4+ (Google, GitHub, Apple, OIDC)
**Infrastructure Services:** 5+ (S3, R2, SMTP, Socket.IO/Redis, PostgreSQL)

**Files to Modify/Remove:** 200+ files
**Package Dependencies to Remove:** 30+ packages

**Default Telemetry State:** OPT-OUT (enabled by default)
**Recommended for Self-Hosted:** OPT-IN (disabled by default) or completely removed

---

## Next Steps

1. **Review this audit** with your team
2. **Decide on removal scope:**
   - Complete removal for self-hosted builds?
   - Optional removal via configuration?
   - Build-time conditional compilation?
3. **Prioritize removals** based on risk assessment
4. **Implement removal** in phases
5. **Test thoroughly** with network monitoring
6. **Document** the self-hosted privacy guarantees
7. **Create self-hosted build variant** without any telemetry

---

**Audit completed:** 2025-11-17
**Document version:** 1.0
**Auditor:** Claude Code Agent
