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
  branch?: string
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
  const { provider, owner, repo, branch } = useParams<URLParams>()
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
  let coverageLocation = undefined
  if (matchTree) {
    coverageLocation = {
      pathname:
        branch && branch !== 'All branches'
          ? `/${provider}/${owner}/${repo}/tree/${branch}`
          : `/${provider}/${owner}/${repo}/tree`,
    }
  } else if (matchFlags || matchComponents) {
    coverageLocation = {
      pathname:
        branch && branch !== 'All branches'
          ? `/${provider}/${owner}/${repo}/tree/${branch}`
          : `/${provider}/${owner}/${repo}`,
    }
  } else if (matchBlobs) {
    coverageLocation = { pathname: `/${provider}/${owner}/${repo}/blob` }
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
      /* if exact is false, location (or the current url if location is undefined) needs to be as
      specific or more than the url that the tab is linking to for the underlying NavLink matching to work correctly and apply the active state. In other words, the url this tab links to is the more generic pattern */
      location: coverageLocation,
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
