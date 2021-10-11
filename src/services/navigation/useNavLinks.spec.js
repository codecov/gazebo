import { MemoryRouter, Route } from 'react-router-dom'
import { renderHook } from '@testing-library/react-hooks'

import config from 'config'

import { useNavLinks, useStaticNavLinks } from './useNavLinks'

describe('useNavLinks', () => {
  let hookData

  function setup(location) {
    hookData = renderHook(() => useNavLinks(), {
      wrapper: (props) => (
        <MemoryRouter initialEntries={location} initialIndex={0}>
          <Route path="/:provider">{props.children}</Route>
          <Route path="/:provider/:owner">{props.children}</Route>
          <Route path="/:provider/:owner/:repo">{props.children}</Route>
          <Route path="/:provider/:owner/:repo/:id">{props.children}</Route>
          <Route path="/:provider/:owner/:repo/commit/:commit/file/:path">
            {props.children}
          </Route>
        </MemoryRouter>
      ),
    })
  }

  describe('provider link', () => {
    beforeAll(() => {
      setup(['/gl/doggo/squirrel-locator'])
    })

    it('Returns the correct link with nothing passed', () => {
      expect(hookData.result.current.provider.path()).toBe('/gl')
    })
    it('can override the params', () => {
      expect(hookData.result.current.provider.path({ provider: 'dog' })).toBe(
        '/dog'
      )
    })
  })

  describe('Sign Out', () => {
    beforeAll(() => {
      setup(['/gl/doggo/squirrel-locator'])
    })

    it('Returns the correct link with nothing passed', () => {
      expect(hookData.result.current.signOut.path()).toBe(
        `${config.BASE_URL}/logout/gl`
      )
    })
    it('can override the params', () => {
      expect(hookData.result.current.signOut.path({ provider: 'bb' })).toBe(
        `${config.BASE_URL}/logout/bb`
      )
    })
  })

  describe('Sign In', () => {
    beforeAll(() => {
      setup(['/gl/doggo/squirrel-locator'])
    })

    it('Returns the correct link with nothing passed', () => {
      expect(hookData.result.current.signIn.path()).toBe(
        `${config.BASE_URL}/login/gl`
      )
    })

    it('can override the params', () => {
      expect(hookData.result.current.signIn.path({ provider: 'bb' })).toBe(
        `${config.BASE_URL}/login/bb`
      )
    })

    it('can add a `to` redirection', () => {
      expect(
        hookData.result.current.signIn.path({
          to: 'htts://app.codecov.io/gh/codecov',
        })
      ).toBe(
        `${config.BASE_URL}/login/gl?to=htts%3A%2F%2Fapp.codecov.io%2Fgh%2Fcodecov`
      )
    })

    it('forwards the utm tags', () => {
      setup([
        '/gh?utm_source=a&utm_medium=b&utm_campaign=c&utm_term=d&utm_content=e&not=f',
      ])
      expect(
        hookData.result.current.signIn.path({
          to: 'htts://app.codecov.io/gh/codecov',
        })
      ).toBe(
        `${config.BASE_URL}/login/gh?to=htts%3A%2F%2Fapp.codecov.io%2Fgh%2Fcodecov&utm_source=a&utm_medium=b&utm_campaign=c&utm_term=d&utm_content=e`
      )
    })
  })

  describe('owner link', () => {
    beforeAll(() => {
      setup(['/gl/doggo/squirrel-locator'])
    })

    it('Returns the correct link with nothing passed', () => {
      expect(hookData.result.current.owner.path()).toBe('/gl/doggo')
    })
    it('can override the params', () => {
      expect(hookData.result.current.owner.path({ provider: 'bb' })).toBe(
        '/bb/doggo'
      )
      expect(hookData.result.current.owner.path({ owner: 'cat' })).toBe(
        '/gl/cat'
      )
    })
  })

  describe('owner internal link', () => {
    beforeAll(() => {
      setup(['/gl/doggo/squirrel-locator'])
    })

    it('Returns the correct link with nothing passed', () => {
      expect(hookData.result.current.owner.path()).toBe('/gl/doggo')
    })
    it('can override the params', () => {
      expect(hookData.result.current.owner.path({ provider: 'bb' })).toBe(
        '/bb/doggo'
      )
      expect(hookData.result.current.owner.path({ owner: 'cat' })).toBe(
        '/gl/cat'
      )
    })
  })

  describe('analytics', () => {
    beforeAll(() => {
      setup(['/gl/doggo/squirrel-locator'])
    })

    it('Returns the correct link with nothing passed', () => {
      expect(hookData.result.current.analytics.path()).toBe(
        `${config.BASE_URL}/analytics/gl/doggo`
      )
    })
    it('can override the params', () => {
      expect(hookData.result.current.analytics.path({ provider: 'bb' })).toBe(
        `${config.BASE_URL}/analytics/bb/doggo`
      )
      expect(hookData.result.current.analytics.path({ owner: 'cat' })).toBe(
        `${config.BASE_URL}/analytics/gl/cat`
      )
    })
  })

  describe('repo link', () => {
    beforeAll(() => {
      setup(['/gl/doggo/squirrel-locator'])
    })

    it('Returns the correct link with nothing passed', () => {
      expect(hookData.result.current.repo.path()).toBe(
        '/gl/doggo/squirrel-locator'
      )
    })
    it('can override the params', () => {
      expect(hookData.result.current.repo.path({ provider: 'bb' })).toBe(
        '/bb/doggo/squirrel-locator'
      )
      expect(hookData.result.current.repo.path({ owner: 'cat' })).toBe(
        '/gl/cat/squirrel-locator'
      )
      expect(hookData.result.current.repo.path({ repo: 'no-cats' })).toBe(
        '/gl/doggo/no-cats'
      )
    })
  })

  describe('account link', () => {
    beforeAll(() => {
      setup(['/gl/doggo/squirrel-locator'])
    })

    it('Returns the correct link with nothing passed', () => {
      expect(hookData.result.current.account.path()).toBe('/account/gl/doggo')
    })
    it('can override the params', () => {
      expect(hookData.result.current.account.path({ provider: 'bb' })).toBe(
        '/account/bb/doggo'
      )
      expect(hookData.result.current.account.path({ owner: 'cat' })).toBe(
        '/account/gl/cat'
      )
    })
  })

  describe('accountAdmin link', () => {
    beforeAll(() => {
      setup(['/gl/doggo/squirrel-locator'])
    })

    it('Returns the correct link with nothing passed', () => {
      expect(hookData.result.current.accountAdmin.path()).toBe(
        '/account/gl/doggo'
      )
    })
    it('can override the params', () => {
      expect(
        hookData.result.current.accountAdmin.path({ provider: 'bb' })
      ).toBe('/account/bb/doggo')
      expect(hookData.result.current.accountAdmin.path({ owner: 'cat' })).toBe(
        '/account/gl/cat'
      )
    })
  })

  describe('yamlTab link', () => {
    beforeAll(() => {
      setup(['/gl/doggo/squirrel-locator'])
    })

    it('Returns the correct link with nothing passed', () => {
      expect(hookData.result.current.yamlTab.path()).toBe(
        '/account/gl/doggo/yaml'
      )
    })
    it('can override the params', () => {
      expect(hookData.result.current.yamlTab.path({ provider: 'bb' })).toBe(
        '/account/bb/doggo/yaml'
      )
      expect(hookData.result.current.yamlTab.path({ owner: 'cat' })).toBe(
        '/account/gl/cat/yaml'
      )
    })
  })

  describe('accessTab link', () => {
    beforeAll(() => {
      setup(['/gl/doggo/squirrel-locator'])
    })

    it('Returns the correct link with nothing passed', () => {
      expect(hookData.result.current.accessTab.path()).toBe(
        '/account/gl/doggo/access'
      )
    })
    it('can override the params', () => {
      expect(hookData.result.current.accessTab.path({ provider: 'bb' })).toBe(
        '/account/bb/doggo/access'
      )
      expect(hookData.result.current.accessTab.path({ owner: 'cat' })).toBe(
        '/account/gl/cat/access'
      )
    })
  })

  describe('billingAndUsers link', () => {
    beforeAll(() => {
      setup(['/gl/doggo/squirrel-locator'])
    })

    it('Returns the correct link with nothing passed', () => {
      expect(hookData.result.current.billingAndUsers.path()).toBe(
        '/account/gl/doggo/billing'
      )
    })
    it('can override the params', () => {
      expect(
        hookData.result.current.billingAndUsers.path({ provider: 'bb' })
      ).toBe('/account/bb/doggo/billing')
      expect(
        hookData.result.current.billingAndUsers.path({ owner: 'cat' })
      ).toBe('/account/gl/cat/billing')
    })
  })

  describe('upgradePlan link', () => {
    beforeAll(() => {
      setup(['/gl/doggo/squirrel-locator'])
    })

    it('Returns the correct link with nothing passed', () => {
      expect(hookData.result.current.upgradePlan.path()).toBe(
        '/account/gl/doggo/billing/upgrade'
      )
    })
    it('can override the params', () => {
      expect(hookData.result.current.upgradePlan.path({ provider: 'bb' })).toBe(
        '/account/bb/doggo/billing/upgrade'
      )
      expect(hookData.result.current.upgradePlan.path({ owner: 'cat' })).toBe(
        '/account/gl/cat/billing/upgrade'
      )
    })
  })

  describe('cancelPlan link', () => {
    beforeAll(() => {
      setup(['/gl/doggo/squirrel-locator'])
    })

    it('Returns the correct link with nothing passed', () => {
      expect(hookData.result.current.cancelPlan.path()).toBe(
        '/account/gl/doggo/billing/cancel'
      )
    })
    it('can override the params', () => {
      expect(hookData.result.current.cancelPlan.path({ provider: 'bb' })).toBe(
        '/account/bb/doggo/billing/cancel'
      )
      expect(hookData.result.current.cancelPlan.path({ owner: 'cat' })).toBe(
        '/account/gl/cat/billing/cancel'
      )
    })
  })

  describe('invoiceTab link', () => {
    beforeAll(() => {
      setup(['/gl/doggo/squirrel-locator'])
    })

    it('Returns the correct link with nothing passed', () => {
      expect(hookData.result.current.invoiceTab.path()).toBe(
        '/account/gl/doggo/invoices'
      )
    })
    it('can override the params', () => {
      expect(hookData.result.current.invoiceTab.path({ provider: 'bb' })).toBe(
        '/account/bb/doggo/invoices'
      )
      expect(hookData.result.current.invoiceTab.path({ owner: 'cat' })).toBe(
        '/account/gl/cat/invoices'
      )
    })
  })

  describe('invoiceDetail link', () => {
    beforeAll(() => {
      setup(['/gl/doggo/squirrel-locator/42'])
    })

    it('Returns the correct link with nothing passed', () => {
      expect(hookData.result.current.invoiceDetail.path()).toBe(
        '/account/gl/doggo/invoices/42'
      )
    })
    it('can override the params', () => {
      expect(
        hookData.result.current.invoiceDetail.path({ provider: 'bb' })
      ).toBe('/account/bb/doggo/invoices/42')
      expect(hookData.result.current.invoiceDetail.path({ owner: 'cat' })).toBe(
        '/account/gl/cat/invoices/42'
      )
      expect(hookData.result.current.invoiceDetail.path({ id: '999' })).toBe(
        '/account/gl/doggo/invoices/999'
      )
    })
  })

  describe('commits link', () => {
    beforeAll(() => {
      setup(['/gl/doggo/squirrel-locator'])
    })

    it('Returns the correct link with nothing passed', () => {
      expect(hookData.result.current.commits.path()).toBe(
        '/gl/doggo/squirrel-locator/commits'
      )
    })
    it('can override the params', () => {
      expect(hookData.result.current.commits.path({ provider: 'bb' })).toBe(
        '/bb/doggo/squirrel-locator/commits'
      )
      expect(hookData.result.current.commits.path({ owner: 'cat' })).toBe(
        '/gl/cat/squirrel-locator/commits'
      )
      expect(hookData.result.current.commits.path({ repo: 'test' })).toBe(
        '/gl/doggo/test/commits'
      )
    })
  })

  describe('commitFile link', () => {
    beforeAll(() => {
      setup(['/gh/test/test-repo/commit/abcd/index.js'])
    })

    it('Returns the correct link with nothing passed', () => {
      expect(
        hookData.result.current.commitFile.path({
          commit: 'abcd',
          path: 'index.js',
        })
      ).toBe('/gh/test/test-repo/commit/abcd/index.js')
    })
    it('can override the params', () => {
      expect(
        hookData.result.current.commitFile.path({
          provider: 'bb',
          commit: 'abcd',
          path: 'index.js',
        })
      ).toBe('/bb/test/test-repo/commit/abcd/index.js')
      expect(
        hookData.result.current.commitFile.path({
          owner: 'cat',
          commit: 'abcd',
          path: 'index.js',
        })
      ).toBe('/gh/cat/test-repo/commit/abcd/index.js')
      expect(
        hookData.result.current.commitFile.path({
          repo: 'test',
          commit: 'abcd',
          path: 'index.js',
        })
      ).toBe('/gh/test/test/commit/abcd/index.js')
    })
  })

  describe('treeView link', () => {
    beforeAll(() => {
      setup(['/gl/doggo/watch/src/view/catWatch.php'])
    })

    it('Returns the correct link with nothing passed', () => {
      expect(hookData.result.current.treeView.path()).toBe(
        '/gl/doggo/watch/tree/'
      )
    })
    it('can override the params', () => {
      expect(hookData.result.current.treeView.path({ provider: 'bb' })).toBe(
        '/bb/doggo/watch/tree/'
      )
      expect(hookData.result.current.treeView.path({ owner: 'cat' })).toBe(
        '/gl/cat/watch/tree/'
      )
      expect(hookData.result.current.treeView.path({ repo: 'sleep' })).toBe(
        '/gl/doggo/sleep/tree/'
      )
    })
    it('accepts a tree option', () => {
      expect(
        hookData.result.current.treeView.path({
          tree: 'src/view/catWatch.php',
          ref: 'ref',
        })
      ).toBe('/gl/doggo/watch/tree/ref/src/view/catWatch.php')
      expect(
        hookData.result.current.treeView.path({ tree: 'src', ref: 'ref' })
      ).toBe('/gl/doggo/watch/tree/ref/src')
      expect(
        hookData.result.current.treeView.path({
          tree: 'src/view',
          ref: 'ref',
        })
      ).toBe('/gl/doggo/watch/tree/ref/src/view')
    })
  })

  describe('signup forward the marketing link', () => {
    beforeEach(() => {
      setup([
        '/gh?utm_source=a&utm_medium=b&utm_campaign=c&utm_term=d&utm_content=e&not=f',
      ])
    })

    it('returns the correct url', () => {
      expect(
        hookData.result.current.signUp.path({ pathname: 'random/path/name' })
      ).toBe(
        config.MARKETING_BASE_URL +
          '/sign-up/?utm_source=a&utm_medium=b&utm_campaign=c&utm_term=d&utm_content=e'
      )
    })
  })
})

describe('useStaticNavLinks', () => {
  const hookData = renderHook(() => useStaticNavLinks(), {
    wrapper: (props) => (
      <MemoryRouter initialEntries={['/gh']} initialIndex={0}>
        <Route path="/:provider">{props.children}</Route>
      </MemoryRouter>
    ),
  })
  const links = hookData.result.current
  describe.each`
    link                       | outcome
    ${links.root}              | ${`${config.MARKETING_BASE_URL}`}
    ${links.terms}             | ${`${config.MARKETING_BASE_URL}/terms`}
    ${links.privacy}           | ${`${config.MARKETING_BASE_URL}/privacy`}
    ${links.security}          | ${`${config.MARKETING_BASE_URL}/security`}
    ${links.gdpr}              | ${`${config.MARKETING_BASE_URL}/gdpr`}
    ${links.pricing}           | ${`${config.MARKETING_BASE_URL}/pricing`}
    ${links.support}           | ${`https://codecov.freshdesk.com/support/home`}
    ${links.docs}              | ${`https://docs.codecov.io/`}
    ${links.enterprise}        | ${`${config.MARKETING_BASE_URL}/self-hosted`}
    ${links.githubMarketplace} | ${`https://github.com/marketplace/codecov`}
    ${links.freshdesk}         | ${`https://codecov.freshdesk.com/support/home`}
    ${links.freeTrial}         | ${`${config.MARKETING_BASE_URL}/trial`}
    ${links.demo}              | ${`${config.MARKETING_BASE_URL}/demo`}
    ${links.oauthTroubleshoot} | ${'https://docs.codecov.com/docs/github-oauth-application-authorization#troubleshooting'}
    ${links.blog}              | ${`${config.MARKETING_BASE_URL}/blog`}
    ${links.sales}             | ${`${config.MARKETING_BASE_URL}/sales`}
  `('static links return path', ({ link, outcome }) => {
    it('Returns the correct link', () => {
      expect(link.path()).toBe(outcome)
    })
  })
  describe('legacyUI', () => {
    it('returns the correct url', () => {
      expect(links.legacyUI.path({ pathname: 'random/path/name' })).toBe(
        config.BASE_URL + 'random/path/name'
      )
    })
  })
})
