import { lazy, Suspense } from 'react'
import { Route, Switch } from 'react-router-dom'

import Spinner from 'ui/Spinner'

const FileView = lazy(() => import('./subroute/FileView'))

function CoverageTab() {
  const Loader = (
    <div className="flex items-center justify-center py-16">
      <Spinner />
    </div>
  )

  return (
    <div className="flex flex-col gap-4 mx-4 md:mx-0">
      {/* Summary Component */}
      <h1>Summary Component</h1>
      <div className="flex flex-1 flex-col gap-4">
        <Switch>
          <Route path="/:provider/:owner/:repo/tree/:path+" exact>
            <Suspense fallback={Loader}>
              {/* Same Root Tree Component after being clicked for the 1st time */}
              <h1>Root Tree Component after Clicked</h1>
            </Suspense>
          </Route>
          <Route path="/:provider/:owner/:repo/blobs/:ref/:path+" exact>
            <Suspense fallback={Loader}>
              <FileView />
            </Suspense>
          </Route>
          <Route path="/:provider/:owner/:repo/" exact>
            <Suspense fallback={Loader}>
              {/* Root Tree Component */}
              <h1>Root OG Tree Component</h1>
            </Suspense>
          </Route>
        </Switch>
      </div>
    </div>
  )
}

export default CoverageTab
