import {
  useQueryClient as useQueryClientV5,
  useSuspenseQuery as useSuspenseQueryV5,
} from '@tanstack/react-queryV5'
import qs from 'qs'
import { Suspense, useLayoutEffect } from 'react'
import { useLocation, useParams } from 'react-router-dom'

import NotFound from 'pages/NotFound'
import { useCrumbs } from 'pages/RepoPage/context'
import Icon from 'ui/Icon'
import Spinner from 'ui/Spinner'
import SummaryDropdown from 'ui/SummaryDropdown'

import CommitBundleAnalysis from './CommitBundleAnalysis'
import CommitCoverage from './CommitCoverage'
import CommitBundleDropdown from './Dropdowns/CommitBundleDropdown'
import CommitCoverageDropdown from './Dropdowns/CommitCoverageDropdown'
import Header from './Header'
import { CommitPageDataQueryOpts } from './queries/CommitPageDataQueryOpts'
import { IgnoredIdsQueryOptions } from './queries/IgnoredIdsQueryOptions'

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

  // reset cache when user navigates to the commit detail page
  const queryClientV5 = useQueryClientV5()
  queryClientV5.setQueryData(IgnoredIdsQueryOptions().queryKey, [])

  const { data: commitPageData, isLoading } = useSuspenseQueryV5(
    CommitPageDataQueryOpts({
      provider,
      owner,
      repo,
      commitId: commitSha,
    })
  )

  const { setBreadcrumbs, setBaseCrumbs } = useCrumbs()
  useLayoutEffect(() => {
    setBaseCrumbs([
      { pageName: 'owner', text: owner },
      {
        pageName: 'repo',
        children: (
          <div
            className="inline-flex items-center gap-1"
            data-testid="breadcrumb-repo"
          >
            {commitPageData?.private ? (
              <Icon name="lockClosed" variant="solid" size="sm" />
            ) : null}
            {repo}
          </div>
        ),
      },
    ])
    setBreadcrumbs([
      { pageName: 'commits', text: 'commits' },
      {
        pageName: 'commit',
        options: { commitSha },
        readOnly: true,
        text: shortSHA,
      },
    ])
    return () => setBreadcrumbs([])
  }, [
    setBreadcrumbs,
    commitSha,
    shortSHA,
    setBaseCrumbs,
    owner,
    repo,
    commitPageData,
  ])

  if (
    !isLoading &&
    !commitPageData?.commit &&
    !commitPageData?.isCurrentUserPartOfOrg
  ) {
    return <NotFound />
  }

  const defaultDropdown: Array<'coverage' | 'bundle'> = []
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
    <div className="flex flex-col px-3 sm:px-0">
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
        <div className="pt-2">
          <Suspense fallback={<Loader />}>
            <CommitCoverage />
          </Suspense>
        </div>
      )}
    </div>
  )
}

export default CommitDetailPage
