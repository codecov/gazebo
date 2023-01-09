import cs from 'classnames'
import { lazy, Suspense } from 'react'
import { Redirect, Switch, useParams } from 'react-router-dom'

import { SentryRoute } from 'sentry'

import SilentNetworkErrorWrapper from 'layouts/shared/SilentNetworkErrorWrapper'
import NotFound from 'pages/NotFound'
import CommitsTable from 'pages/RepoPage/CommitsTab/CommitsTable'
import { useFlags } from 'shared/featureFlags'
import Breadcrumb from 'ui/Breadcrumb'
import ToggleHeader from 'ui/FileViewer/ToggleHeader'
import Spinner from 'ui/Spinner'
import TabNavigation from 'ui/TabNavigation'

import Commits from './Commits'
import ErrorBanner from './ErrorBanner'
import { ComparisonReturnType } from './ErrorBanner/constants.js'
import Header from './Header'
import { usePullPageData } from './hooks'

const CompareSummary = lazy(() => import('./Summary'))
const Root = lazy(() => import('./subroute/Root'))
const Flags = lazy(() => import('./Flags'))

const Loader = (
  <div className="flex items-center justify-center py-16">
    <Spinner />
  </div>
)

// eslint-disable-next-line complexity
function PullRequestPage() {
  const { owner, repo, pullId, provider } = useParams()
  const { data, isLoading } = usePullPageData({ provider, owner, repo, pullId })
  const { pullPageTabs } = useFlags({ pullPageTabs: true })

  if ((!isLoading && !data?.hasAccess) || (!isLoading && !data?.pull)) {
    return <NotFound />
  }

  const resultType = data?.pull?.compareWithBase?.__typename

  return (
    <div className="flex flex-col gap-4 mx-4 md:mx-0">
      <Breadcrumb
        paths={[
          { pageName: 'owner', text: owner },
          { pageName: 'repo', text: repo },
          { pageName: 'pulls', text: 'Pulls' },
          {
            pageName: 'pullDetail',
            options: { pullId },
            readOnly: true,
            text: pullId,
          },
        ]}
      />
      <Header />
      <Suspense fallback={Loader}>
        <CompareSummary />
      </Suspense>
      {resultType !== ComparisonReturnType.SUCCESFUL_COMPARISON ? (
        <ErrorBanner errorType={resultType} />
      ) : (
        <div
          className={cs('grid gap-4 grid-cols-1 lg:grid-cols-3 space-y-2', {
            'lg:grid-cols-2': pullPageTabs,
          })}
        >
          <article className="col-span-2 flex flex-col">
            <TabNavigation
              tabs={[
                {
                  pageName: 'pullDetail',
                  children: 'Impacted files',
                  exact: true,
                },
                ...(pullPageTabs
                  ? [
                      { pageName: 'pullIndirectChanges' },
                      { pageName: 'pullCommits' },
                      { pageName: 'pullFlags' },
                    ]
                  : []),
              ]}
            />
            <div className="md:mt-[-25px] md:pb-2 w-fit self-end">
              <ToggleHeader title="" coverageIsLoading={false} />
            </div>
            <Switch>
              <Suspense fallback={Loader}>
                <SentryRoute
                  path="/:provider/:owner/:repo/pull/:pullId"
                  exact={true}
                >
                  <Root />
                </SentryRoute>
                {pullPageTabs && (
                  <>
                    <SentryRoute
                      path="/:provider/:owner/:repo/pull/:pullId/indirectChanges"
                      exact={true}
                    >
                      indirect changes
                    </SentryRoute>
                    <SentryRoute
                      path="/:provider/:owner/:repo/pull/:pullId/commits"
                      exact={true}
                    >
                      <CommitsTable />
                    </SentryRoute>
                    <SentryRoute
                      path="/:provider/:owner/:repo/pull/:pullId/flags"
                      exact={true}
                    >
                      <SilentNetworkErrorWrapper>
                        <Flags />
                      </SilentNetworkErrorWrapper>
                    </SentryRoute>
                  </>
                )}
              </Suspense>
              <Redirect
                from="/:provider/:owner/:repo/pull/:pullId/*"
                to="/:provider/:owner/:repo/pull/:pullId"
              />
            </Switch>
          </article>
          {!pullPageTabs && (
            <aside className="flex flex-col gap-4 self-start sticky top-1.5">
              <Commits />
              <SilentNetworkErrorWrapper>
                <Flags />
              </SilentNetworkErrorWrapper>
            </aside>
          )}
        </div>
      )}
    </div>
  )
}

export default PullRequestPage
