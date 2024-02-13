import { lazy, Suspense } from 'react'
import { useParams } from 'react-router-dom'

import { useBranchBundleSummary } from 'services/branches'
import Spinner from 'ui/Spinner'

import BundleSummary from './BundleSummary'

const EmptyTable = lazy(() => import('./EmptyTable'))
const ErrorBanner = lazy(() => import('./ErrorBanner'))
const BundleTable = lazy(() => import('./BundleTable'))

interface URLParams {
  provider: string
  owner: string
  repo: string
}

const Loader = () => (
  <div className="mt-16 flex flex-1 items-center justify-center">
    <Spinner />
  </div>
)

const BundleContent: React.FC = () => {
  const { provider, owner, repo } = useParams<URLParams>()
  const { data } = useBranchBundleSummary({ provider, owner, repo })

  const bundleType = data?.branch?.head?.bundleAnalysisReport?.__typename

  return (
    <div>
      <BundleSummary />
      <Suspense fallback={<Loader />}>
        {bundleType === 'BundleAnalysisReport' ? (
          <BundleTable />
        ) : (
          <>
            <ErrorBanner errorType={bundleType} />
            <EmptyTable />
          </>
        )}
      </Suspense>
    </div>
  )
}

export default BundleContent
