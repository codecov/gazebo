import { lazy, Suspense } from 'react'
import { Switch, useParams } from 'react-router-dom'

import { SentryRoute } from 'sentry'

import { useRepoSettingsTeam } from 'services/repo'
import { TierNames, useTier } from 'services/tier'
import LoadingLogo from 'ui/LoadingLogo'

import { CoverageTabNavigator } from './CoverageTabNavigator'
import OverviewTab from './OverviewTab'

const FlagsTab = lazy(() => import('./FlagsTab'))
const ComponentsTab = lazy(() => import('./ComponentsTab'))

const path = '/:provider/:owner/:repo'

const Loader = () => (
  <div className="flex flex-1 items-center justify-center pt-16">
    <LoadingLogo />
  </div>
)

interface URLParams {
  provider: string
  owner: string
}

function CoverageTab() {
  const { provider, owner } = useParams<URLParams>()
  const { data: tierData } = useTier({
    owner,
    provider,
  })
  const { data: repoSettings } = useRepoSettingsTeam()

  const hideNavigator =
    tierData === TierNames.TEAM && repoSettings?.repository?.private

  return (
    <div className="flex flex-col gap-2 divide-y">
      {hideNavigator ? null : <CoverageTabNavigator />}
      <Suspense fallback={<Loader />}>
        <Switch>
          <SentryRoute path="/:provider/:owner/:repo/flags" exact>
            <FlagsTab />
          </SentryRoute>
          <SentryRoute
            path={[
              '/:provider/:owner/:repo/components',
              '/:provider/:owner/:repo/components/:branch',
            ]}
            exact
          >
            <ComponentsTab />
          </SentryRoute>
          <SentryRoute
            path={[
              path,
              `${path}/blob/:ref/:path+`,
              `${path}/tree/:branch`,
              `${path}/tree/:branch/:path+`,
            ]}
            exact
          >
            <OverviewTab />
          </SentryRoute>
        </Switch>
      </Suspense>
    </div>
  )
}

export default CoverageTab
