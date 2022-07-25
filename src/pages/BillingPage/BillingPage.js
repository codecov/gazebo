import { Suspense } from 'react'
import { Redirect, Route, Switch, useParams } from 'react-router-dom'

import LogoSpinner from 'old_ui/LogoSpinner'
import { useOwner } from 'services/user'

import BillingBreadcrumb from './BillingBreadcumb'
import { BillingBreadcrumbProvider } from './context'
import Header from './Header'
import Tabs from './Tabs'

const path = '/billing/:provider/:owner'

const Loader = (
  <div className="flex-1 flex items-center justify-center mt-16">
    <LogoSpinner />
  </div>
)

function BillingPage() {
  const { owner } = useParams()
  const { data: ownerData } = useOwner({ username: owner })

  return (
    <div className="flex flex-col gap-4">
      <Header />
      {ownerData?.isCurrentUserPartOfOrg && <Tabs />}
      <BillingBreadcrumbProvider>
        <BillingBreadcrumb />
        <Suspense fallback={Loader}>
          <Switch>
            <Route path={path} exact>
              current org plan
            </Route>
            <Route path={`${path}/upgrade`} exact>
              plan work
            </Route>
            <Redirect
              from="/billing/:provider/:owner/*"
              to="/billing/:provider/:owner"
            />
          </Switch>
        </Suspense>
      </BillingBreadcrumbProvider>
    </div>
  )
}

export default BillingPage
