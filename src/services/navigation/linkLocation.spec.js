import { appLinks } from './linkLocation'

const params = { provider: '⛷', owner: '☃️', id: '👾', repo: '🦑' }

describe('App Links', () => {
  it('returns a path for provider', () => {
    expect(appLinks.provider.createPath(params)).toBe('/⛷')
  })
  it('returns a path for owner', () => {
    expect(appLinks.owner.createPath(params)).toBe('/⛷/☃️')
  })
  it('returns a path for repo', () => {
    expect(appLinks.repo.createPath(params)).toBe('/⛷/☃️/🦑')
  })
  it('returns a path for account', () => {
    expect(appLinks.account.createPath(params)).toBe('/account/⛷/☃️')
  })
  it('returns a path for yamlTab', () => {
    expect(appLinks.yamlTab.createPath(params)).toBe('/account/⛷/☃️/yaml')
  })
  it('returns a path for accessTab', () => {
    expect(appLinks.accessTab.createPath(params)).toBe('/account/⛷/☃️/access')
  })
  it('returns a path for billingAndUsers', () => {
    expect(appLinks.billingAndUsers.createPath(params)).toBe(
      '/account/⛷/☃️/billing'
    )
  })
  it('returns a path for upgradePlan', () => {
    expect(appLinks.upgradePlan.createPath(params)).toBe(
      '/account/⛷/☃️/billing/upgrade'
    )
  })
  it('returns a path for cancelPlan', () => {
    expect(appLinks.cancelPlan.createPath(params)).toBe(
      '/account/⛷/☃️/billing/cancel'
    )
  })
  it('returns a path for invoiceTab', () => {
    expect(appLinks.invoiceTab.createPath(params)).toBe(
      '/account/⛷/☃️/invoices'
    )
  })
  it('returns a path for invoiceDetail', () => {
    expect(appLinks.invoiceDetail.createPath(params)).toBe(
      '/account/⛷/☃️/invoices/👾'
    )
  })
})
