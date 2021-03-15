import { Suspense } from 'react'
import { useParams, Switch, Route, Redirect } from 'react-router-dom'
import uniqueId from 'lodash/uniqueId'

import LogoSpinner from 'ui/LogoSpinner'
import SidebarLayout from 'layouts/SidebarLayout'

import SideMenu from './SideMenu'
import routes from './routes'

function AccountSettings() {
  const { provider, owner } = useParams()

  const tabLoading = (
    <div className="h-full w-full flex items-center justify-center">
      <LogoSpinner />
    </div>
  )

  return (
    <SidebarLayout sidebar={<SideMenu />}>
      <Suspense fallback={tabLoading}>
        <Switch>
          {routes.map(({ path, exact, Component, redirect }) => (
            <Route key={uniqueId(path)} path={path} exact={exact}>
              {redirect && (
                <Redirect path={path} to={redirect({ provider, owner })} />
              )}
              {Component && <Component provider={provider} owner={owner} />}
            </Route>
          ))}
        </Switch>
      </Suspense>
    </SidebarLayout>
  )
}

export default AccountSettings
