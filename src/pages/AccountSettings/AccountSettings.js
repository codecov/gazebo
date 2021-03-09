import { Suspense } from 'react'
import { useParams, Switch, Route, Redirect } from 'react-router-dom'
import uniqueId from 'lodash/uniqueId'

import LogoSpinner from 'ui/LogoSpinner'
import SidebarLayout from 'layouts/SidebarLayout'
import { useUser } from 'services/user'

import SideMenu from './SideMenu'
import routes from './routes'

function AccountSettings() {
  const { data: user } = useUser()
  const { provider, owner } = useParams()
  const isPersonalSettings = user.username.toLowerCase() === owner.toLowerCase()

  const tabLoading = (
    <div className="h-full w-full flex items-center justify-center">
      <LogoSpinner />
    </div>
  )

  return (
    <SidebarLayout
      sidebar={<SideMenu isPersonalSettings={isPersonalSettings} />}
    >
      <Suspense fallback={tabLoading}>
        <Switch>
          {routes.map(({ path, exact, Component, redirect }) => (
            <Route key={uniqueId(path)} path={path} exact={exact}>
              {redirect && (
                <Redirect path={path} to={redirect({ provider, owner })} />
              )}
              {Component && (
                <Component
                  provider={provider}
                  owner={owner}
                  isPersonalSettings={isPersonalSettings}
                />
              )}
            </Route>
          ))}
        </Switch>
      </Suspense>
    </SidebarLayout>
  )
}

export default AccountSettings
