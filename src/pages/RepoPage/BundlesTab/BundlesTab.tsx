import { Suspense } from 'react'
import { Redirect, Switch, useParams } from 'react-router-dom'

import { useRepoOverview } from 'services/repo'
import Spinner from 'ui/Spinner'

import BundleContent from './BundleContent'

interface URLParams {
  provider: string
  owner: string
  repo: string
}

const path = '/:provider/:owner/:repo'

const Loader = () => (
  <div className="mt-16 flex flex-1 items-center justify-center">
    <Spinner />
  </div>
)

const BundlesTab: React.FC = () => {
  const { provider, owner, repo } = useParams<URLParams>()
  const { data } = useRepoOverview({ provider, owner, repo })

  if (data?.bundleAnalysisEnabled) {
    return (
      <Suspense fallback={<Loader />}>
        <BundleContent />
      </Suspense>
    )
  }

  return (
    <Switch>
      <Redirect from={`${path}/bundles`} to={path} />
      <Redirect from={`${path}/bundles/*`} to={path} />
    </Switch>
  )
}

export default BundlesTab
