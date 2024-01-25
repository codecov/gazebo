import { lazy, Suspense } from 'react'
import { useParams } from 'react-router-dom'

import { useCommitBADropdownSummary } from 'services/commit/useCommitBADropdownSummary'
import { formatSizeToString } from 'shared/utils/bundleAnalysis'
import Spinner from 'ui/Spinner'

import { useCommitPageData } from '../hooks'

const CommitBundleAnalysisTable = lazy(
  () => import('./CommitBundleAnalysisTable')
)

interface URLParams {
  provider: string
  owner: string
  repo: string
  commit: string
}

const Loader = () => (
  <div className="flex flex-1 justify-center">
    <Spinner />
  </div>
)

const BundleMessage: React.FC = () => {
  const { provider, owner, repo, commit: commitSha } = useParams<URLParams>()
  const { data } = useCommitBADropdownSummary({
    provider,
    owner,
    repo,
    commitid: commitSha,
  })

  if (
    !data ||
    data?.owner?.repository.__typename !== 'Repository' ||
    data.owner.repository?.commit?.bundleAnalysisCompareWithParent
      ?.__typename !== 'BundleAnalysisComparison'
  ) {
    return null
  }

  const sizeDelta =
    data?.owner?.repository?.commit?.bundleAnalysisCompareWithParent?.sizeDelta

  const positiveSize = Math.abs(sizeDelta)
  if (sizeDelta < 0) {
    return (
      <>
        <span className="font-semibold">Bundle Report: </span>
        changes will decrease total bundle size by{' '}
        {formatSizeToString(positiveSize)} &#x2139;
      </>
    )
  }

  if (sizeDelta > 0) {
    return (
      <>
        <span className="font-semibold">Bundle Report: </span>
        changes will increase total bundle size by{' '}
        {formatSizeToString(positiveSize)} &#x2139;
      </>
    )
  }

  return (
    <>
      <span className="font-semibold">Bundle Report: </span>bundle size has no
      change &#x2705;
    </>
  )
}

const CommitBundleAnalysis: React.FC = () => {
  const { provider, owner, repo, commit: commitSha } = useParams<URLParams>()
  const { data: commitPageData } = useCommitPageData({
    provider,
    owner,
    repo,
    commitId: commitSha,
  })

  if (
    commitPageData?.coverageEnabled &&
    commitPageData?.bundleAnalysisEnabled
  ) {
    return (
      <Suspense fallback={<Loader />}>
        <CommitBundleAnalysisTable />
      </Suspense>
    )
  }

  return (
    <>
      <p className="flex w-full items-center gap-2 bg-ds-gray-primary px-2 py-4">
        <BundleMessage />
      </p>
      <Suspense fallback={<Loader />}>
        <CommitBundleAnalysisTable />
      </Suspense>
    </>
  )
}

export default CommitBundleAnalysis
