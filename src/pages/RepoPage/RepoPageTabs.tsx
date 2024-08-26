import { useParams } from 'react-router-dom'

import { useRepo, useRepoOverview } from 'services/repo'
import Badge from 'ui/Badge'
import TabNavigation from 'ui/TabNavigation'

import {
  useMatchBlobsPath,
  useMatchComponentsPath,
  useMatchCoverageOnboardingPath,
  useMatchFlagsPath,
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
  const { data: repoData } = useRepo({
    provider,
    owner,
    repo,
    opts: {
      refetchOnWindowFocus: refetchEnabled,
    },
  })

  const matchTree = useMatchTreePath()
  const matchBlobs = useMatchBlobsPath()
  const matchCoverageOnboarding = useMatchCoverageOnboardingPath()
  const matchFlags = useMatchFlagsPath()
  const matchComponents = useMatchComponentsPath()
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
      exact: !(
        matchTree ||
        matchBlobs ||
        matchCoverageOnboarding ||
        matchFlags ||
        matchComponents
      ),
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
      children: 'Bundles',
    })
  }

  if (isCurrentUserPartOfOrg) {
    tabs.push({
      pageName: repoOverview?.testAnalyticsEnabled
        ? 'failedTests'
        : 'failedTestsOnboarding',
      children: (
        <>
          Tests <Badge>beta</Badge>{' '}
        </>
      ),
    })
  }

  const userAuthorizedtoViewRepo =
    (repoData?.isCurrentUserActivated && repoOverview?.private) ||
    !repoOverview?.private
  if (
    (repoOverview?.bundleAnalysisEnabled ||
      repoOverview?.coverageEnabled ||
      repoOverview?.testAnalyticsEnabled) &&
    userAuthorizedtoViewRepo
  ) {
    tabs.push({ pageName: 'commits' }, { pageName: 'pulls' })
  }

  if (isCurrentUserPartOfOrg) {
    tabs.push({ pageName: 'configuration' })
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
    <div className="z-10 pb-2">
      <TabNavigation tabs={repoTabs} />
    </div>
  )
}

export default RepoPageTabs
