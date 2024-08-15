/* eslint-disable camelcase */
import { metrics } from 'shared/utils/metrics'

type Bundlers =
  | 'rollup'
  | 'vite'
  | 'webpack'
  | 'remix'
  | 'nuxt'
  | 'sveltekit'
  | 'solidstart'
type PackageManagers = 'npm' | 'yarn' | 'pnpm'

export const copiedInstallCommandMetric = (
  packageManager: PackageManagers,
  bundler: Bundlers
) => {
  metrics.increment('bundles_tab.onboarding.copied.install_command', 1, {
    tags: {
      package_manager: packageManager,
      bundler,
    },
  })
}

export const copiedBuildCommandMetric = (
  packageManager: PackageManagers,
  bundler: Bundlers
) => {
  metrics.increment('bundles_tab.onboarding.copied.build_command', 1, {
    tags: {
      package_manager: packageManager,
      bundler,
    },
  })
}

export const copiedTokenMetric = (bundler: Bundlers) => {
  metrics.increment('bundles_tab.onboarding.copied.token', 1, {
    tags: { bundler },
  })
}

export const copiedConfigMetric = (bundler: Bundlers) => {
  metrics.increment('bundles_tab.onboarding.copied.config', 1, {
    tags: { bundler },
  })
}

export const copiedCommitMetric = (bundler: Bundlers) => {
  metrics.increment('bundles_tab.onboarding.copied.commit', 1, {
    tags: { bundler },
  })
}

export const visitedOnboardingMetric = (bundler: Bundlers) => {
  metrics.increment('bundles_tab.onboarding.visited_page', 1, {
    tags: { bundler },
  })
}
