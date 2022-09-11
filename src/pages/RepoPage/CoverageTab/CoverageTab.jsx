import { lazy, Suspense } from 'react'
import { Route, Switch, useParams } from 'react-router-dom'

import { useLocationParams } from 'services/navigation'
import { useRepo } from 'services/repo'
import SearchField from 'ui/SearchField'
import Spinner from 'ui/Spinner'

import ContentsTableHeader from './ContentsTableHeader'
import DeactivatedRepo from './DeactivatedRepo'
import FileBreadcrumb from './FileBreadcrumb'
import Summary from './Summary'

const FileViewer = lazy(() => import('./subroute/Fileviewer'))
const RepoContentsTable = lazy(() => import('./subroute/RepoContents'))

const defaultQueryParams = {
  search: '',
}

function CoverageTab() {
  const { params, updateParams } = useLocationParams(defaultQueryParams)
  const { provider, owner, repo } = useParams()
  const { data: repoData } = useRepo({
    provider,
    owner,
    repo,
  })

  const isRepoActivated = repoData?.repository?.activated

  const Loader = (
    <div className="flex items-center justify-center py-16">
      <Spinner />
    </div>
  )

  return isRepoActivated ? (
    <div className="flex flex-col gap-4 mx-4 md:mx-0">
      <Summary />
      <div className="flex flex-1 flex-col gap-4 border-t border-solid border-ds-gray-secondary">
        <Switch>
          <Route path="/:provider/:owner/:repo/tree/:branch/:path+" exact>
            <ContentsTableHeader>
              <FileBreadcrumb />
              <SearchField
                placeholder={'Search for files'}
                searchValue={params?.search}
                setSearchValue={(search) => updateParams({ search })}
              />
            </ContentsTableHeader>
            <Suspense fallback={Loader}>
              <RepoContentsTable />
            </Suspense>
          </Route>
          <Route path="/:provider/:owner/:repo/tree/:branch" exact>
            <ContentsTableHeader>
              <FileBreadcrumb />
              <SearchField
                placeholder={'Search for files'}
                searchValue={params?.search}
                setSearchValue={(search) => updateParams({ search })}
              />
            </ContentsTableHeader>
            <Suspense fallback={Loader}>
              <RepoContentsTable />
            </Suspense>
          </Route>
          <Route path="/:provider/:owner/:repo/blob/:ref/:path+" exact>
            <Suspense fallback={Loader}>
              <FileViewer />
            </Suspense>
          </Route>
          <Route path="/:provider/:owner/:repo/" exact>
            <ContentsTableHeader>
              <FileBreadcrumb />
              <SearchField
                placeholder={'Search for files'}
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
  ) : (
    <DeactivatedRepo />
  )
}

export default CoverageTab
