import { lazy, Suspense } from 'react'
import { Switch, useParams } from 'react-router-dom'

import { SentryRoute } from 'sentry'

import SidebarLayout from 'layouts/SidebarLayout'
import { useOwner } from 'services/user'
import { useFlags } from 'shared/featureFlags'
import LoadingLogo from 'ui/LoadingLogo'
import Sidemenu from 'ui/Sidemenu'

import ConfigurationManager from './tabs/ConfigurationManager'

const NotFound = lazy(() => import('../../NotFound'))
const GeneralTab = lazy(() => import('./tabs/GeneralTab'))
const YamlTab = lazy(() => import('./tabs/YamlTab'))
const BadgesAndGraphsTab = lazy(() => import('./tabs/BadgesAndGraphsTab'))

const tabLoading = (
  <div className="flex size-full items-center justify-center">
    <LoadingLogo />
  </div>
)

interface URLParams {
  owner: string
}

function SettingsTab() {
  const { owner } = useParams<URLParams>()
  const { data: currentOwner } = useOwner({ username: owner })
  const { inAppMarketingTab } = useFlags({
    inAppMarketingTab: false,
  })

  if (!currentOwner?.isCurrentUserPartOfOrg) return <NotFound />

  const inAppMarketingLink = inAppMarketingTab
    ? [{ pageName: 'settingsConfiguration' }]
    : []
  const sideMenuLinks = [
    {
      pageName: 'settingsGeneral',
      exact: true,
    },
    ...inAppMarketingLink,
    { pageName: 'settingsYaml' },
    { pageName: 'settingsBadge' },
  ]

  return (
    <div className="mt-2">
      <SidebarLayout sidebar={<Sidemenu links={sideMenuLinks} />}>
        <Suspense fallback={tabLoading}>
          <Switch>
            <SentryRoute path="/:provider/:owner/:repo/settings" exact>
              <GeneralTab />
            </SentryRoute>
            {inAppMarketingTab ? (
              <SentryRoute path="/:provider/:owner/:repo/settings/config" exact>
                <ConfigurationManager />
              </SentryRoute>
            ) : null}
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
