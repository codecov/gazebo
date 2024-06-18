import { lazy, Suspense } from 'react'
import { Switch, useParams } from 'react-router-dom'

import { SentryRoute } from 'sentry'

import SidebarLayout from 'layouts/SidebarLayout'
import { useOwner } from 'services/user'
import LoadingLogo from 'ui/LoadingLogo'

import SideMenuSettings from './SideMenuSettings'

const NotFound = lazy(() => import('../../NotFound'))
const GeneralTab = lazy(() => import('./tabs/GeneralTab'))
const YamlTab = lazy(() => import('./tabs/YamlTab'))
const BadgesAndGraphsTab = lazy(() => import('./tabs/BadgesAndGraphsTab'))

const tabLoading = (
  <div className="flex size-full items-center justify-center">
    <LoadingLogo />
  </div>
)

function SettingsTab() {
  const { owner } = useParams()
  const { data: currentOwner } = useOwner({ username: owner })

  if (!currentOwner?.isCurrentUserPartOfOrg) return <NotFound />

  return (
    <div className="mt-2">
      <SidebarLayout sidebar={<SideMenuSettings />}>
        <Suspense fallback={tabLoading}>
          <Switch>
            <SentryRoute path="/:provider/:owner/:repo/settings" exact>
              <GeneralTab />
            </SentryRoute>
            <SentryRoute path="/:provider/:owner/:repo/settings/yaml" exact>
              <YamlTab />
            </SentryRoute>
            <SentryRoute path="/:provider/:owner/:repo/settings/badge" exact>
              <BadgesAndGraphsTab />
            </SentryRoute>
            <SentryRoute path="/:provider/:owner/:repo/settings/*">
              <NotFound />
            </SentryRoute>
          </Switch>
        </Suspense>
      </SidebarLayout>
    </div>
  )
}

export default SettingsTab
