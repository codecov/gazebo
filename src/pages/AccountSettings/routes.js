import { lazy } from 'react'

const YAMLTab = lazy(() => import('./tabs/YAML'))
const CancelPlanTab = lazy(() => import('./tabs/CancelPlan'))
const UpgradePlanTab = lazy(() => import('./tabs/UpgradePlan'))
const InvoicesTab = lazy(() => import('./tabs/Invoices'))
const InvoiceDetailTab = lazy(() => import('./tabs/InvoiceDetail'))
const AdminTab = lazy(() => import('./tabs/Admin'))
const BillingAndUsersTab = lazy(() => import('./tabs/BillingAndUsers'))
const AccessTab = lazy(() => import('./tabs/Access'))

/**
 * Route shape
 *
 * path: string,
 * exact:boolean,
 * Component: React component
 * redirects: Route Array
 */

const routes = [
  {
    path: '/account/:provider/:owner/yaml/',
    exact: true,
    Component: YAMLTab,
  },
  {
    path: '/account/:provider/:owner/access/',
    exact: true,
    Component: AccessTab,
  },
  {
    path: '/account/:provider/:owner/billing/',
    exact: true,
    Component: BillingAndUsersTab,
  },
  {
    path: '/account/:provider/:owner/users/',
    exact: true,
    redirect: ({ provider, owner }) => `/account/${provider}/${owner}/billing/`,
  },
  {
    path: '/account/:provider/:owner/billing/upgrade/',
    exact: true,
    Component: UpgradePlanTab,
  },
  {
    path: '/account/:provider/:owner/billing/cancel/',
    exact: true,
    Component: CancelPlanTab,
  },
  {
    path: '/account/:provider/:owner/invoices/',
    exact: true,
    Component: InvoicesTab,
  },
  {
    path: '/account/:provider/:owner/invoices/:id/',
    exact: true,
    Component: InvoiceDetailTab,
  },
  {
    path: '/account/:provider/:owner/',
    exact: true,
    Component: AdminTab,
  },
]

export default routes
