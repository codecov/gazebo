import { lazy, Suspense, useState } from 'react'
import { Redirect, Switch, useParams } from 'react-router-dom'

import { SentryRoute } from 'sentry'

import NotFound from 'pages/NotFound'
import { useRepo } from 'services/repo'
import CustomError from 'shared/CustomError'
import A from 'ui/A'
import LoadingLogo from 'ui/LoadingLogo'

import { RepoBreadcrumbProvider } from './context'
import DeactivatedRepo from './DeactivatedRepo'
import RepoBreadcrumb from './RepoBreadcrumb'
import RepoPageTabs from './RepoPageTabs'

const CommitsTab = lazy(() => import('./CommitsTab'))
const CoverageTab = lazy(() => import('./CoverageTab'))
const NewRepoTab = lazy(() => import('./CoverageOnboarding'))
const PullsTab = lazy(() => import('./PullsTab'))
const FlagsTab = lazy(() => import('./FlagsTab'))
const SettingsTab = lazy(() => import('./SettingsTab'))

const path = '/:provider/:owner/:repo'

const Loader = () => (
  <div className="mt-16 flex flex-1 items-center justify-center">
    <LoadingLogo />
  </div>
)

function RepoPage() {
  const { provider, owner, repo } = useParams()
  const [refetchEnabled, setRefetchEnabled] = useState(false)
  const { data: repoData } = useRepo({
    provider,
    owner,
    repo,
    opts: {
      refetchOnWindowFocus: refetchEnabled,
    },
  })

  const isCurrentUserActivated = repoData?.isCurrentUserActivated
  const isRepoActive = repoData?.repository?.active
  const isRepoActivated = repoData?.repository?.activated
  const isRepoPrivate = !!repoData?.repository?.private

  if (!refetchEnabled && !isRepoActivated) {
    setRefetchEnabled(true)
  }

  if (!repoData?.repository) return <NotFound />

  if (!isCurrentUserActivated && isRepoPrivate) {
    throw new CustomError({
      status: 403,
      detail: (
        <p>
          Activation is required to view this repo, please{' '}
          <A to={{ pageName: 'membersTab' }}>click here </A> to activate your
          account.
        </p>
      ),
    })
  }

  return (
    <RepoBreadcrumbProvider>
      <div>
        <RepoBreadcrumb />
        <RepoPageTabs refetchEnabled={refetchEnabled} />
        <Suspense fallback={<Loader />}>
          {isRepoActivated ? (
            <Switch>
              <SentryRoute
                path={[
                  path,
                  `${path}/blob/:ref/:path+`,
                  `${path}/tree/:branch`,
                  `${path}/tree/:branch/:path+`,
                ]}
                exact
              >
                <CoverageTab />
              </SentryRoute>
              <SentryRoute path={`${path}/flags`} exact>
                <FlagsTab />
              </SentryRoute>
              <SentryRoute path={`${path}/commits`} exact>
                <CommitsTab />
              </SentryRoute>
              <SentryRoute path={`${path}/pulls`} exact>
                <PullsTab />
              </SentryRoute>
              <Redirect from={`${path}/compare`} to={`${path}/pulls`} />
              <SentryRoute path={`${path}/settings`}>
                <SettingsTab />
              </SentryRoute>
              <Redirect
                from="/:provider/:owner/:repo/*"
                to="/:provider/:owner/:repo"
              />
            </Switch>
          ) : (
            <>
              {isRepoActive ? (
                <Switch>
                  <SentryRoute path={`${path}/settings`}>
                    <SettingsTab />
                  </SentryRoute>
                  <SentryRoute path={path}>
                    <DeactivatedRepo />
                  </SentryRoute>
                </Switch>
              ) : (
                <Switch>
                  <SentryRoute
                    path={[
                      `${path}/new`,
                      `${path}/new/circle-ci`,
                      `${path}/new/other-ci`,
                    ]}
                    exact
                  >
                    <NewRepoTab />
                  </SentryRoute>
                  <SentryRoute path={`${path}/settings`}>
                    <SettingsTab />
                  </SentryRoute>
                  <Redirect from={path} to={`${path}/new`} />
                  <Redirect from={`${path}/*`} to={`${path}/new`} />
                </Switch>
              )}
            </>
          )}
        </Suspense>
      </div>
    </RepoBreadcrumbProvider>
  )
}

export default RepoPage
