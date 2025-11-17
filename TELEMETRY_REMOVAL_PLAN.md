# AFFiNE Self-hosted server Telemetry Removal Implementation Plan

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

## Implementation Notes

- Each phase should have a single commit
- The goal here is to ONLY remove telemetry from the server and frontend, so that if you self-host and use the web UI there should be NO telemetry from either the backend or the frontend. Since app distribution is more complicated, that is not in scope for this change.

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

## Phase 3: Update Documentation


### 3.1 Update Documentation
**Impact:** Reflect privacy changes in docs

- [ ] **Update README/docs**
  - [ ] Document that telemetry has been removed
  - [ ] Update privacy policy/documentation
  - [ ] Add note about self-hosted privacy guarantees

### 3.2 Dependency Cleanup
**Impact:** Reduce bundle size

- [ ] **Clean up package.json files**
  - [ ] Run `npm prune` or `pnpm prune` to remove unused dependencies
  - [ ] Verify all telemetry packages are removed
  - [ ] Update lockfiles

### 3.3 Type Checking
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

---

## Rollback Plan

If issues occur:
1. Keep original telemetry modules in a separate branch
2. Can restore by reverting stub files
3. Upstream AFFiNE still has full telemetry if needed for reference

