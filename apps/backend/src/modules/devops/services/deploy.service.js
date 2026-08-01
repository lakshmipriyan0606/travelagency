/**
 * Deployment / runtime identity — env + process only; no fake deploy history.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

function readPackageVersion() {
  try {
    const here = path.dirname(fileURLToPath(import.meta.url));
    // .../modules/devops/services → apps/backend
    const pkgPath = path.resolve(here, '../../../../package.json');
    const raw = fs.readFileSync(pkgPath, 'utf8');
    const pkg = JSON.parse(raw);
    return { available: true, version: pkg.version || null, name: pkg.name || null };
  } catch (err) {
    return {
      available: false,
      version: null,
      reason: `package.json unreadable: ${err.message}`,
    };
  }
}

export async function getDeploySummary() {
  const gitCommit =
    process.env.GIT_COMMIT ||
    process.env.SOURCE_VERSION ||
    process.env.COMMIT_SHA ||
    process.env.VERCEL_GIT_COMMIT_SHA ||
    null;

  const pkg = readPackageVersion();

  return {
    collectedAt: new Date().toISOString(),
    runtime: {
      available: true,
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
      pid: process.pid,
      uptimeSec: Math.round(process.uptime()),
      env: process.env.NODE_ENV || 'development',
    },
    package: pkg,
    git: gitCommit
      ? {
          available: true,
          commit: String(gitCommit).slice(0, 40),
          source: process.env.GIT_COMMIT
            ? 'GIT_COMMIT'
            : process.env.SOURCE_VERSION
              ? 'SOURCE_VERSION'
              : process.env.COMMIT_SHA
                ? 'COMMIT_SHA'
                : 'VERCEL_GIT_COMMIT_SHA',
        }
      : {
          available: false,
          commit: null,
          reason:
            'No GIT_COMMIT / SOURCE_VERSION / COMMIT_SHA / VERCEL_GIT_COMMIT_SHA in environment — deploy history is not invented.',
        },
    deployHistory: {
      available: false,
      reason:
        'No devops_deploy_events store or PM2 deploy timeline is wired. Showing live process identity only.',
      items: [],
    },
    pm2: {
      available: false,
      reason: 'PM2 metrics API is not consumed by DevOps yet.',
    },
  };
}
