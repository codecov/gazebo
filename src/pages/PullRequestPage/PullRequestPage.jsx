import cs from 'classnames'
import { lazy, Suspense } from 'react'
import { Redirect, Switch, useParams } from 'react-router-dom'

import { SentryRoute } from 'sentry'

import SilentNetworkErrorWrapper from 'layouts/shared/SilentNetworkErrorWrapper'
import NotFound from 'pages/NotFound'
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
import IndirectChangesInfo from './IndirectChangesTab/IndirectChangesInfo'
import CompareSummarySkeleton from './Summary/CompareSummarySkeleton'

const CompareSummary = lazy(() => import('./Summary'))
const Root = lazy(() => import('./subroute/Root'))
const Flags = lazy(() => import('./Flags'))
const IndirectChangesTab = lazy(() => import('./IndirectChangesTab'))
const CommitsTable = lazy(() =>
  import('pages/RepoPage/CommitsTab/CommitsTable')
)

const Loader = (
  <div className="flex items-center justify-center py-16">
    <Spinner />
  </div>
)

const getTabsCounts = (commits, compareWithBase) => {
  const flagsCount = compareWithBase?.flagComparisonsCount || 0
  const indirectChangesCount = compareWithBase?.indirectChangedFilesCount || 0
  const impactedFilesCount = compareWithBase?.impactedFilesCount || 0

  const commitsCount = commits?.totalCount || 0
  return { flagsCount, commitsCount, impactedFilesCount, indirectChangesCount }
}

// eslint-disable-next-line complexity
function PullRequestPage() {
  const { owner, repo, pullId, provider } = useParams()
  const { data, isLoading } = usePullPageData({ provider, owner, repo, pullId })
  const { pullPageTabs } = useFlags({ pullPageTabs: true })
  const { flagsCount, indirectChangesCount, impactedFilesCount, commitsCount } =
    getTabsCounts(data?.pull?.commits, data?.pull?.compareWithBase)

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
      <Suspense fallback={<CompareSummarySkeleton />}>
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
          <article className="col-span-2 flex flex-col gap-3 md:gap-0">
            <TabNavigation
              tabs={[
                {
                  pageName: 'pullDetail',
                  children: (
                    <>
                      Impacted Files
                      <sup className="text-xs">{impactedFilesCount}</sup>
                    </>
                  ),
                  exact: true,
                },
                ...(pullPageTabs
                  ? [
                      {
                        pageName: 'pullIndirectChanges',
                        children: (
                          <>
                            Indirect Changes
                            <sup className="text-xs">
                              {indirectChangesCount}
                            </sup>
                          </>
                        ),
                      },
                      {
                        pageName: 'pullCommits',
                        children: (
                          <>
                            Commits
                            <sup className="text-xs">{commitsCount}</sup>
                          </>
                        ),
                      },
                      {
                        pageName: 'pullFlags',
                        children: (
                          <>
                            Flags
                            <sup className="text-xs">{flagsCount}</sup>
                          </>
                        ),
                      },
                    ]
                  : []),
              ]}
              component={<ToggleHeader coverageIsLoading={false} />}
            />
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
                      path="/:provider/:owner/:repo/pull/:pullId/indirect-changes"
                      exact={true}
                    >
                      <IndirectChangesInfo />
                      <IndirectChangesTab />
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
