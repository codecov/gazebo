import { renderHook } from '@testing-library/react'
import Cookie from 'js-cookie'
import { MemoryRouter, Route } from 'react-router-dom'

import config from 'config'

import { useNavLinks } from './useNavLinks'

describe('useNavLinks', () => {
  let hookData

  function setup(location) {
    hookData = renderHook(() => useNavLinks(), {
      wrapper: ({ children }) => (
        <MemoryRouter initialEntries={location} initialIndex={0}>
          <Route path="/:provider">{children}</Route>
          <Route path="/:provider/:owner">{children}</Route>
          <Route path="/:provider/:owner/:repo">{children}</Route>
          <Route path="/:provider/:owner/:repo/:id">{children}</Route>
          <Route path="/:provider/:owner/:repo/commit/:commit/file/:path">
            {children}
          </Route>
          <Route path="/:provider/:owner/:repo/pull/:pullId">{children}</Route>
          <Route path="/admin/:provider/access">{children}</Route>
          <Route path="/admin/:provider/users">{children}</Route>
          <Route path="/admin/:provider/:owner/access">{children}</Route>
          <Route path="/admin/:provider/:owner/users">{children}</Route>
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
      Cookie.set(
        'utmParams',
        'utm_source=a&utm_medium=b&utm_campaign=c&utm_term=d&utm_content=e'
      )
      setup(['/gh/doggo/squirrel-locator'])

      expect(
        hookData.result.current.signIn.path({
          to: 'htts://app.codecov.io/gh/codecov',
        })
      ).toBe(
        `${config.BASE_URL}/login/gh?to=htts%3A%2F%2Fapp.codecov.io%2Fgh%2Fcodecov&utm_source=a&utm_medium=b&utm_campaign=c&utm_term=d&utm_content=e`
      )
      Cookie.remove('utmParams')
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
        `/analytics/gl/doggo`
      )
    })
    it('can override the params', () => {
      expect(hookData.result.current.analytics.path({ provider: 'bb' })).toBe(
        `/analytics/bb/doggo`
      )
      expect(hookData.result.current.analytics.path({ owner: 'cat' })).toBe(
        `/analytics/gl/cat`
      )
    })
  })

  describe('Plan', () => {
    beforeAll(() => {
      setup(['/gl/doggo/squirrel-locator'])
    })

    it('Returns the correct link with nothing passed', () => {
      expect(hookData.result.current.planTab.path()).toBe(`/plan/gl/doggo`)
    })
    it('can override the params', () => {
      expect(hookData.result.current.planTab.path({ provider: 'bb' })).toBe(
        `/plan/bb/doggo`
      )
      expect(hookData.result.current.planTab.path({ owner: 'cat' })).toBe(
        `/plan/gl/cat`
      )
    })
  })

  describe('All orgs an repo plans', () => {
    beforeAll(() => {
      setup(['/gl/doggo'])
    })

    it('Returns the correct link with nothing passed', () => {
      expect(hookData.result.current.allOrgsPlanPage.path()).toBe(`/plan/gl`)
    })
    it('can override the params', () => {
      expect(
        hookData.result.current.allOrgsPlanPage.path({ provider: 'bb' })
      ).toBe(`/plan/bb`)
    })
  })

  describe('Members', () => {
    beforeAll(() => {
      setup(['/gh/critical-role/calloway'])
    })

    it('Returns the correct link with nothing passed', () => {
      expect(hookData.result.current.membersTab.path()).toBe(
        `/members/gh/critical-role`
      )
    })
    it('can override the params', () => {
      expect(hookData.result.current.membersTab.path({ provider: 'bb' })).toBe(
        `/members/bb/critical-role`
      )
      expect(
        hookData.result.current.membersTab.path({ owner: 'skirmisher' })
      ).toBe(`/members/gh/skirmisher`)
    })
  })

  describe('Upgrade Plan', () => {
    beforeAll(() => {
      setup(['/gl/doggo/squirrel-locator'])
    })

    it('Returns the correct link with nothing passed', () => {
      expect(hookData.result.current.upgradeOrgPlan.path()).toBe(
        `/plan/gl/doggo/upgrade`
      )
    })
    it('can override the params', () => {
      expect(
        hookData.result.current.upgradeOrgPlan.path({ provider: 'bb' })
      ).toBe(`/plan/bb/doggo/upgrade`)
      expect(
        hookData.result.current.upgradeOrgPlan.path({ owner: 'cat' })
      ).toBe(`/plan/gl/cat/upgrade`)
    })
  })

  describe('Cancel Plan', () => {
    beforeAll(() => {
      setup(['/gl/doggo/squirrel-locator'])
    })

    it('Returns the correct link with nothing passed', () => {
      expect(hookData.result.current.cancelOrgPlan.path()).toBe(
        `/plan/gl/doggo/cancel`
      )
    })
    it('can override the params', () => {
      expect(
        hookData.result.current.cancelOrgPlan.path({ provider: 'bb' })
      ).toBe(`/plan/bb/doggo/cancel`)
      expect(hookData.result.current.cancelOrgPlan.path({ owner: 'cat' })).toBe(
        `/plan/gl/cat/cancel`
      )
    })
  })

  describe('InvoicesPage', () => {
    beforeAll(() => {
      setup(['/gl/doggo/squirrel-locator'])
    })

    it('Returns the correct link with nothing passed', () => {
      expect(hookData.result.current.invoicesPage.path()).toBe(
        `/plan/gl/doggo/invoices`
      )
    })
    it('can override the params', () => {
      expect(
        hookData.result.current.invoicesPage.path({ provider: 'bb' })
      ).toBe(`/plan/bb/doggo/invoices`)
      expect(hookData.result.current.invoicesPage.path({ owner: 'cat' })).toBe(
        `/plan/gl/cat/invoices`
      )
    })
  })

  describe('invoiceDetailsPage', () => {
    beforeAll(() => {
      setup(['/gl/doggo/squirrel-locator/9'])
    })

    it('Returns the correct link with nothing passed', () => {
      expect(hookData.result.current.invoiceDetailsPage.path()).toBe(
        `/plan/gl/doggo/invoices/9`
      )
    })
    it('can override the params', () => {
      expect(
        hookData.result.current.invoiceDetailsPage.path({ provider: 'bb' })
      ).toBe(`/plan/bb/doggo/invoices/9`)
      expect(
        hookData.result.current.invoiceDetailsPage.path({ owner: 'cat' })
      ).toBe(`/plan/gl/cat/invoices/9`)
    })
  })

  describe('downgradePlanPage', () => {
    beforeAll(() => {
      setup(['/gl/doggo/squirrel-locator/9'])
    })

    it('Returns the correct link with nothing passed', () => {
      expect(hookData.result.current.downgradePlanPage.path()).toBe(
        `/plan/gl/doggo/cancel/downgrade`
      )
    })
    it('can override the params', () => {
      expect(
        hookData.result.current.downgradePlanPage.path({ provider: 'bb' })
      ).toBe(`/plan/bb/doggo/cancel/downgrade`)
      expect(
        hookData.result.current.downgradePlanPage.path({ owner: 'cat' })
      ).toBe(`/plan/gl/cat/cancel/downgrade`)
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

  describe('internalAccessTab link', () => {
    beforeAll(() => {
      setup(['/gl/doggo/squirrel-locator'])
    })

    it('Returns the correct link with nothing passed', () => {
      expect(hookData.result.current.internalAccessTab.path()).toBe(
        '/account/gl/doggo/access'
      )
    })
    it('can override the params', () => {
      expect(
        hookData.result.current.internalAccessTab.path({ provider: 'bb' })
      ).toBe('/account/bb/doggo/access')
      expect(
        hookData.result.current.internalAccessTab.path({ owner: 'cat' })
      ).toBe('/account/gl/cat/access')
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
    it('accepts a ref option', () => {
      expect(
        hookData.result.current.treeView.path({
          ref: 'main',
        })
      ).toBe('/gl/doggo/watch/tree/main/')
    })
    it('accepts a tree option', () => {
      expect(
        hookData.result.current.treeView.path({
          tree: 'src/view/catWatch.php',
          ref: 'ref',
        })
      ).toBe('/gl/doggo/watch/tree/ref/src%2Fview%2FcatWatch.php')
      expect(
        hookData.result.current.treeView.path({ tree: 'src', ref: 'ref' })
      ).toBe('/gl/doggo/watch/tree/ref/src')
      expect(
        hookData.result.current.treeView.path({
          tree: 'src/view',
          ref: 'ref',
        })
      ).toBe('/gl/doggo/watch/tree/ref/src%2Fview')
    })
  })

  describe('fileViewer link', () => {
    beforeAll(() => {
      setup(['/gh/codecov-owner/another-test/blob/main/index.js'])
    })

    it('Returns the correct link with nothing passed', () => {
      expect(
        hookData.result.current.fileViewer.path({
          ref: 'main',
          tree: 'index.js',
        })
      ).toBe('/gh/codecov-owner/another-test/blob/main/index.js')
    })

    it('can override the params', () => {
      expect(
        hookData.result.current.fileViewer.path({
          provider: 'bb',
          ref: 'main',
          tree: 'index.js',
        })
      ).toBe('/bb/codecov-owner/another-test/blob/main/index.js')

      expect(
        hookData.result.current.fileViewer.path({
          owner: 'cat',
          ref: 'main',
          tree: 'index.js',
        })
      ).toBe('/gh/cat/another-test/blob/main/index.js')

      expect(
        hookData.result.current.fileViewer.path({
          ref: 'main',
          tree: 'flags1/mafs.js',
        })
      ).toBe('/gh/codecov-owner/another-test/blob/main/flags1%2Fmafs.js')

      expect(
        hookData.result.current.fileViewer.path({
          ref: 'test-br',
          tree: 'index.js',
        })
      ).toBe('/gh/codecov-owner/another-test/blob/test-br/index.js')
    })
  })

  describe('commitTreeView link', () => {
    beforeAll(() => {
      setup(['/gl/doggo/watch/src/view/catWatch.php'])
    })

    it('Returns the correct link with only commit passed', () => {
      expect(
        hookData.result.current.commitTreeView.path({ commit: 'sha256' })
      ).toBe('/gl/doggo/watch/commit/sha256/tree')
    })

    it('can override the params', () => {
      expect(
        hookData.result.current.commitTreeView.path({
          provider: 'bb',
          commit: 'sha256',
        })
      ).toBe('/bb/doggo/watch/commit/sha256/tree')
      expect(
        hookData.result.current.commitTreeView.path({
          owner: 'cat',
          commit: 'sha256',
        })
      ).toBe('/gl/cat/watch/commit/sha256/tree')
      expect(
        hookData.result.current.commitTreeView.path({
          repo: 'sleep',
          commit: 'sha256',
        })
      ).toBe('/gl/doggo/sleep/commit/sha256/tree')
    })

    it('accepts a commit option', () => {
      expect(
        hookData.result.current.commitTreeView.path({
          commit: 'sha256',
        })
      ).toBe('/gl/doggo/watch/commit/sha256/tree')
    })

    it('accepts a tree option', () => {
      expect(
        hookData.result.current.commitTreeView.path({
          tree: 'src/view/catWatch.php',
          commit: 'sha128',
        })
      ).toBe('/gl/doggo/watch/commit/sha128/tree/src/view/catWatch.php')

      expect(
        hookData.result.current.commitTreeView.path({
          tree: 'src',
          commit: 'sha128',
        })
      ).toBe('/gl/doggo/watch/commit/sha128/tree/src')

      expect(
        hookData.result.current.commitTreeView.path({
          tree: 'src/view',
          commit: 'sha128',
        })
      ).toBe('/gl/doggo/watch/commit/sha128/tree/src/view')
    })
  })

  describe('commitFileDiff link', () => {
    beforeAll(() => {
      setup(['/gh/codecov-owner/another-test/blob/main/index.js'])
    })

    it('Returns the correct link with nothing passed', () => {
      expect(
        hookData.result.current.commitFileDiff.path({
          commit: 'sha256',
          tree: 'index.js',
        })
      ).toBe('/gh/codecov-owner/another-test/commit/sha256/blob/index.js')
    })

    it('can override the params', () => {
      expect(
        hookData.result.current.commitFileDiff.path({
          provider: 'bb',
          commit: 'sha256',
          tree: 'index.js',
        })
      ).toBe('/bb/codecov-owner/another-test/commit/sha256/blob/index.js')

      expect(
        hookData.result.current.commitFileDiff.path({
          owner: 'cat',
          commit: 'sha256',
          tree: 'index.js',
        })
      ).toBe('/gh/cat/another-test/commit/sha256/blob/index.js')

      expect(
        hookData.result.current.commitFileDiff.path({
          repo: 'cool-new-repo',
          commit: 'sha256',
          tree: 'flags1/mafs.js',
        })
      ).toBe(
        '/gh/codecov-owner/cool-new-repo/commit/sha256/blob/flags1/mafs.js'
      )
    })
  })

  describe('repo overview link', () => {
    beforeAll(() => {
      setup(['/gh/RulaKhaled/test'])
    })

    it('Returns the correct link with nothing passed', () => {
      expect(hookData.result.current.overview.path()).toBe(
        '/gh/RulaKhaled/test'
      )
    })
    it('can override the params', () => {
      expect(hookData.result.current.overview.path({ provider: 'bb' })).toBe(
        '/bb/RulaKhaled/test'
      )
      expect(hookData.result.current.overview.path({ owner: 'cat' })).toBe(
        '/gh/cat/test'
      )
    })
  })

  describe('repo flags tab link', () => {
    beforeAll(() => {
      setup(['/gh/codecov/gazebo/flags'])
    })

    it('Returns the correct link with nothing passed', () => {
      expect(hookData.result.current.flagsTab.path()).toBe(
        '/gh/codecov/gazebo/flags'
      )
    })
    it('can override the params', () => {
      expect(hookData.result.current.flagsTab.path({ provider: 'bb' })).toBe(
        '/bb/codecov/gazebo/flags'
      )
      expect(hookData.result.current.flagsTab.path({ owner: 'cat' })).toBe(
        '/gh/cat/gazebo/flags'
      )
    })
  })

  describe('repo branches link', () => {
    beforeAll(() => {
      setup(['/gh/RulaKhaled/test/branches'])
    })

    it('Returns the correct link with nothing passed', () => {
      expect(hookData.result.current.branches.path()).toBe(
        '/gh/RulaKhaled/test/branches'
      )
    })
    it('can override the params', () => {
      expect(hookData.result.current.branches.path({ provider: 'bb' })).toBe(
        '/bb/RulaKhaled/test/branches'
      )
      expect(hookData.result.current.branches.path({ owner: 'cat' })).toBe(
        '/gh/cat/test/branches'
      )
    })
  })

  describe('repo pulls link', () => {
    beforeAll(() => {
      setup(['/gh/RulaKhaled/test/pulls'])
    })

    it('Returns the correct link with nothing passed', () => {
      expect(hookData.result.current.pulls.path()).toBe(
        '/gh/RulaKhaled/test/pulls'
      )
    })
    it('can override the params', () => {
      expect(hookData.result.current.pulls.path({ provider: 'bb' })).toBe(
        '/bb/RulaKhaled/test/pulls'
      )
      expect(hookData.result.current.pulls.path({ repo: 'cat' })).toBe(
        '/gh/RulaKhaled/cat/pulls'
      )
    })
  })

  describe('repo settings link', () => {
    beforeAll(() => {
      setup(['/gh/RulaKhaled/test/settings'])
    })

    it('Returns the correct link with nothing passed', () => {
      expect(hookData.result.current.settings.path()).toBe(
        '/gh/RulaKhaled/test/settings'
      )
    })
    it('can override the params', () => {
      expect(hookData.result.current.settings.path({ provider: 'bb' })).toBe(
        '/bb/RulaKhaled/test/settings'
      )
      expect(hookData.result.current.settings.path({ repo: 'cat' })).toBe(
        '/gh/RulaKhaled/cat/settings'
      )
    })
  })

  describe('repo new link', () => {
    beforeAll(() => {
      setup(['/gh/RulaKhaled/test/new'])
    })

    it('Returns the correct link with nothing passed', () => {
      expect(hookData.result.current.new.path()).toBe('/gh/RulaKhaled/test/new')
    })
    it('can override the params', () => {
      expect(hookData.result.current.new.path({ provider: 'bb' })).toBe(
        '/bb/RulaKhaled/test/new'
      )
      expect(hookData.result.current.new.path({ repo: 'cat' })).toBe(
        '/gh/RulaKhaled/cat/new'
      )
    })
  })

  describe('repo new other link', () => {
    beforeAll(() => {
      setup(['/gh/RulaKhaled/test/new/other'])
    })

    it('Returns the correct link with nothing passed', () => {
      expect(hookData.result.current.newOtherCI.path()).toBe(
        '/gh/RulaKhaled/test/new/other-ci'
      )
    })
    it('can override the params', () => {
      expect(hookData.result.current.newOtherCI.path({ provider: 'bb' })).toBe(
        '/bb/RulaKhaled/test/new/other-ci'
      )
      expect(hookData.result.current.newOtherCI.path({ repo: 'cat' })).toBe(
        '/gh/RulaKhaled/cat/new/other-ci'
      )
    })
  })

  describe('repo new circle ci link', () => {
    beforeAll(() => {
      setup(['/gh/RulaKhaled/test/new/circle-ci'])
    })

    it('Returns the correct link with nothing passed', () => {
      expect(hookData.result.current.circleCI.path()).toBe(
        '/gh/RulaKhaled/test/new/circle-ci'
      )
    })
    it('can override the params', () => {
      expect(hookData.result.current.circleCI.path({ provider: 'bb' })).toBe(
        '/bb/RulaKhaled/test/new/circle-ci'
      )
      expect(hookData.result.current.circleCI.path({ repo: 'cat' })).toBe(
        '/gh/RulaKhaled/cat/new/circle-ci'
      )
    })
  })

  describe('general repo settings link', () => {
    beforeAll(() => {
      setup(['/gh/RulaKhaled/test/settings'])
    })

    it('Returns the correct link with nothing passed', () => {
      expect(hookData.result.current.settingsGeneral.path()).toBe(
        '/gh/RulaKhaled/test/settings'
      )
    })
    it('can override the params', () => {
      expect(
        hookData.result.current.settingsGeneral.path({ provider: 'bb' })
      ).toBe('/bb/RulaKhaled/test/settings')
      expect(
        hookData.result.current.settingsGeneral.path({ repo: 'cat' })
      ).toBe('/gh/RulaKhaled/cat/settings')
    })
  })

  describe('repo yaml link', () => {
    beforeAll(() => {
      setup(['/gh/RulaKhaled/test/settings/yaml'])
    })

    it('Returns the correct link with nothing passed', () => {
      expect(hookData.result.current.settingsYaml.path()).toBe(
        '/gh/RulaKhaled/test/settings/yaml'
      )
    })
    it('can override the params', () => {
      expect(
        hookData.result.current.settingsYaml.path({ provider: 'bb' })
      ).toBe('/bb/RulaKhaled/test/settings/yaml')
      expect(hookData.result.current.settingsYaml.path({ repo: 'cat' })).toBe(
        '/gh/RulaKhaled/cat/settings/yaml'
      )
    })
  })

  describe('badge repo settings link', () => {
    beforeAll(() => {
      setup(['/gh/RulaKhaled/test/settings/badge'])
    })

    it('Returns the correct link with nothing passed', () => {
      expect(hookData.result.current.settingsBadge.path()).toBe(
        '/gh/RulaKhaled/test/settings/badge'
      )
    })
    it('can override the params', () => {
      expect(
        hookData.result.current.settingsBadge.path({ provider: 'bb' })
      ).toBe('/bb/RulaKhaled/test/settings/badge')
      expect(hookData.result.current.settingsBadge.path({ repo: 'cat' })).toBe(
        '/gh/RulaKhaled/cat/settings/badge'
      )
    })
  })

  describe('signup forward the marketing link', () => {
    beforeEach(() => {
      Cookie.set(
        'utmParams',
        'utm_source=a&utm_medium=b&utm_campaign=c&utm_term=d&utm_content=e'
      )
      setup([
        '/gh?utm_source=a&utm_medium=b&utm_campaign=c&utm_term=d&utm_content=e&not=f',
      ])
    })

    afterEach(() => {
      Cookie.remove('utmParams')
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

  describe('pull detail', () => {
    beforeAll(() => {
      setup(['/gl/doggo/squirrel-locator/pull/409'])
    })

    it('Returns the correct link with nothing passed', () => {
      expect(hookData.result.current.pullDetail.path()).toBe(
        `/gl/doggo/squirrel-locator/pull/409`
      )
    })
    it('can override the params', () => {
      expect(hookData.result.current.pullDetail.path({ provider: 'bb' })).toBe(
        `/bb/doggo/squirrel-locator/pull/409`
      )
      expect(hookData.result.current.pullDetail.path({ owner: 'cat' })).toBe(
        `/gl/cat/squirrel-locator/pull/409`
      )
      expect(
        hookData.result.current.pullDetail.path({ repo: 'tennis-ball' })
      ).toBe(`/gl/doggo/tennis-ball/pull/409`)
      expect(hookData.result.current.pullDetail.path({ pullId: 888 })).toBe(
        `/gl/doggo/squirrel-locator/pull/888`
      )
    })
  })

  describe('pull commits', () => {
    beforeAll(() => {
      setup(['/gl/doggo/squirrel-locator/pull/409/commits'])
    })

    it('Returns the correct link with nothing passed', () => {
      expect(hookData.result.current.pullCommits.path()).toBe(
        `/gl/doggo/squirrel-locator/pull/409/commits`
      )
    })
    it('can override the params', () => {
      expect(hookData.result.current.pullCommits.path({ provider: 'bb' })).toBe(
        `/bb/doggo/squirrel-locator/pull/409/commits`
      )
      expect(hookData.result.current.pullCommits.path({ owner: 'cat' })).toBe(
        `/gl/cat/squirrel-locator/pull/409/commits`
      )
      expect(
        hookData.result.current.pullCommits.path({ repo: 'tennis-ball' })
      ).toBe(`/gl/doggo/tennis-ball/pull/409/commits`)
      expect(hookData.result.current.pullCommits.path({ pullId: 888 })).toBe(
        `/gl/doggo/squirrel-locator/pull/888/commits`
      )
    })
  })

  describe('pull flags', () => {
    beforeAll(() => {
      setup(['/gl/doggo/squirrel-locator/pull/409/flags'])
    })

    it('Returns the correct link with nothing passed', () => {
      expect(hookData.result.current.pullFlags.path()).toBe(
        `/gl/doggo/squirrel-locator/pull/409/flags`
      )
    })
    it('can override the params', () => {
      expect(hookData.result.current.pullFlags.path({ provider: 'bb' })).toBe(
        `/bb/doggo/squirrel-locator/pull/409/flags`
      )
      expect(hookData.result.current.pullFlags.path({ owner: 'cat' })).toBe(
        `/gl/cat/squirrel-locator/pull/409/flags`
      )
      expect(
        hookData.result.current.pullFlags.path({ repo: 'tennis-ball' })
      ).toBe(`/gl/doggo/tennis-ball/pull/409/flags`)
      expect(hookData.result.current.pullFlags.path({ pullId: 888 })).toBe(
        `/gl/doggo/squirrel-locator/pull/888/flags`
      )
    })
  })

  describe('pull components', () => {
    beforeAll(() => {
      setup(['/gl/doggo/squirrel-locator/pull/409/components'])
    })

    it('Returns the correct link with nothing passed', () => {
      expect(hookData.result.current.pullComponents.path()).toBe(
        `/gl/doggo/squirrel-locator/pull/409/components`
      )
    })
    it('can override the params', () => {
      expect(
        hookData.result.current.pullComponents.path({ provider: 'bb' })
      ).toBe(`/bb/doggo/squirrel-locator/pull/409/components`)
      expect(
        hookData.result.current.pullComponents.path({ owner: 'cat' })
      ).toBe(`/gl/cat/squirrel-locator/pull/409/components`)
      expect(
        hookData.result.current.pullComponents.path({ repo: 'tennis-ball' })
      ).toBe(`/gl/doggo/tennis-ball/pull/409/components`)
      expect(hookData.result.current.pullComponents.path({ pullId: 888 })).toBe(
        `/gl/doggo/squirrel-locator/pull/888/components`
      )
    })
  })

  describe('pull indirect changes', () => {
    beforeAll(() => {
      setup(['/gl/doggo/squirrel-locator/pull/409/indirect-changes'])
    })

    it('Returns the correct link with nothing passed', () => {
      expect(hookData.result.current.pullIndirectChanges.path()).toBe(
        `/gl/doggo/squirrel-locator/pull/409/indirect-changes`
      )
    })
    it('can override the params', () => {
      expect(
        hookData.result.current.pullIndirectChanges.path({ provider: 'bb' })
      ).toBe(`/bb/doggo/squirrel-locator/pull/409/indirect-changes`)
      expect(
        hookData.result.current.pullIndirectChanges.path({ owner: 'cat' })
      ).toBe(`/gl/cat/squirrel-locator/pull/409/indirect-changes`)
      expect(
        hookData.result.current.pullIndirectChanges.path({
          repo: 'tennis-ball',
        })
      ).toBe(`/gl/doggo/tennis-ball/pull/409/indirect-changes`)
      expect(
        hookData.result.current.pullIndirectChanges.path({ pullId: 888 })
      ).toBe(`/gl/doggo/squirrel-locator/pull/888/indirect-changes`)
    })
  })

  describe('commit indirect changes', () => {
    beforeAll(() => {
      setup(['/gl/doggo/squirrel-locator'])
    })

    it('Returns the correct link with nothing passed', () => {
      expect(
        hookData.result.current.commitIndirectChanges.path({ commit: 409 })
      ).toBe(`/gl/doggo/squirrel-locator/commit/409/indirect-changes`)
    })
    it('can override the params', () => {
      expect(
        hookData.result.current.commitIndirectChanges.path({
          provider: 'bb',
          commit: 409,
        })
      ).toBe(`/bb/doggo/squirrel-locator/commit/409/indirect-changes`)
      expect(
        hookData.result.current.commitIndirectChanges.path({
          owner: 'cat',
          commit: 409,
        })
      ).toBe(`/gl/cat/squirrel-locator/commit/409/indirect-changes`)
      expect(
        hookData.result.current.commitIndirectChanges.path({
          repo: 'tennis-ball',
          commit: 409,
        })
      ).toBe(`/gl/doggo/tennis-ball/commit/409/indirect-changes`)
      expect(
        hookData.result.current.commitIndirectChanges.path({ commit: 888 })
      ).toBe(`/gl/doggo/squirrel-locator/commit/888/indirect-changes`)
    })
  })

  describe('feedback', () => {
    describe('ref provided', () => {
      beforeAll(() => {
        setup(['/gh/codecov/codecov-demo'])
      })

      it('returns the correct url', () => {
        expect(
          hookData.result.current.feedback.path({
            ref: '/gh/codecov/codecov-demo',
          })
        ).toBe(
          `/gh/feedback?ref=${encodeURIComponent('/gh/codecov/codecov-demo')}`
        )
      })
    })
    describe('no ref provided', () => {
      beforeAll(() => {
        setup(['/gh'])
      })

      it('returns the correct url', () => {
        expect(hookData.result.current.feedback.path()).toBe('/gh/feedback')
      })
    })
  })

  describe('prevLink', () => {
    describe('ref provided', () => {
      beforeAll(() => {
        setup([
          `/gh/feedback?ref=${encodeURIComponent('/gh/codecov/codecov-demo')}`,
        ])
      })

      it('returns the correct url', () => {
        expect(
          hookData.result.current.prevLink.path({
            ref: encodeURIComponent('/gh/codecov/codecov-demo'),
          })
        ).toBe('/gh/codecov/codecov-demo')
      })
    })
    describe('no ref provided', () => {
      beforeAll(() => {
        setup(['/gh/feedback'])
      })

      it('returns the correct url', () => {
        expect(hookData.result.current.prevLink.path()).toBe('/gh')
      })
    })
  })

  describe('access', () => {
    describe('testing all orgs and repos', () => {
      beforeAll(() => {
        setup(['/admin/gh/access'])
      })

      it('returns the correct url', () => {
        expect(hookData.result.current.access.path()).toBe('/admin/gh/access')
      })

      it('returns the correct url provided provider', () => {
        expect(hookData.result.current.access.path({ provider: 'gl' })).toBe(
          '/admin/gl/access'
        )
      })
    })
  })

  describe('users', () => {
    describe('testing all orgs and repos', () => {
      beforeAll(() => {
        setup(['/admin/gh/users'])
      })

      it('returns the correct url', () => {
        expect(hookData.result.current.users.path()).toBe('/admin/gh/users')
      })

      it('returns the correct url provided provider', () => {
        expect(hookData.result.current.users.path({ provider: 'gl' })).toBe(
          '/admin/gl/users'
        )
      })
    })
  })

  describe('general repo upload token link', () => {
    beforeAll(() => {
      setup(['/gh/codecov'])
    })

    it('Returns the correct link with nothing passed', () => {
      expect(hookData.result.current.orgUploadToken.path()).toBe(
        '/account/gh/codecov/org-upload-token'
      )
    })
    it('can override the params', () => {
      expect(
        hookData.result.current.orgUploadToken.path({ provider: 'bb' })
      ).toBe('/account/bb/codecov/org-upload-token')
      expect(
        hookData.result.current.orgUploadToken.path({ owner: 'cat' })
      ).toBe('/account/gh/cat/org-upload-token')
    })
  })

  describe('github repo secrets', () => {
    beforeAll(() => {
      setup(['/gh/codecov/cool-repo'])
    })

    it('Returns the correct link with nothing passed', () => {
      expect(hookData.result.current.githubRepoSecrets.path()).toBe(
        'https://github.com/codecov/cool-repo/settings/secrets/actions'
      )
    })
    it('can override the params', () => {
      expect(
        hookData.result.current.githubRepoSecrets.path({ repo: 'test-repo' })
      ).toBe('https://github.com/codecov/test-repo/settings/secrets/actions')
      expect(
        hookData.result.current.githubRepoSecrets.path({ owner: 'cat' })
      ).toBe('https://github.com/cat/cool-repo/settings/secrets/actions')
    })
  })

  describe('github repo actions', () => {
    beforeAll(() => {
      setup(['/gh/codecov/cool-repo'])
    })

    it('Returns the correct link with nothing passed', () => {
      expect(
        hookData.result.current.githubRepoActions.path({ branch: 'main' })
      ).toBe('https://github.com/codecov/cool-repo/tree/main/.github/workflows')
    })
    it('can override the params', () => {
      expect(
        hookData.result.current.githubRepoActions.path({
          repo: 'test-repo',
          branch: 'master',
        })
      ).toBe(
        'https://github.com/codecov/test-repo/tree/master/.github/workflows'
      )
      expect(
        hookData.result.current.githubRepoActions.path({
          owner: 'cat',
          branch: 'master',
        })
      ).toBe('https://github.com/cat/cool-repo/tree/master/.github/workflows')
    })
  })

  describe('circleCI yaml', () => {
    beforeAll(() => {
      setup(['/gh/codecov/cool-repo'])
    })

    it('Returns the correct link with nothing passed', () => {
      expect(
        hookData.result.current.circleCIyaml.path({ branch: 'main' })
      ).toBe('https://github.com/codecov/cool-repo/tree/main/.circleci/config')
    })
    it('can override the params', () => {
      expect(
        hookData.result.current.circleCIyaml.path({
          repo: 'test-repo',
          branch: 'master',
        })
      ).toBe(
        'https://github.com/codecov/test-repo/tree/master/.circleci/config'
      )
      expect(
        hookData.result.current.circleCIyaml.path({
          owner: 'cat',
          branch: 'master',
        })
      ).toBe('https://github.com/cat/cool-repo/tree/master/.circleci/config')
    })
  })
})
