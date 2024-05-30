import { lazy } from 'react'
import { Switch } from 'react-router-dom'

import { SentryRoute } from 'sentry'

import { CoverageTabNavigator } from './CoverageTabNavigator'
import OverviewTab from './OverviewTab'

const FlagsTab = lazy(() => import('./FlagsTab'))
const ComponentsTab = lazy(() => import('./ComponentsTab'))

function CoverageTab() {
  return (
    <div>
      <CoverageTabNavigator />
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
