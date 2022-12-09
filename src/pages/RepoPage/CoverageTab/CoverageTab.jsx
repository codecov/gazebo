import { lazy, Suspense } from 'react'
import { Route, Switch } from 'react-router-dom'

import { useLocationParams } from 'services/navigation'
import SearchField from 'ui/SearchField'
import Spinner from 'ui/Spinner'

import ToggleChart from './Chart/ToggleChart'
import ContentsTableHeader from './ContentsTableHeader'
import DisplayTypeButton from './DisplayTypeButton'
import FileBreadcrumb from './FileBreadcrumb'
import Summary from './Summary'

const FileViewer = lazy(() => import('./subroute/Fileviewer'))
const RepoContentsTable = lazy(() => import('./subroute/RepoContents'))

const defaultQueryParams = {
  search: '',
}

const Loader = (
  <div className="flex items-center justify-center py-16">
    <Spinner />
  </div>
)

function CoverageTab() {
  const { params, updateParams } = useLocationParams(defaultQueryParams)

  return (
    <div className="flex flex-col gap-4 mx-4 md:mx-0">
      <Summary />
      <div className="flex flex-1 flex-col gap-4 border-t border-solid border-ds-gray-secondary">
        <Switch>
          <Route
            path={[
              '/:provider/:owner/:repo/tree/:branch/:path+',
              '/:provider/:owner/:repo/tree/:branch',
              '/:provider/:owner/:repo',
            ]}
            exact
          >
            <ToggleChart />
          </Route>
        </Switch>
        <Switch>
          <Route path="/:provider/:owner/:repo/blob/:ref/:path+" exact>
            <Suspense fallback={Loader}>
              <FileViewer />
            </Suspense>
          </Route>
          <Route
            path={[
              '/:provider/:owner/:repo/tree/:branch/:path+',
              '/:provider/:owner/:repo/tree/:branch',
              '/:provider/:owner/:repo',
            ]}
            exact
          >
            <ContentsTableHeader>
              <div className="flex gap-4">
                <DisplayTypeButton />
                <FileBreadcrumb />
              </div>
              <SearchField
                dataMarketing="files-search"
                placeholder="Search for files"
                searchValue={params?.search}
                setSearchValue={(search) => updateParams({ search })}
              />
            </ContentsTableHeader>
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
