import { Suspense } from 'react'
import { Redirect, Route, Switch, useParams } from 'react-router-dom'

import LogoSpinner from 'old_ui/LogoSpinner'
import { useIsPersonalAccount } from 'services/useIsPersonalAccount'
import { useOwner } from 'services/user'

import { PlanBreadcrumbProvider } from './context'
import Header from './Header'
import PlanBreadcrumb from './PlanBreadcrumb'
import Tabs from './Tabs'

const path = '/plan/:provider/:owner'

const Loader = (
  <div className="flex-1 flex items-center justify-center mt-16">
    <LogoSpinner />
  </div>
)

function PlanPage() {
  const { owner } = useParams()
  const { data: ownerData } = useOwner({ username: owner })
  const isUserPersonalAccount = useIsPersonalAccount()

  return (
    <div className="flex flex-col gap-4">
      <Header />
      {ownerData?.isCurrentUserPartOfOrg && <Tabs />}
      <PlanBreadcrumbProvider>
        <PlanBreadcrumb />
        <Suspense fallback={Loader}>
          <Switch>
            {!isUserPersonalAccount && <Redirect to="/:provider/:owner" />}
            <Route path={path} exact>
              current org plan
            </Route>
            <Route path={`${path}/upgrade`} exact>
              plan work
            </Route>
            <Redirect
              from="/plan/:provider/:owner/*"
              to="/plan/:provider/:owner"
            />
          </Switch>
        </Suspense>
      </PlanBreadcrumbProvider>
    </div>
  )
}

export default PlanPage
