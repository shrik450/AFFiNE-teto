# AFFiNE Telemetry Removal Implementation Plan

**Strategy:** Minimal-conflict approach using stub replacements
**Goal:** Remove all automatic telemetry while maintaining upstream merge compatibility

## Implementation Approach

To minimize conflicts with upstream updates:
1. **Replace, don't modify** - Replace entire telemetry modules with no-op stubs
2. **Preserve APIs** - Keep function signatures so consuming code doesn't change
3. **Delete dedicated files** - Remove files that only contain telemetry logic
4. **Minimal touchpoints** - Don't modify the 150+ files that call telemetry functions

This approach means:
- ✅ Business logic files remain unchanged (minimal merge conflicts)
- ✅ Telemetry calls become no-ops without code changes
- ✅ New upstream features work, their telemetry is automatically neutralized
- ⚠️ Need to update stubs if upstream adds new telemetry exports

---

## Phase 1: Frontend Analytics & Tracking

### 1.1 Mixpanel Analytics Removal
**Impact:** Removes 874+ tracked events, all user behavior analytics

- [ ] **Replace `/packages/frontend/track/` module with stubs**
  - [ ] Replace `src/index.ts` - Export no-op track functions
  - [ ] Replace `src/mixpanel.ts` - No-op Mixpanel client
  - [ ] Delete `src/events.ts` - Event type definitions (874 lines)
  - [ ] Delete `src/auto.ts` - Auto-tracking system
  - [ ] Delete `src/types.ts` - Type definitions
  - [ ] Update `package.json` - Remove `mixpanel-browser` dependency

- [ ] **Remove Mixpanel from backend**
  - [ ] Search and remove `mixpanel` package usage in backend
  - [ ] Remove backend Mixpanel event tracking

### 1.2 Telemetry Service Integration
**Impact:** Removes telemetry orchestration and user identification

- [ ] **Replace telemetry service with no-op**
  - [ ] Replace `/packages/frontend/core/src/modules/telemetry/` with stub module
  - [ ] Replace `/packages/frontend/core/src/bootstrap/telemetry.ts` with no-op initialization
  - [ ] Delete `/packages/frontend/core/src/components/telemetry/index.tsx` component

### 1.3 BlockSuite Editor Telemetry
**Impact:** Removes editor interaction tracking

- [ ] **Replace BlockSuite telemetry service with no-op**
  - [ ] Replace `/blocksuite/affine/shared/src/services/telemetry-service/telemetry-service.ts`
  - [ ] Delete event type files:
    - [ ] `citation.ts`
    - [ ] `database.ts`
    - [ ] `code-block.ts`
    - [ ] `slash-menu.ts`
    - [ ] `note.ts`
    - [ ] `link.ts`
    - [ ] `types.ts`

### 1.4 AI Action Tracking
**Impact:** Removes AI feature usage analytics

- [ ] **Remove AI tracking**
  - [ ] Replace `/packages/frontend/core/src/blocksuite/ai/provider/tracker.ts` with no-op

---

## Phase 2: Error Reporting & Monitoring

### 2.1 Sentry Frontend
**Impact:** Removes error reporting and performance tracing

- [ ] **Replace Sentry module with no-op**
  - [ ] Replace `/packages/frontend/track/src/sentry.ts` with stub
  - [ ] Remove `@sentry/react` dependency from package.json

- [ ] **Remove Sentry from error boundaries**
  - [ ] Modify `/packages/frontend/core/src/components/affine/affine-error-boundary/index.tsx`
    - Replace Sentry ErrorBoundary with React ErrorBoundary
    - Keep error display UI, remove Sentry reporting

- [ ] **Remove Sentry from routers**
  - [ ] Modify `/packages/frontend/core/src/desktop/router.tsx`
    - Remove `wrapCreateBrowserRouterV6` from Sentry
  - [ ] Modify `/packages/frontend/core/src/mobile/router.tsx`
    - Remove `wrapCreateBrowserRouterV6` from Sentry

### 2.2 Sentry Electron
**Impact:** Removes error reporting from desktop app

- [ ] **Remove Sentry from Electron**
  - [ ] Modify `/packages/frontend/apps/electron/src/main/index.ts`
    - Delete Sentry initialization (lines 110-125)
  - [ ] Modify `/packages/frontend/apps/electron/src/preload/bootstrap.ts`
    - Remove Sentry import
  - [ ] Remove `@sentry/electron` dependency

### 2.3 Source Map Uploads
**Impact:** Stops uploading source maps to Sentry

- [ ] **Remove Sentry build plugins**
  - [ ] Modify `/tools/cli/src/webpack/index.ts`
    - Remove `@sentry/webpack-plugin` (lines 278-285)
    - Remove custom SourceMapDevToolPlugin for Sentry (lines 292-298)
  - [ ] Modify `/packages/frontend/apps/electron/scripts/common.ts`
    - Remove `@sentry/esbuild-plugin` (lines 43-54)
  - [ ] Remove plugin dependencies:
    - [ ] `@sentry/webpack-plugin`
    - [ ] `@sentry/esbuild-plugin`

- [ ] **Clean up CI/CD workflows**
  - [ ] Modify `.github/workflows/release-desktop.yml`
    - Remove Sentry env vars (lines 47-52, 86-90)
  - [ ] Modify `.github/workflows/release-mobile.yml`
    - Remove Sentry env vars (lines 36-48, 65-76)
  - [ ] Modify `.github/workflows/build-images.yml`
    - Remove Sentry env vars (lines 42-46, 76-80)
  - [ ] Delete `.github/actions/setup-sentry/action.yml` (entire file)

### 2.4 Perfsee Performance Monitoring
**Impact:** Removes performance profiling

- [ ] **Remove Perfsee**
  - [ ] Modify `/tools/cli/src/webpack/index.ts`
    - Remove Perfsee plugin (line 277)
  - [ ] Remove `@perfsee/webpack` dependency

---

## Phase 3: Backend Monitoring

### 3.1 OpenTelemetry
**Impact:** Removes backend metrics and tracing (already disabled by default)

- [ ] **Delete OpenTelemetry module**
  - [ ] Delete `/packages/backend/server/src/base/metrics/` directory
  - [ ] Delete `/packages/backend/server/src/plugins/gcloud/metrics.ts`
  - [ ] Remove OpenTelemetry dependencies from backend package.json:
    - [ ] `@opentelemetry/api`
    - [ ] `@opentelemetry/sdk-node`
    - [ ] `@opentelemetry/exporter-prometheus`
    - [ ] `@opentelemetry/exporter-zipkin`
    - [ ] `@google-cloud/opentelemetry-cloud-trace-exporter`
    - [ ] `@opentelemetry/host-metrics`
    - [ ] All `@opentelemetry/instrumentation-*` packages
  - [ ] Remove metrics module registration from backend bootstrap

### 3.2 Customer.io
**Impact:** Removes user lifecycle tracking (already disabled by default)

- [ ] **Delete Customer.io plugin**
  - [ ] Delete `/packages/backend/server/src/plugins/customerio/` directory
  - [ ] Remove customer.io event listeners from user service
  - [ ] Remove customer.io module registration

---

## Phase 4: Mobile Platform Telemetry

### 4.1 Firebase (Android)
**Impact:** Removes Android crash reporting and analytics

- [ ] **Remove Firebase Crashlytics**
  - [ ] Delete `/packages/frontend/apps/android/App/app/src/main/java/app/affine/pro/utils/logger/CrashlyticsTree.kt`
  - [ ] Modify `/packages/frontend/apps/android/App/app/src/main/java/app/affine/pro/AFFiNEApp.kt`
    - Remove Firebase initialization
    - Remove Crashlytics custom keys
  - [ ] Modify `/packages/frontend/apps/android/App/app/build.gradle`
    - Remove `firebase.crashlytics` plugin
    - Remove Firebase dependencies
  - [ ] Delete `google-services.json` (if exists)

### 4.2 App Tracking Transparency (iOS)
**Impact:** Removes tracking permission request on iOS

- [ ] **Remove ATT**
  - [ ] Modify `/packages/frontend/apps/ios/src/app.tsx`
    - Remove `AppTrackingTransparency.requestPermission()` call
  - [ ] Remove `@capacitor-community/app-tracking-transparency` dependency

---

## Phase 5: Auto-Update Mechanism

### 5.1 Disable Auto-Update Checks
**Impact:** Stops automatic version checks to affine.pro

**Option A: Disable by default (keep functionality)**
- [ ] **Change update defaults**
  - [ ] Find update settings defaults
  - [ ] Set `autoCheckUpdate: false` as default
  - [ ] Set `autoDownloadUpdate: false` as default

**Option B: Complete removal (breaks update functionality)**
- [ ] **Delete auto-updater**
  - [ ] Delete `/packages/frontend/apps/electron/src/main/updater/` directory
  - [ ] Remove `electron-updater` dependency
  - [ ] Remove update UI components
  - [ ] Remove update-related event handlers

---

## Phase 6: Build Configuration & Environment

### 6.1 Remove Telemetry Environment Variables
**Impact:** Clean up build configuration

- [ ] **Update build config**
  - [ ] Modify `/tools/utils/src/build-config.ts`
    - Remove `SENTRY_DSN` variable
    - Remove `MIXPANEL_TOKEN` variable
    - Remove `PERFSEE_TOKEN` variable
  - [ ] Update `.env.example` files (if they exist)
    - Remove telemetry-related examples

### 6.2 Remove Telemetry Settings
**Impact:** Remove user-facing telemetry toggle

- [ ] **Clean up settings**
  - [ ] Modify `/packages/common/infra/src/atom/settings.ts`
    - Remove `enableTelemetry` setting
  - [ ] Remove telemetry toggle from About settings page
    - Find and modify: `/packages/frontend/core/src/desktop/dialogs/setting/general-setting/about/index.tsx`

---

## Phase 7: Optional Services (Uncheck if you want to keep these)

### 7.1 CAPTCHA Service
**Impact:** Removes anti-bot protection (may need alternative)

- [ ] **Remove Cloudflare Turnstile**
  - [ ] Delete `/packages/frontend/core/src/components/sign-in/captcha.tsx`
  - [ ] Delete `/packages/backend/server/src/plugins/captcha/` directory
  - [ ] Remove `@marsidev/react-turnstile` dependency
  - [ ] Remove CAPTCHA from auth flows

### 7.2 External Link Preview
**Impact:** Stops fetching metadata for pasted URLs

- [ ] **Remove link preview service**
  - [ ] Delete `/packages/frontend/core/src/blocksuite/view-extensions/link-preview-service/` directory
  - [ ] Remove link preview API endpoint

### 7.3 Image Proxy
**Impact:** External images won't be proxied (CORS issues may occur)

- [ ] **Remove image proxy**
  - [ ] Remove image proxy API endpoint
  - [ ] Update image handling to load directly

---

## Phase 8: Documentation & Cleanup

### 8.1 Update Documentation
**Impact:** Reflect privacy changes in docs

- [ ] **Update README/docs**
  - [ ] Document that telemetry has been removed
  - [ ] Update privacy policy/documentation
  - [ ] Add note about self-hosted privacy guarantees

### 8.2 Dependency Cleanup
**Impact:** Reduce bundle size

- [ ] **Clean up package.json files**
  - [ ] Run `npm prune` or `pnpm prune` to remove unused dependencies
  - [ ] Verify all telemetry packages are removed
  - [ ] Update lockfiles

### 8.3 Type Checking
**Impact:** Fix TypeScript errors from removed modules

- [ ] **Fix type errors**
  - [ ] Run TypeScript compiler to find errors
  - [ ] Update imports that reference removed modules
  - [ ] Add type stubs where needed

---

## Testing & Verification

### Network Monitoring
- [ ] **Browser testing**
  - [ ] Open DevTools Network tab
  - [ ] Perform common user actions
  - [ ] Verify no requests to:
    - [ ] `telemetry.affine.run`
    - [ ] `sentry.io` or Sentry DSN
    - [ ] `affine.pro/api/worker/releases` (if auto-update removed)

- [ ] **Desktop app testing**
  - [ ] Use network proxy (Charles, Fiddler, mitmproxy)
  - [ ] Monitor all HTTP/HTTPS traffic
  - [ ] Verify only user-initiated requests occur

- [ ] **Mobile app testing**
  - [ ] Monitor network on Android/iOS
  - [ ] Verify no Firebase requests (Android)
  - [ ] Verify no tracking requests

### Functional Testing
- [ ] **Core features work**
  - [ ] Document editing
  - [ ] Workspace management
  - [ ] Authentication (if OAuth kept)
  - [ ] Sync functionality
  - [ ] Error boundaries show errors (without reporting)

### Build Testing
- [ ] **Verify builds succeed**
  - [ ] Web build completes
  - [ ] Desktop build completes
  - [ ] Mobile builds complete (Android/iOS)
  - [ ] No telemetry code in bundles

---

## Implementation Notes

### Stub Implementation Example

When replacing modules with stubs, preserve the API:

```typescript
// packages/frontend/track/src/index.ts - STUB VERSION
export const track = {
  // All track functions become no-ops
  $.any.event.name: () => {},
};

// Preserve middleware API but do nothing
export const mixpanel = {
  init: () => {},
  opt_in_tracking: () => {},
  opt_out_tracking: () => {},
  identify: () => {},
  reset: () => {},
  register: () => {},
};

export const sentry = {
  init: () => {},
  enable: () => {},
  disable: () => {},
};

// Export types as empty interfaces
export type * from './types';
```

### Handling Upstream Updates

When AFFiNE upstream adds new features:
1. Their telemetry calls will use the stub API (automatically neutralized)
2. Merge conflicts only occur in stub files or if they restructure telemetry
3. Periodically review upstream telemetry changes and update stubs if needed

### Priority Order

If doing this incrementally, implement in this order:
1. **Phase 1 & 2** (Frontend analytics and Sentry) - Highest impact
2. **Phase 3** (Backend monitoring) - Already disabled by default
3. **Phase 4** (Mobile telemetry) - If you build mobile apps
4. **Phase 5** (Auto-updates) - Medium impact
5. **Phase 6** (Config cleanup) - Low impact
6. **Phase 7** (Optional) - Only if desired
7. **Phase 8** (Documentation) - Final cleanup

---

## Rollback Plan

If issues occur:
1. Keep original telemetry modules in a separate branch
2. Can restore by reverting stub files
3. Upstream AFFiNE still has full telemetry if needed for reference

---

## Estimated Scope

- **Files to modify:** ~30-50 files
- **Files to delete:** ~40-60 files
- **Dependencies to remove:** ~30 packages
- **Lines of code changed:** ~200-300 lines (mostly deletions/stubs)
- **Merge conflict risk:** LOW (business logic unchanged)

---

**Checklist Instructions:**
1. Review each section
2. Uncheck items you don't want to implement
3. Save this file with your selections
4. Provide it back with instructions to implement checked items
