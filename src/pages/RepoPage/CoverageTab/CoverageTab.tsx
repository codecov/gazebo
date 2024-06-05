import { lazy } from 'react'
import { Switch, useParams } from 'react-router-dom'

import { SentryRoute } from 'sentry'

import { useRepoSettingsTeam } from 'services/repo'
import { TierNames, useTier } from 'services/tier'
import Spinner from 'ui/Spinner'

import { CoverageTabNavigator } from './CoverageTabNavigator'
import OverviewTab from './OverviewTab'

const FlagsTab = lazy(() => import('./FlagsTab'))
const ComponentsTab = lazy(() => import('./ComponentsTab'))

const Loader = () => (
  <div className="mt-16 flex flex-1 items-center justify-center">
    <Spinner />
  </div>
)

interface URLParams {
  provider: string
  owner: string
}

function CoverageTab() {
  const { provider, owner } = useParams<URLParams>()
  const { data: tierData, isLoading: tierLoading } = useTier({
    owner,
    provider,
  })
  const { data: repoSettings, isLoading: repoLoading } = useRepoSettingsTeam()

  if (tierLoading || repoLoading) {
    return <Loader />
  }

  const hideNavigator =
    tierData === TierNames.TEAM && repoSettings?.repository?.private

  return (
    <div className="flex flex-col gap-2 divide-y">
      {hideNavigator ? null : <CoverageTabNavigator />}
      <Switch>
        <SentryRoute path="/:provider/:owner/:repo/flags" exact>
          <FlagsTab />
        </SentryRoute>
        <SentryRoute path="/:provider/:owner/:repo/components" exact>
          <ComponentsTab />
        </SentryRoute>
        <SentryRoute path="/:provider/:owner/:repo">
          <OverviewTab />
        </SentryRoute>
      </Switch>
    </div>
  )
}

export default CoverageTab
