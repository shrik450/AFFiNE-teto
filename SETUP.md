# AFFiNE-teto Setup Guide

This is a fork of AFFiNE with all telemetry removed for self-hosted deployments.

## Branch Structure

This repository uses a two-branch workflow:

- **`main`** - Stable, telemetry-free version for self-hosted deployments
- **`canary`** - Tracks upstream AFFiNE, receives weekly updates

## Initial Setup

### 1. Create the Main Branch

If you're setting this up for the first time, you need to create the `main` branch from the current claude branch:

```bash
# On GitHub, go to Settings → Branches → Default branch
# Change the default branch to one that will become 'main'

# Locally or via GitHub UI, create the main branch:
git checkout claude/audit-telemetry-013zDThq8NarcJQtvnpxbT69
git checkout -b main
git push origin main

# Set main as the default branch on GitHub
```

### 2. Create the Canary Branch

The canary branch tracks upstream AFFiNE/canary:

```bash
# Fetch upstream
git remote add upstream https://github.com/toeverything/AFFiNE.git
git fetch upstream

# Create canary branch from upstream
git checkout -b canary upstream/canary

# Merge our telemetry-free changes
git merge main --no-edit

# Push to origin
git push origin canary
```

### 3. Set Branch Permissions

On GitHub, configure branch protection rules:

**For `main` branch:**

- Require pull request reviews before merging
- Require status checks to pass (Docker build)
- Include administrators

**For `canary` branch:**

- Allow force pushes from GitHub Actions (for weekly syncs)
- Disable require PR for automated sync

## Automated Workflows

### 1. Weekly Upstream Sync

**Workflow:** `.github/workflows/sync-upstream.yml`
**Schedule:** Every Monday at 00:00 UTC
**What it does:**

- Fetches latest changes from `toeverything/AFFiNE` canary branch
- Merges into our `canary` branch
- If conflicts occur, creates an issue for manual resolution

**Manual trigger:**

```bash
# Via GitHub UI: Actions → Sync Upstream to Canary → Run workflow
```

### 2. Auto-Rebase to Main

**Workflow:** `.github/workflows/auto-rebase-pr.yml`
**Trigger:** When `canary` branch is updated
**What it does:**

- Rebases `canary` onto `main`
- Creates a PR for review
- Tags you for manual review
- If conflicts occur, creates an issue

**What to review in PRs:**

- No new telemetry endpoints are being called
- Stub files still properly intercept tracking calls
- Docker builds complete successfully
- No sensitive data transmission

### 3. Docker Image Build

**Workflow:** `.github/workflows/build-docker.yml`
**Trigger:** Push to `main` branch
**What it does:**

- Builds web, admin, mobile, and server components
- Creates Docker images for `linux/amd64`, `linux/arm64`, `linux/arm/v7`
- Pushes to GitHub Container Registry (GHCR)
- Tags images as `:latest` and `:sha-<short-hash>`

**Images published:**

- `ghcr.io/shrik450/affine-teto/affine:latest` - Backend server
- `ghcr.io/shrik450/affine-teto/affine-front:latest` - Frontend

## Using the Docker Images

The docker-compose file at `.docker/selfhost/compose.yml` is pre-configured to use images from this repository.

### Quick Start

```bash
cd .docker/selfhost

# Copy example environment
cp .env.example .env

# Edit .env and configure your settings
nano .env

# Start AFFiNE
docker compose up -d

# View logs
docker compose logs -f affine
```

### Environment Variables

The `.env` file should contain:

```bash
# Database
DB_USERNAME=affine
DB_PASSWORD=your-secure-password
DB_DATABASE=affine
DB_DATA_LOCATION=./postgres-data

# Storage
UPLOAD_LOCATION=./storage
CONFIG_LOCATION=./config

# Server
PORT=3010

# Image version (optional)
# AFFINE_REVISION=latest  # Use specific SHA for pinned version
```

### Updating

To update to the latest version:

```bash
# Pull latest images
docker compose pull

# Restart services
docker compose down
docker compose up -d
```

## Telemetry Removal

This fork has removed ALL telemetry from AFFiNE:

### What Was Removed:

- ✅ Mixpanel analytics (874+ event types)
- ✅ Sentry error reporting
- ✅ Perfsee performance monitoring
- ✅ OpenTelemetry metrics (backend)
- ✅ Customer.io integration
- ✅ Source map uploads
- ✅ All telemetry environment variables

### How It Works:

- All telemetry modules replaced with no-op stubs
- API signatures preserved for compatibility
- Business logic unchanged
- New upstream features automatically neutralized

### Verification:

To verify no telemetry is being sent:

1. **Browser DevTools:**

   ```
   Open DevTools → Network tab
   Look for requests to:
   ❌ telemetry.affine.run
   ❌ sentry.io
   ❌ mixpanel.com
   ```

2. **Docker Logs:**

   ```bash
   docker compose logs -f affine | grep -i "telemetry\|mixpanel\|sentry"
   # Should show no matches
   ```

3. **Network Monitoring:**
   ```bash
   # Monitor outbound connections
   sudo tcpdump -i any -n 'dst net 0.0.0.0/0 and tcp port 443'
   # Look for unexpected external domains
   ```

See `PRIVACY.md` for complete privacy documentation.

## Development

### Building Locally

```bash
# Install dependencies
yarn install

# Build web frontend
yarn affine @affine/web build

# Build server
yarn workspace @affine/server build
```

### Running in Development

```bash
# Start dev server
yarn dev

# TypeScript type checking
yarn typecheck

# Run tests
yarn test
```

## Maintaining the Fork

### Handling Upstream Updates

When the auto-rebase PR is created:

1. **Review the PR description** - Check the diff summary
2. **Review telemetry-related files:**
   - `packages/frontend/track/src/*`
   - `packages/frontend/core/src/modules/telemetry/*`
   - `blocksuite/affine/shared/src/services/telemetry-service/*`
3. **Test locally** if needed:
   ```bash
   git fetch origin
   git checkout auto-rebase/canary-to-main-YYYYMMDD-HHMMSS
   yarn install
   yarn typecheck
   ```
4. **Approve and merge** if everything looks good

### Resolving Conflicts

If auto-rebase fails:

1. **Check the issue** created by the workflow
2. **Manually rebase:**

   ```bash
   git checkout canary
   git pull origin canary
   git checkout -b manual-rebase-$(date +%Y%m%d)
   git rebase origin/main

   # Resolve conflicts (prioritize our stub implementations)
   git add .
   git rebase --continue

   git push origin manual-rebase-$(date +%Y%m%d)
   ```

3. **Create PR** from the manual rebase branch to `main`

### Updating Stubs

If upstream adds new telemetry exports:

1. **Identify new exports** in the PR diff
2. **Update stub files** to include new no-op functions
3. **Test** that TypeScript still compiles
4. **Commit** the stub updates

## Support

- **Telemetry Audit:** See `TELEMETRY_AUDIT.md`
- **Privacy Guarantees:** See `PRIVACY.md`
- **Implementation Plan:** See `TELEMETRY_REMOVAL_PLAN.md`

## License

Same as upstream AFFiNE. See `LICENSE` for details.
