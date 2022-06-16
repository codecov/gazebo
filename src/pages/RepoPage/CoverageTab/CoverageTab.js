import { lazy, Suspense } from 'react'
import { Route, Switch } from 'react-router-dom'

import { useLocationParams } from 'services/navigation'
import Spinner from 'ui/Spinner'

import BreadcrumbSearch from './BreadcrumbSearch'
import Summary from './Summary'

const FileViewer = lazy(() => import('./subroute/Fileviewer'))
const RepoContentsTable = lazy(() => import('./subroute/RepoContents'))

const defaultQueryParams = {
  search: '',
}

function CoverageTab() {
  const { params, updateParams } = useLocationParams(defaultQueryParams)
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
            <BreadcrumbSearch
              searchValue={params.search}
              setSearchValue={(search) => updateParams({ search })}
            />
            <Suspense fallback={Loader}>
              <RepoContentsTable />
            </Suspense>
          </Route>
          <Route path="/:provider/:owner/:repo/tree/:branch" exact>
            <BreadcrumbSearch
              searchValue={params.search}
              setSearchValue={(search) => updateParams({ search })}
            />
            <Suspense fallback={Loader}>
              <RepoContentsTable />
            </Suspense>
          </Route>
          <Route path="/:provider/:owner/:repo/blobs/:ref/:path+" exact>
            <Suspense fallback={Loader}>
              <FileViewer />
            </Suspense>
          </Route>
          <Route path="/:provider/:owner/:repo/" exact>
            <BreadcrumbSearch
              searchValue={params.search}
              setSearchValue={(search) => updateParams({ search })}
            />
            <Suspense fallback={Loader}>
              <RepoContentsTable />
            </Suspense>
          </Route>
        </Switch>
      </div>
    </div>
  )
}

export default CoverageTab
