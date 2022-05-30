import { Suspense } from 'react'
import { Route, Switch } from 'react-router-dom'

import Spinner from 'ui/Spinner'

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
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-3 space-y-2 col-span-2">
        <Switch>
          <Route path="/:provider/:owner/:repo/tree/:path+" exact>
            <Suspense fallback={Loader}>
              {/* Same Root Tree Component after being clicked for the 1st time */}
              <h1>Root Tree Component after Clicked</h1>
            </Suspense>
          </Route>
          <Route path="/:provider/:owner/:repo/blob/:path+" exact>
            <Suspense fallback={Loader}>
              {/* Fileviewer Component */}
              <h1>Fileviewer</h1>
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
