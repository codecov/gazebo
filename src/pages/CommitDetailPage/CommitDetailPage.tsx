import { useQueryClient } from '@tanstack/react-query'
import qs from 'qs'
import { lazy, Suspense } from 'react'
import { useLocation, useParams } from 'react-router-dom'

import NotFound from 'pages/NotFound'
import { useFlags } from 'shared/featureFlags'
import Breadcrumb from 'ui/Breadcrumb'
import Spinner from 'ui/Spinner'
import SummaryDropdown from 'ui/SummaryDropdown'

import CommitBundleDropdown from './Dropdowns/CommitBundleDropdown'
import CommitCoverageDropdown from './Dropdowns/CommitCoverageDropdown'
import Header from './Header'
import { useCommitPageData } from './hooks'

const CommitCoverage = lazy(() => import('./CommitCoverage'))
const CommitBundleAnalysis = lazy(() => import('./CommitBundleAnalysis'))

const DISPLAY_MODE = {
  COVERAGE: 'coverage',
  BUNDLE_ANALYSIS: 'bundle-analysis',
  BOTH: 'both',
} as const

type TDisplayMode = (typeof DISPLAY_MODE)[keyof typeof DISPLAY_MODE]

const Loader = () => (
  <div className="flex flex-1 justify-center">
    <Spinner />
  </div>
)

interface URLParams {
  provider: string
  owner: string
  repo: string
  commit: string
}

const CommitDetailPage: React.FC = () => {
  const location = useLocation()
  const { provider, owner, repo, commit: commitSha } = useParams<URLParams>()
  const shortSHA = commitSha?.slice(0, 7)

  const { newHeader } = useFlags({
    newHeader: false,
  })

  // reset cache when user navigates to the commit detail page
  const queryClient = useQueryClient()
  queryClient.setQueryData(['IgnoredUploadIds'], [])

  const { data: commitPageData, isLoading } = useCommitPageData({
    provider,
    owner,
    repo,
    commitId: commitSha,
  })

  if (
    !isLoading &&
    !commitPageData?.commit &&
    !commitPageData?.isCurrentUserPartOfOrg
  ) {
    return <NotFound />
  }

  let defaultDropdown: Array<'coverage' | 'bundle'> = []
  // default to displaying only coverage
  let displayMode: TDisplayMode = DISPLAY_MODE.COVERAGE
  if (
    commitPageData?.bundleAnalysisEnabled &&
    commitPageData?.coverageEnabled
  ) {
    const queryString = qs.parse(location.search, {
      ignoreQueryPrefix: true,
      depth: 1,
    })

    if (queryString?.dropdown === 'bundle') {
      defaultDropdown.push('bundle')
    } else if (queryString?.dropdown === 'coverage') {
      defaultDropdown.push('coverage')
    }

    displayMode = DISPLAY_MODE.BOTH
  } else if (commitPageData?.bundleAnalysisEnabled) {
    displayMode = DISPLAY_MODE.BUNDLE_ANALYSIS
  }

  return (
    <div className="flex flex-col gap-4 px-3 sm:px-0">
      {newHeader ? null : (
        <Breadcrumb
          paths={[
            { pageName: 'owner', text: owner },
            { pageName: 'repo', text: repo },
            { pageName: 'commits', text: 'commits' },
            {
              pageName: 'commit',
              options: { commitSha },
              readOnly: true,
              text: shortSHA,
            },
          ]}
        />
      )}
      <Header />
      {displayMode === DISPLAY_MODE.BOTH ? (
        <SummaryDropdown type="multiple" defaultValue={defaultDropdown}>
          <CommitCoverageDropdown>
            <Suspense fallback={<Loader />}>
              <CommitCoverage />
            </Suspense>
          </CommitCoverageDropdown>
          <CommitBundleDropdown>
            <Suspense fallback={<Loader />}>
              <CommitBundleAnalysis />
            </Suspense>
          </CommitBundleDropdown>
        </SummaryDropdown>
      ) : displayMode === DISPLAY_MODE.BUNDLE_ANALYSIS ? (
        <Suspense fallback={<Loader />}>
          <CommitBundleAnalysis />
        </Suspense>
      ) : (
        <Suspense fallback={<Loader />}>
          <CommitCoverage />
        </Suspense>
      )}
    </div>
  )
}

export default CommitDetailPage
