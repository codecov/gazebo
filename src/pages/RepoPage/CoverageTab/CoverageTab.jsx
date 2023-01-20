import { lazy, Suspense } from 'react'
import { Switch } from 'react-router-dom'

import { SentryRoute } from 'sentry'

import Spinner from 'ui/Spinner'

import ToggleChart from './Chart/ToggleChart'
import Summary from './Summary'

const FileViewer = lazy(() => import('./subroute/Fileviewer'))
const RepoContentsTable = lazy(() => import('./subroute/RepoContents'))

const Loader = (
  <div className="flex items-center justify-center py-16">
    <Spinner />
  </div>
)

function CoverageTab() {
  return (
    <div className="flex flex-col gap-4 mx-4 sm:mx-0 divide-y border-solid border-ds-gray-secondary">
      <Summary />
      <Switch>
        <SentryRoute path="/:provider/:owner/:repo/blob/:ref/:path+" exact>
          <Suspense fallback={Loader}>
            <div className="flex flex-1 flex-col gap-2">
              <FileViewer />
            </div>
          </Suspense>
        </SentryRoute>
        <SentryRoute
          path={[
            '/:provider/:owner/:repo/tree/:branch/:path+',
            '/:provider/:owner/:repo/tree/:branch',
            '/:provider/:owner/:repo',
          ]}
          exact
        >
          <div>
            <ToggleChart />
            <Suspense fallback={Loader}>
              <RepoContentsTable />
            </Suspense>
          </div>
        </SentryRoute>
      </Switch>
    </div>
  )
}

export default CoverageTab
