import { useMemo } from 'react'
import { useParams } from 'react-router-dom'

import { useRepo, useRepoOverview } from 'services/repo'
import { TierNames, useTier } from 'services/tier'
import { useFlags } from 'shared/featureFlags'
import TabNavigation from 'ui/TabNavigation'

import {
  useMatchBlobsPath,
  useMatchCoverageOnboardingPath,
  useMatchTreePath,
} from './hooks'

interface URLParams {
  provider: string
  owner: string
  repo: string
}

interface UseRepoTabsArgs {
  refetchEnabled: boolean
}

interface TabArgs {
  pageName: string
  children?: string
  exact?: boolean
  location?: { pathname: string }
}

export const useRepoTabs = ({ refetchEnabled }: UseRepoTabsArgs) => {
  const { provider, owner, repo } = useParams<URLParams>()
  const { data: repoOverview } = useRepoOverview({ provider, owner, repo })
  const { data: tierData } = useTier({ owner, provider })
  const { data: repoData } = useRepo({
    provider,
    owner,
    repo,
    opts: {
      refetchOnWindowFocus: refetchEnabled,
    },
  })

  const { bundleAnalysisPrAndCommitPages } = useFlags({
    bundleAnalysisPrAndCommitPages: false,
  })

  const jsOrTsPresent = useMemo(() => {
    if (repoOverview?.bundleAnalysisEnabled) {
      return true
    }

    if (repoOverview?.languages) {
      return repoOverview.languages.some(
        (lang) =>
          lang.toLowerCase() === 'javascript' ||
          lang.toLowerCase() === 'typescript'
      )
    }

    return false
  }, [repoOverview?.bundleAnalysisEnabled, repoOverview?.languages])

  const matchTree = useMatchTreePath()
  const matchBlobs = useMatchBlobsPath()
  const matchCoverageOnboarding = useMatchCoverageOnboardingPath()
  let location = undefined
  if (matchTree) {
    location = { pathname: `/${provider}/${owner}/${repo}/tree` }
  } else if (matchBlobs) {
    location = { pathname: `/${provider}/${owner}/${repo}/blob` }
  }

  const tabs: TabArgs[] = [
    {
      pageName: 'overview',
      children: 'Coverage',
      exact: !matchTree && !matchBlobs && !matchCoverageOnboarding,
      location,
    },
  ]

  if (
    (jsOrTsPresent || repoOverview?.bundleAnalysisEnabled) &&
    bundleAnalysisPrAndCommitPages
  ) {
    tabs.push({ pageName: 'bundles' })
  }

  const hideFlagsTab = !!repoOverview?.private && tierData === TierNames.TEAM
  if (repoOverview?.coverageEnabled && !hideFlagsTab) {
    tabs.push({ pageName: 'flagsTab' })
  }

  if (repoOverview?.bundleAnalysisEnabled || repoOverview?.coverageEnabled) {
    tabs.push({ pageName: 'commits' }, { pageName: 'pulls' })
  }

  if (repoData?.isCurrentUserPartOfOrg) {
    tabs.push({ pageName: 'settings' })
  }

  return tabs
}

interface RepoPageTabsProps {
  refetchEnabled: boolean
}

const RepoPageTabs: React.FC<RepoPageTabsProps> = ({ refetchEnabled }) => {
  const repoTabs = useRepoTabs({
    refetchEnabled,
  })

  return (
    <div className="sticky top-8 z-10 bg-white pb-2">
      <TabNavigation tabs={repoTabs} />
    </div>
  )
}

export default RepoPageTabs
