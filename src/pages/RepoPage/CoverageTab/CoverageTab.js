import { lazy, Suspense } from 'react'
import { Route, Switch } from 'react-router-dom'

import Spinner from 'ui/Spinner'

import Summary from './Summary'

const Fileviewer = lazy(() => import('./subroute/Fileviewer'))

function CoverageTab() {
  const Loader = (
    <div className="flex items-center justify-center py-16">
      <Spinner />
    </div>
  )

  return (
    <div className="flex flex-col gap-4 mx-4 md:mx-0">
      <Summary />
      <div className="flex flex-1 flex-col gap-4">
        <Switch>
          <Route path="/:provider/:owner/:repo/tree/:branch/:path+" exact>
            <Suspense fallback={Loader}>
              {/* Tree Component after being clicked for the 1st time */}
              <h1>Tree Component after Clicked including a folder location</h1>
            </Suspense>
          </Route>
          <Route path="/:provider/:owner/:repo/tree/:branch" exact>
            <Suspense fallback={Loader}>
              {/* Same Root Tree Component after being clicked for the 1st time */}
              <h1>
                Root Tree Component Branch switch, this is the root of the
                projects source
              </h1>
            </Suspense>
          </Route>
          <Route path="/:provider/:owner/:repo/blobs/:ref/:path+" exact>
            <Suspense fallback={Loader}>
              <Fileviewer />
            </Suspense>
          </Route>
          <Route path="/:provider/:owner/:repo/" exact>
            <Suspense fallback={Loader}>
              {/* Root Tree Component */}
              <h1>Root OG Tree Component on the default branch</h1>
            </Suspense>
          </Route>
        </Switch>
      </div>
    </div>
  )
}

export default CoverageTab
