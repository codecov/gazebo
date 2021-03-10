import routes from './routes'
jest.mock('./tabs/YAML', () => () => 'YAMLTab')
jest.mock('./tabs/CancelPlan', () => () => 'CancelPlan')
jest.mock('./tabs/UpgradePlan', () => () => 'UpgradePlan')
jest.mock('./tabs/Invoices', () => () => 'Invoices')
jest.mock('./tabs/InvoiceDetail', () => () => 'InvoiceDetail')
jest.mock('./tabs/Admin', () => () => 'AdminTab')
jest.mock('./tabs/BillingAndUsers', () => () => 'BillingAndUsers')
jest.mock('./tabs/Access', () => () => 'Access')

describe('Account Routes', () => {
  it('supports creating a redirect for a path', () => {
    const [routeWithRedirect] = routes.filter((route) => route.redirect)

    expect(routeWithRedirect.redirect({ provider: 'foo', owner: 'bar' })).toBe(
      '/account/foo/bar/billing/'
    )
  })
})
