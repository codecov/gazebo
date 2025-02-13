import { Suspense } from 'react'
import { Switch, useParams } from 'react-router-dom'

import { SentryRoute } from 'sentry'

import SidebarLayout from 'layouts/SidebarLayout'
import { useOwner } from 'services/user'
import LoadingLogo from 'ui/LoadingLogo'
import Sidemenu from 'ui/Sidemenu'

import BadgesAndGraphsTab from './tabs/BadgesAndGraphsTab'
import ConfigurationManager from './tabs/ConfigurationManager'
import GeneralTab from './tabs/GeneralTab'
import YamlTab from './tabs/YamlTab'

import NotFound from '../../NotFound'

const tabLoading = (
  <div className="flex size-full items-center justify-center">
    <LoadingLogo />
  </div>
)

interface URLParams {
  owner: string
}

function ConfigTab() {
  const { owner } = useParams<URLParams>()
  const { data: currentOwner } = useOwner({ username: owner })

  if (!currentOwner?.isCurrentUserPartOfOrg) return <NotFound />

  const sideMenuLinks = [
    {
      pageName: 'configuration',
      exact: true,
      children: 'Configuration Manager',
    },
    {
      pageName: 'configGeneral',
    },
    { pageName: 'configYaml' },
    { pageName: 'configBadge' },
  ]

  return (
    <div className="mt-2">
      <SidebarLayout sidebar={<Sidemenu links={sideMenuLinks} />}>
        <Suspense fallback={tabLoading}>
          <Switch>
            <SentryRoute path="/:provider/:owner/:repo/config" exact>
              <ConfigurationManager />
            </SentryRoute>
            <SentryRoute path="/:provider/:owner/:repo/config/general" exact>
              <GeneralTab />
            </SentryRoute>
            <SentryRoute path="/:provider/:owner/:repo/config/yaml" exact>
              <YamlTab />
            </SentryRoute>
            <SentryRoute path="/:provider/:owner/:repo/config/badge" exact>
              <BadgesAndGraphsTab />
            </SentryRoute>
            <SentryRoute path="/:provider/:owner/:repo/config/*">
              <NotFound />
            </SentryRoute>
          </Switch>
        </Suspense>
      </SidebarLayout>
    </div>
  )
}

export default ConfigTab
