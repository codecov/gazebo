import { lazy, Suspense } from 'react'
import { Redirect, Route, Switch, useParams } from 'react-router-dom'

import SilentNetworkErrorWrapper from 'layouts/shared/SilentNetworkErrorWrapper'
import NotFound from 'pages/NotFound'
import { useCommits } from 'services/commits'
import { useLocationParams } from 'services/navigation'
import { useRepo } from 'services/repo'
import { useOwner } from 'services/user'
import { useRedirect } from 'shared/useRedirect'
import SearchField from 'ui/SearchField'
import Spinner from 'ui/Spinner'

import ContentsTableHeader from './ContentsTableHeader'
import DeactivatedRepo from './DeactivatedRepo'
import DisplayTypeButton from './DisplayTypeButton'
import FileBreadcrumb from './FileBreadcrumb'
import Summary from './Summary'

const FileViewer = lazy(() => import('./subroute/Fileviewer'))
const RepoContentsTable = lazy(() => import('./subroute/RepoContents'))
const Chart = lazy(() => import('./Chart'))

const defaultQueryParams = {
  search: '',
}

// eslint-disable-next-line max-statements, complexity
function CoverageTab() {
  const { params, updateParams } = useLocationParams(defaultQueryParams)
  const { provider, owner, repo } = useParams()
  const href = `/${provider}`
  const { hardRedirect } = useRedirect({ href })
  const { data: repoData } = useRepo({
    provider,
    owner,
    repo,
  })
  const { data: currentOwner } = useOwner({ username: owner })
  const { data: commits } = useCommits({ provider, owner, repo })

  const isCurrentUserPartOfOrg = currentOwner?.isCurrentUserPartOfOrg
  const isRepoPrivate = repoData?.repository?.private
  const isRepoActivated = repoData?.repository?.activated
  const repoHasNoCommits = !commits?.commits && commits?.commits?.length > 0

  const Loader = (
    <div className="flex items-center justify-center py-16">
      <Spinner />
    </div>
  )

  // if the repo is private and the user is not associated
  // then hard redirect to provider
  if (isRepoPrivate && !isCurrentUserPartOfOrg) {
    hardRedirect()
    return <NotFound />
  }
  // if the repo is not active and the user is not associated h
  // then ard redirect to provider
  else if (!isRepoActivated && !isCurrentUserPartOfOrg) {
    hardRedirect()
    return <NotFound />
  }
  // if the repo has no commits redirect to new repo page
  else if (repoHasNoCommits) {
    return <Redirect to={`/${provider}/${owner}/${repo}/new`} />
  }
  // if the repo is not activated show deactivation
  else if (!isRepoActivated) {
    return <DeactivatedRepo />
  }

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
            <SilentNetworkErrorWrapper>
              <Chart />
            </SilentNetworkErrorWrapper>
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
