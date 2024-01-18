import { lazy, Suspense } from 'react'
import { Route, Switch } from 'react-router-dom'

import Spinner from 'ui/Spinner'

const BundleOnboarding = lazy(() => import('./BundleOnboarding'))

const Loader = () => (
  <div className="mt-16 flex flex-1 items-center justify-center">
    <Spinner />
  </div>
)

const path = '/:provider/:owner/:repo/bundles'

const BundlesTab: React.FC = () => {
  return (
    <>
      <Switch>
        <Route
          path={[`${path}/new`, `${path}/new/rollup`, `${path}/new/webpack`]}
        >
          <Suspense fallback={<Loader />}>
            <BundleOnboarding />
          </Suspense>
        </Route>
      </Switch>
    </>
  )
}

export default BundlesTab
