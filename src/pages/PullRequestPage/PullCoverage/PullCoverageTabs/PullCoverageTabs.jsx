import qs from 'qs'
import { useLocation, useParams } from 'react-router-dom'

import {
  pullFileviewString,
  pullTreeviewString,
} from 'pages/PullRequestPage/utils'
import { useRepoOverview } from 'services/repo'
import { TierNames, useTier } from 'services/tier'
import TabNavigation from 'ui/TabNavigation'

import { useTabsCounts } from './hooks'

function PullCoverageTabs() {
  const { provider, owner, repo, pullId } = useParams()
  const { pathname, search } = useLocation()

  const {
    flagsCount,
    componentsCount,
    indirectChangesCount,
    directChangedFilesCount,
    commitsCount,
  } = useTabsCounts()
  const { data: overview, isLoading: overviewLoading } = useRepoOverview({
    provider,
    owner,
    repo,
  })

  const { data: tierData, isLoading } = useTier({ provider, owner })
  const searchParams = qs.parse(search, { ignoreQueryPrefix: true })
  const flags = searchParams?.flags ?? []

  const blobPath = pathname.includes(
    `/${provider}/${pullFileviewString({ owner, repo, pullId })}`
  )

  const filePath = pathname.includes(
    `/${provider}/${pullTreeviewString({ owner, repo, pullId })}`
  )

  let customLocation = undefined
  if (blobPath || filePath) {
    customLocation = {
      pathname: `/${provider}/${owner}/${repo}/pull/${pullId}/tree`,
    }
  }

  if (isLoading || overviewLoading) {
    return null
  }

  if (tierData === TierNames.TEAM && overview?.private) {
    return (
      <TabNavigation
        tabs={[
          {
            pageName: 'pullDetail',
            children: (
              <>
                Files changed
                <sup className="text-xs">{directChangedFilesCount}</sup>
              </>
            ),
            options: { queryParams: { flags } },
            exact: true,
          },
          {
            pageName: 'pullCommits',
            children: (
              <>
                Commits
                <sup className="text-xs">{commitsCount}</sup>
              </>
            ),
            options: { queryParams: { flags } },
          },
          {
            pageName: 'pullTreeView',
            children: 'File explorer',
            options: { pullId, queryParams: { flags } },
            location: customLocation,
          },
        ]}
      />
    )
  }

  return (
    <TabNavigation
      tabs={[
        {
          pageName: 'pullDetail',
          children: (
            <>
              Files changed
              <sup className="text-xs">{directChangedFilesCount}</sup>
            </>
          ),
          options: { queryParams: { flags } },
          exact: true,
        },
        {
          pageName: 'pullIndirectChanges',
          children: (
            <>
              Indirect changes
              <sup className="text-xs">{indirectChangesCount}</sup>
            </>
          ),
          options: { queryParams: { flags } },
        },
        {
          pageName: 'pullCommits',
          children: (
            <>
              Commits
              <sup className="text-xs">{commitsCount}</sup>
            </>
          ),
          options: { queryParams: { flags } },
        },
        {
          pageName: 'pullFlags',
          children: (
            <>
              Flags
              <sup className="text-xs">{flagsCount}</sup>
            </>
          ),
          options: { queryParams: { flags } },
        },
        {
          pageName: 'pullComponents',
          children: (
            <>
              Components
              <sup className="text-xs">{componentsCount}</sup>
            </>
          ),
          options: { queryParams: { flags } },
        },
        {
          pageName: 'pullTreeView',
          children: 'File explorer',
          options: { pullId, queryParams: { flags } },
          location: customLocation,
        },
      ]}
    />
  )
}

export default PullCoverageTabs
