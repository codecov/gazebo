import { lazy, Suspense } from 'react'
import { Link, Route, Switch, useParams } from 'react-router-dom'

import Spinner from 'ui/Spinner'

import Summary from './Summary'

const Fileviewer = lazy(() => import('./subroute/Fileviewer'))

function CoverageTab() {
  const { provider, owner, repo, branch, path } = useParams()
  const Loader = (
    <div className="flex items-center justify-center py-16">
      <Spinner />
    </div>
  )

  return (
    <div className="flex flex-col gap-4 mx-4 md:mx-0">
      <Summary />
      <div className="flex flex-1 flex-col gap-4 border-t border-solid border-ds-gray-secondary">
        <Switch>
          <Route path="/:provider/:owner/:repo/tree/:branch/:path+" exact>
            <Suspense fallback={Loader}>
              {/* Same Root Tree Component after being clicked for the 1st time */}
              <h1>Root Tree Component after Clicked</h1>
              <Link
                to={`/${provider}/${owner}/${repo}/blobs/${branch}/${
                  path || 'src/index.js'
                }`}
              >
                Link
              </Link>
            </Suspense>
          </Route>
          <Route path="/:provider/:owner/:repo/tree/:branch" exact>
            <Suspense fallback={Loader}>
              {/* Same Root Tree Component after being clicked for the 1st time */}
              <h1>Root Tree Component after Clicked</h1>
              <Link
                to={`/${provider}/${owner}/${repo}/blobs/${branch}/${
                  path || 'src/index.js'
                }`}
              >
                Link
              </Link>
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
              <h1>Root OG Tree Component</h1>
              <Link
                to={`/${provider}/${owner}/${repo}/tree/${branch || 'master'}${
                  path ? `/${path}` : '/src/index.js'
                }`}
              >
                Tree Link
              </Link>
            </Suspense>
          </Route>
        </Switch>
      </div>
    </div>
  )
}

export default CoverageTab
