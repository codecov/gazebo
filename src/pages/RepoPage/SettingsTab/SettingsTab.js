import { lazy, Suspense } from 'react'
import { Route, Switch } from 'react-router-dom'

import SidebarLayout from 'layouts/SidebarLayout'
import LogoSpinner from 'old_ui/LogoSpinner'

import SideMenuSettings from './SideMenuSettings'

const NotFound = lazy(() => import('../../NotFound'))
const GeneralTab = lazy(() => import('./tabs/GeneralTab'))

const tabLoading = (
  <div className="h-full w-full flex items-center justify-center">
    <LogoSpinner />
  </div>
)

function SettingsTab() {
  return (
    <SidebarLayout sidebar={<SideMenuSettings />}>
      <Suspense fallback={tabLoading}>
        <Switch>
          <Route path="/:provider/:owner/:repo/settings" exact>
            <GeneralTab />
          </Route>
          <Route path="/:provider/:owner/:repo/settings/yaml" exact>
            <>yaml tab</>
          </Route>
          <Route path="/:provider/:owner/:repo/settings/badge" exact>
            <>badge tab</>
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
