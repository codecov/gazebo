import { useParams } from 'react-router-dom'

import { useRepo, useRepoOverview } from 'services/repo'
import { TierNames, useTier } from 'services/tier'
import { useFlags } from 'shared/featureFlags'
import Badge from 'ui/Badge'
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
  children?: React.ReactNode
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

  const { componentTab, onboardingFailedTests } = useFlags({
    componentTab: false,
    onboardingFailedTests: false,
  })

  const matchTree = useMatchTreePath()
  const matchBlobs = useMatchBlobsPath()
  const matchCoverageOnboarding = useMatchCoverageOnboardingPath()
  let location = undefined
  if (matchTree) {
    location = { pathname: `/${provider}/${owner}/${repo}/tree` }
  } else if (matchBlobs) {
    location = { pathname: `/${provider}/${owner}/${repo}/blob` }
  }

  const tabs: TabArgs[] = []

  const isCurrentUserPartOfOrg = repoData?.isCurrentUserPartOfOrg
  if (repoOverview?.coverageEnabled || isCurrentUserPartOfOrg) {
    tabs.push({
      pageName: 'overview',
      children: 'Coverage',
      exact: !matchTree && !matchBlobs && !matchCoverageOnboarding,
      location,
    })
  }

  const jsOrTsPresent = repoOverview?.jsOrTsPresent
  if (
    (jsOrTsPresent && isCurrentUserPartOfOrg) ||
    repoOverview?.bundleAnalysisEnabled
  ) {
    tabs.push({
      pageName: 'bundles',
      children: (
        <>
          Bundles <Badge>beta</Badge>
        </>
      ),
    })
  }

  if (onboardingFailedTests) {
    tabs.push({
      pageName: 'failedTestsOnboarding',
      children: (
        <>
          Tests <Badge>beta</Badge>{' '}
        </>
      ),
    })
  }

  const hideFlagsTab = !!repoOverview?.private && tierData === TierNames.TEAM
  const userAuthorizedtoViewRepo =
    (repoData?.isCurrentUserActivated && repoOverview?.private) ||
    !repoOverview?.private
  if (
    repoOverview?.coverageEnabled &&
    !hideFlagsTab &&
    userAuthorizedtoViewRepo
  ) {
    tabs.push({ pageName: 'flagsTab' })
  }

  const hideComponentsTab =
    !!repoOverview?.private && tierData === TierNames.TEAM
  if (
    repoOverview?.coverageEnabled &&
    componentTab &&
    !hideComponentsTab &&
    userAuthorizedtoViewRepo
  ) {
    tabs.push({ pageName: 'componentsTab' })
  }

  if (
    (repoOverview?.bundleAnalysisEnabled || repoOverview?.coverageEnabled) &&
    userAuthorizedtoViewRepo
  ) {
    tabs.push({ pageName: 'commits' }, { pageName: 'pulls' })
  }

  if (isCurrentUserPartOfOrg) {
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
