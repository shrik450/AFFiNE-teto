# Privacy & Telemetry Removal

This fork of AFFiNE has been modified to remove all automatic telemetry and error reporting for privacy-focused self-hosted deployments.

## What Was Removed

### 1. Analytics & User Tracking
- **Mixpanel**: All user behavior analytics and event tracking has been removed
- **Frontend tracking**: 874+ tracked events neutralized
- **Backend tracking**: Mixpanel integration removed from server

### 2. Error Reporting & Monitoring  
- **Sentry**: Error reporting and performance monitoring removed
- **Error boundaries**: Replaced Sentry ErrorBoundary with React ErrorBoundary
- **Errors are now**: Caught and displayed to users but NOT sent to external services
- **Source maps**: No longer uploaded to external services

### 3. Performance Monitoring
- **Perfsee**: Performance profiling disabled
- **Build telemetry**: Source map uploads removed

## Privacy Guarantees

When self-hosting this fork:

✅ **No external analytics** - Your usage data stays private  
✅ **No error reporting** - Errors are logged locally only  
✅ **No performance monitoring** - No profiling data sent externally  
✅ **No tracking pixels** - No third-party tracking scripts  
✅ **No automatic updates check** (if configured properly)

## Implementation Approach

To maintain compatibility with upstream AFFiNE updates, we used a "stub replacement" strategy:

- Telemetry modules replaced with no-op stubs that preserve the API
- All telemetry calls route to empty functions
- Business logic files remain unchanged
- Future upstream updates will work, with their telemetry automatically neutralized

## Files Modified

See the TELEMETRY_REMOVAL_PLAN.md document for a comprehensive list of all changes.

## For Self-Hosters

This fork is specifically designed for privacy-conscious self-hosted deployments. If you're running your own instance, you can be confident that:

- No data leaves your server without your explicit action
- User behavior is not tracked or analyzed
- Errors occur locally and are not reported externally
- Performance metrics are not collected

## Verification

You can verify telemetry removal by:

1. **Network monitoring**: Use browser DevTools to confirm no requests to:
   - `telemetry.affine.run`
   - `sentry.io` or Sentry DSN endpoints
   - `perfsee.com`

2. **Code inspection**: All telemetry files are marked with `// NO-OP STUB` comments

3. **Build artifacts**: Check that no telemetry SDKs are bundled in production builds

## Updating From Upstream

When pulling updates from upstream AFFiNE:

1. New features will work normally
2. New telemetry calls will be automatically neutralized (routed to no-op stubs)
3. Merge conflicts will be minimal (only in stub files)
4. Review the TELEMETRY_REMOVAL_PLAN.md for any new telemetry patterns

## Questions?

If you discover any telemetry that was missed, please file an issue with:
- The network request or tracking call observed
- The file/function where it originates
- Steps to reproduce

---

**Last updated**: 2025-11-17  
**Based on**: AFFiNE upstream commit 36a0819
