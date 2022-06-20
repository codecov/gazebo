import { lazy, Suspense } from 'react'
import { Route, Switch, useParams } from 'react-router-dom'

import SidebarLayout from 'layouts/SidebarLayout'
import LogoSpinner from 'old_ui/LogoSpinner'
import { useOwner } from 'services/user'

import SideMenuSettings from './SideMenuSettings'
import BadgesAndGraphsTab from './tabs/BadgesAndGraphsTab'
import YamlTab from './tabs/YamlTab'

const NotFound = lazy(() => import('../../NotFound'))
const GeneralTab = lazy(() => import('./tabs/GeneralTab'))

const tabLoading = (
  <div className="h-full w-full flex items-center justify-center">
    <LogoSpinner />
  </div>
)

function SettingsTab() {
  const { owner } = useParams()
  const { data: currentOwner } = useOwner({ username: owner })
  const { isCurrentUserPartOfOrg } = currentOwner

  if (!isCurrentUserPartOfOrg) return <NotFound />

  return (
    <SidebarLayout sidebar={<SideMenuSettings />}>
      <Suspense fallback={tabLoading}>
        <Switch>
          <Route path="/:provider/:owner/:repo/settings" exact>
            <GeneralTab />
          </Route>
          <Route path="/:provider/:owner/:repo/settings/yaml" exact>
            <YamlTab />
          </Route>
          <Route path="/:provider/:owner/:repo/settings/badge" exact>
            <BadgesAndGraphsTab />
          </Route>
          <Route path="/:provider/:owner/:repo/settings/*">
            <NotFound />
          </Route>
        </Switch>
      </Suspense>
    </SidebarLayout>
  )
}

export default SettingsTab
