import { renderHook } from '@testing-library/react'
import { MemoryRouter, Route } from 'react-router-dom'

import { useNavLinks } from './useNavLinks'

const wrapper =
  (location) =>
  ({ children }) => (
    <MemoryRouter initialEntries={[location]} initialIndex={0}>
      <Route path="/:provider">{children}</Route>
      <Route path="/:provider/:owner">{children}</Route>
      <Route path="/:provider/:owner/:repo">{children}</Route>
      <Route path="/:provider/:owner/:repo/:id">{children}</Route>
      <Route path="/:provider/:owner/:repo/commit/:commit">{children}</Route>
      <Route path="/:provider/:owner/:repo/commit/:commit/file/:path">
        {children}
      </Route>
      <Route path="/:provider/:owner/:repo/pull/:pullId">{children}</Route>
      <Route path="/:provider/:owner/:repo/pull/:pullId/commits">
        {children}
      </Route>
      <Route path="/:provider/:owner/:repo/pull/:pullId/blob/:path+">
        {children}
      </Route>
      <Route path="/:provider/:owner/:repo/pull/:pullId/tree/:path+">
        {children}
      </Route>
      <Route path="/admin/:provider/access">{children}</Route>
      <Route path="/admin/:provider/users">{children}</Route>
      <Route path="/admin/:provider/:owner/access">{children}</Route>
      <Route path="/admin/:provider/:owner/users">{children}</Route>
      <Route path="/account/:provider/:owner">{children}</Route>
      <Route path="/account/:provider/:owner/billing">{children}</Route>
      <Route path="/:provider/:owner/:repo/bundles/:branch">{children}</Route>
      <Route path="/:provider/:owner/:repo/bundles">{children}</Route>
    </MemoryRouter>
  )

describe('useNavLinks', () => {
  describe('Sign Out', () => {
    it('returns the correct link with nothing passed', () => {
      const { result } = renderHook(() => useNavLinks(), {
        wrapper: wrapper('/gl/doggo/squirrel-locator'),
      })

      const path = result.current.signOut.path()
      expect(path).toBe('/logout/gl')
    })

    it('can override the params', () => {
      const { result } = renderHook(() => useNavLinks(), {
        wrapper: wrapper('/gl/doggo/squirrel-locator'),
      })

      const path = result.current.signOut.path({ provider: 'bb' })
      expect(path).toBe('/logout/bb')
    })
  })

  describe('Sign In', () => {
    it('returns the correct link with nothing passed', () => {
      const { result } = renderHook(() => useNavLinks(), {
        wrapper: wrapper('/gl/doggo/squirrel-locator'),
      })

      const path = result.current.signIn.path()
      expect(path).toBe('/login/gl')
    })

    it('can override the params', () => {
      const { result } = renderHook(() => useNavLinks(), {
        wrapper: wrapper('/gl/doggo/squirrel-locator'),
      })

      const path = result.current.signIn.path({ provider: 'bb' })
      expect(path).toBe('/login/bb')
    })

    it('can add a `to` redirection', () => {
      const { result } = renderHook(() => useNavLinks(), {
        wrapper: wrapper('/gl/doggo/squirrel-locator'),
      })

      const path = result.current.signIn.path({
        to: 'https://app.codecov.io/gh/codecov',
      })
      expect(path).toBe(
        '/login/gl?to=https%3A%2F%2Fapp.codecov.io%2Fgh%2Fcodecov'
      )
    })
  })

  describe('owner link', () => {
    it('returns the correct link with nothing passed', () => {
      const { result } = renderHook(() => useNavLinks(), {
        wrapper: wrapper('/gl/doggo/squirrel-locator'),
      })

      const path = result.current.owner.path()
      expect(path).toBe('/gl/doggo')
    })

    it('can override the params', () => {
      const { result } = renderHook(() => useNavLinks(), {
        wrapper: wrapper('/gl/doggo/squirrel-locator'),
      })

      const path = result.current.owner.path({
        provider: 'bb',
        owner: 'test-owner',
      })
      expect(path).toBe('/bb/test-owner')
    })

    it('can handle when owner is absent', () => {
      const { result } = renderHook(() => useNavLinks(), {
        wrapper: wrapper('/gl'),
      })

      const path = result.current.owner.path()
      expect(path).toBe('/')
    })
  })

  describe('owner internal link', () => {
    it('returns the correct link with nothing passed', () => {
      const { result } = renderHook(() => useNavLinks(), {
        wrapper: wrapper('/gl/doggo/squirrel-locator'),
      })

      const path = result.current.owner.path()
      expect(path).toBe('/gl/doggo')
    })

    it('can override the params', () => {
      const { result } = renderHook(() => useNavLinks(), {
        wrapper: wrapper('/gl/doggo/squirrel-locator'),
      })

      const path = result.current.owner.path({
        provider: 'bb',
        owner: 'test-owner',
      })
      expect(path).toBe('/bb/test-owner')
    })
  })

  describe('analytics', () => {
    it('returns the correct link with nothing passed', () => {
      const { result } = renderHook(() => useNavLinks(), {
        wrapper: wrapper('/gl/doggo/squirrel-locator'),
      })

      const path = result.current.analytics.path()
      expect(path).toBe('/analytics/gl/doggo')
    })

    it('can override the params', () => {
      const { result } = renderHook(() => useNavLinks(), {
        wrapper: wrapper('/gl/doggo/squirrel-locator'),
      })

      const path = result.current.analytics.path({
        provider: 'bb',
        owner: 'test-owner',
      })
      expect(path).toBe('/analytics/bb/test-owner')
    })
  })

  describe('Plan', () => {
    it('returns the correct link with nothing passed', () => {
      const { result } = renderHook(() => useNavLinks(), {
        wrapper: wrapper('/gl/doggo/squirrel-locator'),
      })

      const path = result.current.planTab.path()
      expect(path).toBe('/plan/gl/doggo')
    })

    it('can override the params', () => {
      const { result } = renderHook(() => useNavLinks(), {
        wrapper: wrapper('/gl/doggo/squirrel-locator'),
      })

      const path = result.current.planTab.path({
        provider: 'bb',
        owner: 'test-owner',
      })
      expect(path).toBe('/plan/bb/test-owner')
    })
  })

  describe('Members', () => {
    it('returns the correct link with nothing passed', () => {
      const { result } = renderHook(() => useNavLinks(), {
        wrapper: wrapper('/gh/critical-role/calloway'),
      })

      const path = result.current.membersTab.path()
      expect(path).toBe('/members/gh/critical-role')
    })

    it('can override the params', () => {
      const { result } = renderHook(() => useNavLinks(), {
        wrapper: wrapper('/gh/critical-role/calloway'),
      })

      const path = result.current.membersTab.path({
        provider: 'bb',
        owner: 'skirmisher',
      })
      expect(path).toBe('/members/bb/skirmisher')
    })
  })

  describe('Upgrade Plan', () => {
    it('returns the correct link with nothing passed', () => {
      const { result } = renderHook(() => useNavLinks(), {
        wrapper: wrapper('/gl/doggo/squirrel-locator'),
      })

      const path = result.current.upgradeOrgPlan.path()
      expect(path).toBe('/plan/gl/doggo/upgrade')
    })

    it('can override the params', () => {
      const { result } = renderHook(() => useNavLinks(), {
        wrapper: wrapper('/gl/doggo/squirrel-locator'),
      })

      const path = result.current.upgradeOrgPlan.path({
        provider: 'bb',
        owner: 'test-owner',
      })
      expect(path).toBe('/plan/bb/test-owner/upgrade')
    })

    describe('user passes params object', () => {
      it('gets appended to the url as search params', () => {
        const { result } = renderHook(() => useNavLinks(), {
          wrapper: wrapper('/gl/doggo/squirrel-locator'),
        })

        const path = result.current.upgradeOrgPlan.path({
          params: { search: 'params' },
        })
        expect(path).toBe('/plan/gl/doggo/upgrade?search=params')
      })
    })
  })

  describe('Cancel Plan', () => {
    it('returns the correct link with nothing passed', () => {
      const { result } = renderHook(() => useNavLinks(), {
        wrapper: wrapper('/gl/doggo/squirrel-locator'),
      })

      const path = result.current.cancelOrgPlan.path()
      expect(path).toBe('/plan/gl/doggo/cancel')
    })

    it('can override the params', () => {
      const { result } = renderHook(() => useNavLinks(), {
        wrapper: wrapper('/gl/doggo/squirrel-locator'),
      })

      const path = result.current.cancelOrgPlan.path({
        provider: 'bb',
        owner: 'test-owner',
      })
      expect(path).toBe('/plan/bb/test-owner/cancel')
    })
  })

  describe('InvoicesPage', () => {
    it('returns the correct link with nothing passed', () => {
      const { result } = renderHook(() => useNavLinks(), {
        wrapper: wrapper('/gl/doggo/squirrel-locator'),
      })

      const path = result.current.invoicesPage.path()
      expect(path).toBe('/plan/gl/doggo/invoices')
    })

    it('can override the params', () => {
      const { result } = renderHook(() => useNavLinks(), {
        wrapper: wrapper('/gl/doggo/squirrel-locator'),
      })

      const path = result.current.invoicesPage.path({
        provider: 'bb',
        owner: 'test-owner',
      })
      expect(path).toBe('/plan/bb/test-owner/invoices')
    })
  })

  describe('invoiceDetailsPage', () => {
    it('returns the correct link with nothing passed', () => {
      const { result } = renderHook(() => useNavLinks(), {
        wrapper: wrapper('/gl/doggo/squirrel-locator/9'),
      })

      const path = result.current.invoiceDetailsPage.path()
      expect(path).toBe('/plan/gl/doggo/invoices/9')
    })

    it('can override the params', () => {
      const { result } = renderHook(() => useNavLinks(), {
        wrapper: wrapper('/gl/doggo/squirrel-locator/9'),
      })

      const path = result.current.invoiceDetailsPage.path({
        provider: 'bb',
        owner: 'test-owner',
      })

      expect(path).toBe('/plan/bb/test-owner/invoices/9')
    })
  })

  describe('downgradePlanPage', () => {
    it('returns the correct link with nothing passed', () => {
      const { result } = renderHook(() => useNavLinks(), {
        wrapper: wrapper('/gl/doggo/squirrel-locator/9'),
      })

      const path = result.current.downgradePlanPage.path()
      expect(path).toBe('/plan/gl/doggo/cancel/downgrade')
    })

    it('can override the params', () => {
      const { result } = renderHook(() => useNavLinks(), {
        wrapper: wrapper('/gl/doggo/squirrel-locator/9'),
      })

      const path = result.current.downgradePlanPage.path({
        provider: 'bb',
        owner: 'test-owner',
      })
      expect(path).toBe('/plan/bb/test-owner/cancel/downgrade')
    })
  })

  describe('repo link', () => {
    it('returns the correct link with nothing passed', () => {
      const { result } = renderHook(() => useNavLinks(), {
        wrapper: wrapper('/gl/doggo/squirrel-locator'),
      })

      const path = result.current.repo.path()
      expect(path).toBe('/gl/doggo/squirrel-locator')
    })

    it('can override the params', () => {
      const { result } = renderHook(() => useNavLinks(), {
        wrapper: wrapper('/gl/doggo/squirrel-locator'),
      })

      const path = result.current.repo.path({
        provider: 'bb',
        owner: 'test-owner',
        repo: 'no-cats',
      })
      expect(path).toBe('/bb/test-owner/no-cats')
    })
  })

  describe('account link', () => {
    it('returns the correct link with nothing passed', () => {
      const { result } = renderHook(() => useNavLinks(), {
        wrapper: wrapper('/gl/doggo/squirrel-locator'),
      })

      const path = result.current.account.path()
      expect(path).toBe('/account/gl/doggo')
    })

    it('can override the params', () => {
      const { result } = renderHook(() => useNavLinks(), {
        wrapper: wrapper('/gl/doggo/squirrel-locator'),
      })

      const path = result.current.account.path({
        provider: 'bb',
        owner: 'test-owner',
      })
      expect(path).toBe('/account/bb/test-owner')
    })
  })

  describe('accountAdmin link', () => {
    it('returns the correct link with nothing passed', () => {
      const { result } = renderHook(() => useNavLinks(), {
        wrapper: wrapper('/gl/doggo/squirrel-locator'),
      })

      const path = result.current.accountAdmin.path()
      expect(path).toBe('/account/gl/doggo')
    })

    it('can override the params', () => {
      const { result } = renderHook(() => useNavLinks(), {
        wrapper: wrapper('/gl/doggo/squirrel-locator'),
      })

      const path = result.current.accountAdmin.path({
        provider: 'bb',
        owner: 'test-owner',
      })
      expect(path).toBe('/account/bb/test-owner')
    })
  })

  describe('yamlTab link', () => {
    it('returns the correct link with nothing passed', () => {
      const { result } = renderHook(() => useNavLinks(), {
        wrapper: wrapper('/gl/doggo/squirrel-locator'),
      })

      const path = result.current.yamlTab.path()
      expect(path).toBe('/account/gl/doggo/yaml')
    })

    it('can override the params', () => {
      const { result } = renderHook(() => useNavLinks(), {
        wrapper: wrapper('/gl/doggo/squirrel-locator'),
      })

      const path = result.current.yamlTab.path({
        provider: 'bb',
        owner: 'test-owner',
      })
      expect(path).toBe('/account/bb/test-owner/yaml')
    })
  })

  describe('accessTab link', () => {
    it('returns the correct link with nothing passed', () => {
      const { result } = renderHook(() => useNavLinks(), {
        wrapper: wrapper('/gl/doggo/squirrel-locator'),
      })

      const path = result.current.accessTab.path()
      expect(path).toBe('/account/gl/doggo/access')
    })

    it('can override the params', () => {
      const { result } = renderHook(() => useNavLinks(), {
        wrapper: wrapper('/gl/doggo/squirrel-locator'),
      })

      const path = result.current.accessTab.path({
        provider: 'bb',
        owner: 'test-owner',
      })
      expect(path).toBe('/account/bb/test-owner/access')
    })
  })

  describe('internalAccessTab link', () => {
    it('returns the correct link with nothing passed', () => {
      const { result } = renderHook(() => useNavLinks(), {
        wrapper: wrapper('/gl/doggo/squirrel-locator'),
      })

      const path = result.current.internalAccessTab.path()
      expect(path).toBe('/account/gl/doggo/access')
    })

    it('can override the params', () => {
      const { result } = renderHook(() => useNavLinks(), {
        wrapper: wrapper('/gl/doggo/squirrel-locator'),
      })

      const path = result.current.internalAccessTab.path({
        provider: 'bb',
        owner: 'test-owner',
      })
      expect(path).toBe('/account/bb/test-owner/access')
    })
  })

  describe('commit link', () => {
    it('returns the correct link with nothing passed', () => {
      const { result } = renderHook(() => useNavLinks(), {
        wrapper: wrapper('/gl/doggo/squirrel-locator/commit/123'),
      })

      const path = result.current.commit.path({ commit: 123 })
      expect(path).toBe('/gl/doggo/squirrel-locator/commit/123')
    })

    it('can override the params', () => {
      const { result } = renderHook(() => useNavLinks(), {
        wrapper: wrapper('/gl/doggo/squirrel-locator'),
      })

      const path = result.current.commit.path({
        provider: 'bb',
        owner: 'test-owner',
        repo: 'test-repo',
        commit: '1ab3',
      })
      expect(path).toBe('/bb/test-owner/test-repo/commit/1ab3')
    })

    it('passes flags into the url', () => {
      const { result } = renderHook(() => useNavLinks(), {
        wrapper: wrapper('/gl/doggo/squirrel-locator'),
      })

      const path = result.current.commit.path({
        provider: 'bb',
        owner: 'test-owner',
        repo: 'test-repo',
        commit: '1ab3',
        queryParams: { flags: ['myFlag'] },
      })
      expect(path).toBe(
        '/bb/test-owner/test-repo/commit/1ab3?flags%5B0%5D=myFlag'
      )
    })
  })

  describe('coverage link', () => {
    it('returns the correct link with nothing passed', () => {
      const { result } = renderHook(() => useNavLinks(), {
        wrapper: wrapper('/gl/doggo/squirrel-locator/'),
      })

      const path = result.current.coverage.path()
      expect(path).toBe('/gl/doggo/squirrel-locator')
    })

    it('can override the params', () => {
      const { result } = renderHook(() => useNavLinks(), {
        wrapper: wrapper('/gl/doggo/squirrel-locator'),
      })

      const path = result.current.coverage.path({
        provider: 'bb',
        owner: 'test-owner',
        repo: 'test-repo',
      })
      expect(path).toBe('/bb/test-owner/test-repo')
    })

    it('passes flags into the url', () => {
      const { result } = renderHook(() => useNavLinks(), {
        wrapper: wrapper('/gl/doggo/squirrel-locator'),
      })

      const path = result.current.coverage.path({
        provider: 'bb',
        owner: 'test-owner',
        repo: 'test-repo',
        queryParams: { flags: ['myFlag'] },
      })
      expect(path).toBe('/bb/test-owner/test-repo?flags%5B0%5D=myFlag')
    })

    it('passes branches into the url', () => {
      const { result } = renderHook(() => useNavLinks(), {
        wrapper: wrapper('/gl/doggo/squirrel-locator/'),
      })

      const path = result.current.coverage.path({
        provider: 'bb',
        owner: 'test-owner',
        repo: 'test-repo',
        branch: 'hello',
      })
      expect(path).toBe('/bb/test-owner/test-repo/tree/hello')
    })

    it('does not pass "All branches" into the url', () => {
      const { result } = renderHook(() => useNavLinks(), {
        wrapper: wrapper('/gl/doggo/squirrel-locator/'),
      })

      const path = result.current.coverage.path({
        provider: 'bb',
        owner: 'test-owner',
        repo: 'test-repo',
        branch: 'All branches',
      })
      expect(path).toBe('/bb/test-owner/test-repo')
    })
  })

  describe('commits link', () => {
    it('returns the correct link with nothing passed', () => {
      const { result } = renderHook(() => useNavLinks(), {
        wrapper: wrapper('/gl/doggo/squirrel-locator'),
      })

      const path = result.current.commits.path()
      expect(path).toBe('/gl/doggo/squirrel-locator/commits')
    })

    it('can override the params', () => {
      const { result } = renderHook(() => useNavLinks(), {
        wrapper: wrapper('/gl/doggo/squirrel-locator'),
      })

      const path = result.current.commits.path({
        provider: 'bb',
        owner: 'test-owner',
        repo: 'test-repo',
      })
      expect(path).toBe('/bb/test-owner/test-repo/commits')
    })
    it('passes branches into the url', () => {
      const { result } = renderHook(() => useNavLinks(), {
        wrapper: wrapper('/gl/doggo/squirrel-locator'),
      })

      const path = result.current.commits.path({
        provider: 'bb',
        owner: 'test-owner',
        repo: 'test-repo',
        branch: 'myBranch',
      })
      expect(path).toBe('/bb/test-owner/test-repo/commits/myBranch')
    })

    it('passes "All branches" into the url', () => {
      const { result } = renderHook(() => useNavLinks(), {
        wrapper: wrapper('/gl/doggo/squirrel-locator/'),
      })

      const path = result.current.commits.path({
        provider: 'bb',
        owner: 'test-owner',
        repo: 'test-repo',
        branch: 'All branches',
      })
      expect(path).toBe('/bb/test-owner/test-repo/commits/All%20branches')
    })
  })

  describe('commitFile link', () => {
    it('returns the correct link with nothing passed', () => {
      const { result } = renderHook(() => useNavLinks(), {
        wrapper: wrapper('/gh/test/test-repo/commit/abcd/index.js'),
      })

      const path = result.current.commitFile.path({
        commit: 'abcd',
        path: 'index.js',
      })
      expect(path).toBe('/gh/test/test-repo/commit/abcd/index.js')
    })

    it('can override the params', () => {
      const { result } = renderHook(() => useNavLinks(), {
        wrapper: wrapper('/gh/test/test-repo/commit/abcd/index.js'),
      })

      const path = result.current.commitFile.path({
        provider: 'bb',
        owner: 'test-owner',
        repo: 'test',
        commit: 'abcd',
        path: 'index.js',
      })
      expect(path).toBe('/bb/test-owner/test/commit/abcd/index.js')
    })
  })

  describe('treeView link', () => {
    it('returns the correct link with nothing passed', () => {
      const { result } = renderHook(() => useNavLinks(), {
        wrapper: wrapper('/gl/doggo/watch/src/view/catWatch.php'),
      })

      const path = result.current.treeView.path()
      expect(path).toBe('/gl/doggo/watch/tree/')
    })

    it('can override the params', () => {
      const { result } = renderHook(() => useNavLinks(), {
        wrapper: wrapper('/gl/doggo/watch/src/view/catWatch.php'),
      })

      const path = result.current.treeView.path({
        provider: 'bb',
        owner: 'test-owner',
        repo: 'test-repo',
      })
      expect(path).toBe('/bb/test-owner/test-repo/tree/')
    })

    it('accepts a ref option', () => {
      const { result } = renderHook(() => useNavLinks(), {
        wrapper: wrapper('/gl/doggo/watch/src/view/catWatch.php'),
      })

      const path = result.current.treeView.path({
        ref: 'main',
      })
      expect(path).toBe('/gl/doggo/watch/tree/main/')
    })

    it('accepts a tree option', () => {
      const { result } = renderHook(() => useNavLinks(), {
        wrapper: wrapper('/gl/doggo/watch/src/view/catWatch.php'),
      })

      const filePath = result.current.treeView.path({
        tree: 'src/view/catWatch.php',
        ref: 'ref',
      })
      expect(filePath).toBe(
        '/gl/doggo/watch/tree/ref/src%2Fview%2FcatWatch.php'
      )

      const topLevelDirPath = result.current.treeView.path({
        tree: 'src',
        ref: 'ref',
      })
      expect(topLevelDirPath).toBe('/gl/doggo/watch/tree/ref/src')

      const dirPath = result.current.treeView.path({
        tree: 'src/view',
        ref: 'ref',
      })
      expect(dirPath).toBe('/gl/doggo/watch/tree/ref/src%2Fview')
    })

    it('appends other args as query params', () => {
      const { result } = renderHook(() => useNavLinks(), {
        wrapper: wrapper('/gl/doggo/watch/src'),
      })

      const filePath = result.current.treeView.path({
        ref: 'main',
        tree: 'src/',
        queryParams: { flags: ['flag-1'] },
      })
      expect(filePath).toBe(
        '/gl/doggo/watch/tree/main/src%2F?flags%5B0%5D=flag-1'
      )
    })
  })

  describe('fileViewer link', () => {
    it('returns the correct link with nothing passed', () => {
      const { result } = renderHook(() => useNavLinks(), {
        wrapper: wrapper('/gh/codecov-owner/another-test/blob/main/index.js'),
      })

      const path = result.current.fileViewer.path({
        ref: 'main',
        tree: 'index.js',
      })
      expect(path).toBe('/gh/codecov-owner/another-test/blob/main/index.js')
    })

    it('can override the params', () => {
      const { result } = renderHook(() => useNavLinks(), {
        wrapper: wrapper('/gh/codecov-owner/another-test/blob/main/index.js'),
      })

      const path1 = result.current.fileViewer.path({
        provider: 'bb',
        ref: 'main',
        tree: 'index.js',
      })
      expect(path1).toBe('/bb/codecov-owner/another-test/blob/main/index.js')

      const path2 = result.current.fileViewer.path({
        owner: 'test-owner',
        ref: 'main',
        tree: 'index.js',
      })
      expect(path2).toBe('/gh/test-owner/another-test/blob/main/index.js')

      const path3 = result.current.fileViewer.path({
        ref: 'main',
        tree: 'flags1/mafs.js',
      })
      expect(path3).toBe(
        '/gh/codecov-owner/another-test/blob/main/flags1%2Fmafs.js'
      )

      const path4 = result.current.fileViewer.path({
        ref: 'test-br',
        tree: 'index.js',
      })
      expect(path4).toBe('/gh/codecov-owner/another-test/blob/test-br/index.js')
    })

    it('appends other args as query params', () => {
      const { result } = renderHook(() => useNavLinks(), {
        wrapper: wrapper('/gh/codecov-owner/another-test/blob/main/index.js'),
      })

      const filePath = result.current.fileViewer.path({
        ref: 'main',
        tree: 'index.js',
        queryParams: { flags: ['flag-1'] },
      })
      expect(filePath).toBe(
        '/gh/codecov-owner/another-test/blob/main/index.js?flags%5B0%5D=flag-1'
      )
    })
  })

  describe('commitTreeView link', () => {
    it('returns the correct link with only commit passed', () => {
      const { result } = renderHook(() => useNavLinks(), {
        wrapper: wrapper('/gl/doggo/watch/src/view/catWatch.php'),
      })

      const path = result.current.commitTreeView.path({ commit: 'sha256' })
      expect(path).toBe('/gl/doggo/watch/commit/sha256/tree')
    })

    it('can override the params', () => {
      const { result } = renderHook(() => useNavLinks(), {
        wrapper: wrapper('/gl/doggo/watch/src/view/catWatch.php'),
      })

      const path = result.current.commitTreeView.path({
        provider: 'bb',
        commit: 'sha256',
      })
      expect(path).toBe('/bb/doggo/watch/commit/sha256/tree')
    })

    it('accepts a commit option', () => {
      const { result } = renderHook(() => useNavLinks(), {
        wrapper: wrapper('/gl/doggo/watch/src/view/catWatch.php'),
      })

      const path = result.current.commitTreeView.path({
        commit: 'sha256',
      })
      expect(path).toBe('/gl/doggo/watch/commit/sha256/tree')
    })

    it('accepts a tree option', () => {
      const { result } = renderHook(() => useNavLinks(), {
        wrapper: wrapper('/gl/doggo/watch/src/view/catWatch.php'),
      })

      const filePath = result.current.commitTreeView.path({
        tree: 'src/view/catWatch.php',
        commit: 'sha128',
      })
      expect(filePath).toBe(
        '/gl/doggo/watch/commit/sha128/tree/src/view/catWatch.php'
      )

      const rootPath = result.current.commitTreeView.path({
        tree: 'src',
        commit: 'sha128',
      })
      expect(rootPath).toBe('/gl/doggo/watch/commit/sha128/tree/src')

      const subPath = result.current.commitTreeView.path({
        tree: 'src/view',
        commit: 'sha128',
      })
      expect(subPath).toBe('/gl/doggo/watch/commit/sha128/tree/src/view')
    })

    it('appends other args as query params', () => {
      const { result } = renderHook(() => useNavLinks(), {
        wrapper: wrapper('/gh/codecov-owner/another-test/blob/main/index.js'),
      })

      const path = result.current.commitTreeView.path({
        commit: 'sha256',
        queryParams: { flags: ['flag-1'] },
      })
      expect(path).toBe(
        '/gh/codecov-owner/another-test/commit/sha256/tree?flags%5B0%5D=flag-1'
      )
    })
  })

  describe('commitFileDiff link', () => {
    it('returns the correct link with nothing passed', () => {
      const { result } = renderHook(() => useNavLinks(), {
        wrapper: wrapper('/gh/codecov-owner/another-test/blob/main/index.js'),
      })

      const path = result.current.commitFileDiff.path({
        commit: 'sha256',
        tree: 'index.js',
      })
      expect(path).toBe(
        '/gh/codecov-owner/another-test/commit/sha256/blob/index.js'
      )
    })

    it('can override the params', () => {
      const { result } = renderHook(() => useNavLinks(), {
        wrapper: wrapper('/gh/codecov-owner/another-test/blob/main/index.js'),
      })

      const path = result.current.commitFileDiff.path({
        provider: 'bb',
        owner: 'test-owner',
        repo: 'test-repo',
        commit: 'sha256',
        tree: 'flags1/mafs.js',
      })
      expect(path).toBe(
        '/bb/test-owner/test-repo/commit/sha256/blob/flags1/mafs.js'
      )
    })

    it('appends other args as query params', () => {
      const { result } = renderHook(() => useNavLinks(), {
        wrapper: wrapper('/gh/codecov-owner/another-test/blob/main/index.js'),
      })

      const path = result.current.commitFileDiff.path({
        commit: 'sha256',
        tree: 'index.js',
        queryParams: { flags: ['flag-1'] },
      })
      expect(path).toBe(
        '/gh/codecov-owner/another-test/commit/sha256/blob/index.js?flags%5B0%5D=flag-1'
      )
    })
  })

  describe('repo overview link', () => {
    it('returns the correct link with nothing passed', () => {
      const { result } = renderHook(() => useNavLinks(), {
        wrapper: wrapper('/gh/codecov/test'),
      })

      const path = result.current.overview.path()
      expect(path).toBe('/gh/codecov/test')
    })

    it('can override the params', () => {
      const { result } = renderHook(() => useNavLinks(), {
        wrapper: wrapper('/gh/codecov/test'),
      })

      const path = result.current.overview.path({
        provider: 'bb',
        owner: 'test-owner',
      })
      expect(path).toBe('/bb/test-owner/test')
    })
  })

  describe('repo flags tab link', () => {
    it('returns the correct link with nothing passed', () => {
      const { result } = renderHook(() => useNavLinks(), {
        wrapper: wrapper('/gh/codecov/gazebo/flags'),
      })

      const path = result.current.flagsTab.path()
      expect(path).toBe('/gh/codecov/gazebo/flags')
    })

    it('can override the params', () => {
      const { result } = renderHook(() => useNavLinks(), {
        wrapper: wrapper('/gh/codecov/gazebo/flags'),
      })

      const path = result.current.flagsTab.path({
        provider: 'bb',
        owner: 'test-owner',
      })
      expect(path).toBe('/bb/test-owner/gazebo/flags')
    })

    it('passes branches into the url', () => {
      const { result } = renderHook(() => useNavLinks(), {
        wrapper: wrapper('/gh/codecov/gazebo/flags'),
      })

      const path = result.current.flagsTab.path({
        provider: 'bb',
        owner: 'test-owner',
        repo: 'test-repo',
        branch: 'hello',
      })
      expect(path).toBe('/bb/test-owner/test-repo/flags/hello')
    })

    it('does not pass "All branches" into the url', () => {
      const { result } = renderHook(() => useNavLinks(), {
        wrapper: wrapper('/gh/codecov/gazebo/flags'),
      })

      const path = result.current.flagsTab.path({
        provider: 'bb',
        owner: 'test-owner',
        repo: 'test-repo',
        branch: 'All branches',
      })
      expect(path).toBe('/bb/test-owner/test-repo/flags')
    })
  })

  describe('repo components tab link', () => {
    it('returns the correct link with nothing passed', () => {
      const { result } = renderHook(() => useNavLinks(), {
        wrapper: wrapper('/gh/codecov/gazebo/components'),
      })

      const path = result.current.componentsTab.path()
      expect(path).toBe('/gh/codecov/gazebo/components')
    })

    it('can override the params', () => {
      const { result } = renderHook(() => useNavLinks(), {
        wrapper: wrapper('/gh/codecov/gazebo/components'),
      })

      const path = result.current.componentsTab.path({
        provider: 'bb',
        owner: 'test-owner',
      })
      expect(path).toBe('/bb/test-owner/gazebo/components')
    })

    it('passes branches into the url', () => {
      const { result } = renderHook(() => useNavLinks(), {
        wrapper: wrapper('/gh/codecov/gazebo/components'),
      })

      const path = result.current.componentsTab.path({
        provider: 'bb',
        owner: 'test-owner',
        repo: 'test-repo',
        branch: 'main',
      })
      expect(path).toBe('/bb/test-owner/test-repo/components/main')
    })

    it('does not pass "All branches" into the url', () => {
      const { result } = renderHook(() => useNavLinks(), {
        wrapper: wrapper('/gh/codecov/gazebo/components'),
      })

      const path = result.current.componentsTab.path({
        provider: 'bb',
        owner: 'test-owner',
        repo: 'test-repo',
        branch: 'All branches',
      })
      expect(path).toBe('/bb/test-owner/test-repo/components')
    })
  })

  describe('repo branches link', () => {
    it('returns the correct link with nothing passed', () => {
      const { result } = renderHook(() => useNavLinks(), {
        wrapper: wrapper('/gh/codecov/test/branches'),
      })

      const path = result.current.branches.path()
      expect(path).toBe('/gh/codecov/test/branches')
    })

    it('can override the params', () => {
      const { result } = renderHook(() => useNavLinks(), {
        wrapper: wrapper('/gh/codecov/test/branches'),
      })

      const path = result.current.branches.path({
        provider: 'bb',
        owner: 'test-owner',
      })
      expect(path).toBe('/bb/test-owner/test/branches')
    })
  })

  describe('repo pulls link', () => {
    it('returns the correct link with nothing passed', () => {
      const { result } = renderHook(() => useNavLinks(), {
        wrapper: wrapper('/gh/codecov/test/pulls'),
      })

      const path = result.current.pulls.path()
      expect(path).toBe('/gh/codecov/test/pulls')
    })

    it('can override the params', () => {
      const { result } = renderHook(() => useNavLinks(), {
        wrapper: wrapper('/gh/codecov/test/pulls'),
      })

      const path = result.current.pulls.path({
        provider: 'bb',
        owner: 'test-owner',
        repo: 'test-repo',
      })
      expect(path).toBe('/bb/test-owner/test-repo/pulls')
    })
  })

  describe('repo config link', () => {
    it('returns the correct link with nothing passed', () => {
      const { result } = renderHook(() => useNavLinks(), {
        wrapper: wrapper('/gh/codecov/test/config'),
      })

      const path = result.current.configuration.path()
      expect(path).toBe('/gh/codecov/test/config')
    })

    it('can override the params', () => {
      const { result } = renderHook(() => useNavLinks(), {
        wrapper: wrapper('/gh/codecov/test/pulls'),
      })

      const path = result.current.configuration.path({
        provider: 'bb',
        owner: 'test-owner',
        repo: 'test-repo',
      })
      expect(path).toBe('/bb/test-owner/test-repo/config')
    })
  })

  describe('repo new link', () => {
    it('returns the correct link with nothing passed', () => {
      const { result } = renderHook(() => useNavLinks(), {
        wrapper: wrapper('/gh/codecov/test/new'),
      })

      const path = result.current.new.path()
      expect(path).toBe('/gh/codecov/test/new')
    })

    it('can override the params', () => {
      const { result } = renderHook(() => useNavLinks(), {
        wrapper: wrapper('/gh/codecov/test/pulls'),
      })

      const path = result.current.new.path({
        provider: 'bb',
        owner: 'test-owner',
        repo: 'test-repo',
      })
      expect(path).toBe('/bb/test-owner/test-repo/new')
    })
  })

  describe('repo new other link', () => {
    it('returns the correct link with nothing passed', () => {
      const { result } = renderHook(() => useNavLinks(), {
        wrapper: wrapper('/gh/codecov/test/new/other'),
      })

      const path = result.current.newOtherCI.path()
      expect(path).toBe('/gh/codecov/test/new/other-ci')
    })

    it('can override the params', () => {
      const { result } = renderHook(() => useNavLinks(), {
        wrapper: wrapper('/gh/codecov/test/new/other'),
      })

      const path = result.current.newOtherCI.path({
        provider: 'bb',
        owner: 'test-owner',
        repo: 'test-repo',
      })
      expect(path).toBe('/bb/test-owner/test-repo/new/other-ci')
    })
  })

  describe('repo new circle ci link', () => {
    it('returns the correct link with nothing passed', () => {
      const { result } = renderHook(() => useNavLinks(), {
        wrapper: wrapper('/gh/codecov/test/new/circle-ci'),
      })

      const path = result.current.circleCI.path()
      expect(path).toBe('/gh/codecov/test/new/circle-ci')
    })

    it('can override the params', () => {
      const { result } = renderHook(() => useNavLinks(), {
        wrapper: wrapper('/gh/codecov/test/new/circle-ci'),
      })

      const path = result.current.circleCI.path({
        provider: 'bb',
        owner: 'test-owner',
        repo: 'test-repo',
      })

      expect(path).toBe('/bb/test-owner/test-repo/new/circle-ci')
    })
  })

  describe('general repo configuration link', () => {
    it('returns the correct link with nothing passed', () => {
      const { result } = renderHook(() => useNavLinks(), {
        wrapper: wrapper('/gh/codecov/test/config'),
      })

      const path = result.current.configGeneral.path()
      expect(path).toBe('/gh/codecov/test/config/general')
    })

    it('can override the params', () => {
      const { result } = renderHook(() => useNavLinks(), {
        wrapper: wrapper('/gh/codecov/test/config'),
      })

      const path = result.current.configGeneral.path({
        provider: 'bb',
        owner: 'test-owner',
        repo: 'test-repo',
      })
      expect(path).toBe('/bb/test-owner/test-repo/config/general')
    })
  })

  describe('repo yaml link', () => {
    it('returns the correct link with nothing passed', () => {
      const { result } = renderHook(() => useNavLinks(), {
        wrapper: wrapper('/gh/codecov/test/config/yaml'),
      })

      const path = result.current.configYaml.path()
      expect(path).toBe('/gh/codecov/test/config/yaml')
    })

    it('can override the params', () => {
      const { result } = renderHook(() => useNavLinks(), {
        wrapper: wrapper('/gh/codecov/test/config/yaml'),
      })

      const path = result.current.configYaml.path({
        provider: 'bb',
        owner: 'test-owner',
        repo: 'test-repo',
      })
      expect(path).toBe('/bb/test-owner/test-repo/config/yaml')
    })
  })

  describe('badge repo configuration link', () => {
    it('returns the correct link with nothing passed', () => {
      const { result } = renderHook(() => useNavLinks(), {
        wrapper: wrapper('/gh/codecov/test/config/badge'),
      })

      const path = result.current.configBadge.path()
      expect(path).toBe('/gh/codecov/test/config/badge')
    })

    it('can override the params', () => {
      const { result } = renderHook(() => useNavLinks(), {
        wrapper: wrapper('/gh/codecov/test/config/badge'),
      })

      const path = result.current.configBadge.path({
        provider: 'bb',
        owner: 'test-owner',
        repo: 'test-repo',
      })
      expect(path).toBe('/bb/test-owner/test-repo/config/badge')
    })
  })

  describe('pull detail', () => {
    it('returns the correct link with nothing passed', () => {
      const { result } = renderHook(() => useNavLinks(), {
        wrapper: wrapper('/gl/doggo/squirrel-locator/pull/409'),
      })

      const path = result.current.pullDetail.path()
      expect(path).toBe('/gl/doggo/squirrel-locator/pull/409')
    })

    it('can override the params', () => {
      const { result } = renderHook(() => useNavLinks(), {
        wrapper: wrapper('/gl/doggo/squirrel-locator/pull/409'),
      })

      const path = result.current.pullDetail.path({
        provider: 'bb',
        owner: 'test-owner',
        repo: 'test-repo',
        pullId: 123,
      })
      expect(path).toBe('/bb/test-owner/test-repo/pull/123')
    })

    it('passes flags selected through to url', () => {
      const { result } = renderHook(() => useNavLinks(), {
        wrapper: wrapper('/gl/doggo/squirrel-locator/pull/409'),
      })

      const path = result.current.pullDetail.path({
        queryParams: { flags: ['myFlag'] },
      })

      expect(path).toBe(
        '/gl/doggo/squirrel-locator/pull/409?flags%5B0%5D=myFlag'
      )
    })
  })

  describe('pull commits', () => {
    it('returns the correct link with nothing passed', () => {
      const { result } = renderHook(() => useNavLinks(), {
        wrapper: wrapper('/gl/doggo/squirrel-locator/pull/409/commits'),
      })

      const path = result.current.pullCommits.path()
      expect(path).toBe('/gl/doggo/squirrel-locator/pull/409/commits')
    })

    it('can override the params', () => {
      const { result } = renderHook(() => useNavLinks(), {
        wrapper: wrapper('/gl/doggo/squirrel-locator/pull/409/commits'),
      })

      const path = result.current.pullCommits.path({
        provider: 'bb',
        owner: 'test-owner',
        repo: 'test-repo',
        pullId: 123,
      })
      expect(path).toBe('/bb/test-owner/test-repo/pull/123/commits')
    })
  })

  describe('pull flags', () => {
    it('returns the correct link with nothing passed', () => {
      const { result } = renderHook(() => useNavLinks(), {
        wrapper: wrapper('/gl/doggo/squirrel-locator/pull/409/flags'),
      })

      const path = result.current.pullFlags.path()
      expect(path).toBe('/gl/doggo/squirrel-locator/pull/409/flags')
    })

    it('can override the params', () => {
      const { result } = renderHook(() => useNavLinks(), {
        wrapper: wrapper('/gl/doggo/squirrel-locator/pull/409/flags'),
      })

      const path = result.current.pullFlags.path({
        provider: 'bb',
        owner: 'test-owner',
        repo: 'test-repo',
        pullId: 123,
      })
      expect(path).toBe('/bb/test-owner/test-repo/pull/123/flags')
    })
    it('passes flags selected through to url', () => {
      const { result } = renderHook(() => useNavLinks(), {
        wrapper: wrapper('/gl/doggo/squirrel-locator/pull/409/flags'),
      })

      const path = result.current.pullFlags.path({
        queryParams: { flags: ['myFlag'] },
      })

      expect(path).toBe(
        '/gl/doggo/squirrel-locator/pull/409/flags?flags%5B0%5D=myFlag'
      )
    })
  })

  describe('pull components', () => {
    it('returns the correct link with nothing passed', () => {
      const { result } = renderHook(() => useNavLinks(), {
        wrapper: wrapper('/gl/doggo/squirrel-locator/pull/409/components'),
      })

      const path = result.current.pullComponents.path()
      expect(path).toBe('/gl/doggo/squirrel-locator/pull/409/components')
    })

    it('can override the params', () => {
      const { result } = renderHook(() => useNavLinks(), {
        wrapper: wrapper('/gl/doggo/squirrel-locator/pull/409/components'),
      })

      const path = result.current.pullComponents.path({
        provider: 'bb',
        owner: 'test-owner',
        repo: 'test-repo',
        pullId: 888,
      })
      expect(path).toBe('/bb/test-owner/test-repo/pull/888/components')
    })
    it('passes flags selected through to url', () => {
      const { result } = renderHook(() => useNavLinks(), {
        wrapper: wrapper('/gl/doggo/squirrel-locator/pull/409/components'),
      })

      const path = result.current.pullComponents.path({
        queryParams: { flags: ['myFlag'] },
      })

      expect(path).toBe(
        '/gl/doggo/squirrel-locator/pull/409/components?flags%5B0%5D=myFlag'
      )
    })
  })

  describe('pull tree view', () => {
    it('returns the correct link with nothing passed', () => {
      const { result } = renderHook(() => useNavLinks(), {
        wrapper: wrapper('/gl/doggo/squirrel-locator/pull/409/tree'),
      })

      const path = result.current.pullTreeView.path()
      expect(path).toBe('/gl/doggo/squirrel-locator/pull/409/tree')
    })

    it('can override the params', () => {
      const { result } = renderHook(() => useNavLinks(), {
        wrapper: wrapper('/gl/doggo/squirrel-locator/pull/409/tree'),
      })

      const path = result.current.pullTreeView.path({
        provider: 'bb',
        owner: 'test-owner',
        repo: 'test-repo',
        pullId: 888,
      })
      expect(path).toBe('/bb/test-owner/test-repo/pull/888/tree')
    })
    describe('with tree option', () => {
      it('returns the correct link with nothing passed', () => {
        const { result } = renderHook(() => useNavLinks(), {
          wrapper: wrapper('/gl/doggo/squirrel-locator/pull/409/tree/src/foo'),
        })

        const path = result.current.pullTreeView.path()
        expect(path).toBe('/gl/doggo/squirrel-locator/pull/409/tree')
      })

      it('can override the params', () => {
        const { result } = renderHook(() => useNavLinks(), {
          wrapper: wrapper('/gl/doggo/squirrel-locator/pull/409/tree/src/foo'),
        })

        const path = result.current.pullTreeView.path({
          provider: 'bb',
          owner: 'test-owner',
          repo: 'test-repo',
          pullId: 888,
          tree: 'src/bar',
        })
        expect(path).toBe('/bb/test-owner/test-repo/pull/888/tree/src/bar')
      })
    })
    it('passes flags selected through to url', () => {
      const { result } = renderHook(() => useNavLinks(), {
        wrapper: wrapper('/gl/doggo/squirrel-locator/pull/409/tree'),
      })

      const path = result.current.pullTreeView.path({
        queryParams: { flags: ['myFlag'] },
      })

      expect(path).toBe(
        '/gl/doggo/squirrel-locator/pull/409/tree?flags%5B0%5D=myFlag'
      )
    })
  })

  describe('pull blob view', () => {
    it('returns the correct link with nothing passed', () => {
      const { result } = renderHook(() => useNavLinks(), {
        wrapper: wrapper(
          '/gl/doggo/squirrel-locator/pull/409/blob/src/some/repo/structure/main.go'
        ),
      })

      const path = result.current.pullFileView.path()
      expect(path).toBe(
        '/gl/doggo/squirrel-locator/pull/409/blob/src/some/repo/structure/main.go'
      )
    })

    it('can override the params', () => {
      const { result } = renderHook(() => useNavLinks(), {
        wrapper: wrapper(
          '/gl/doggo/squirrel-locator/pull/409/blob/src/some/repo/structure/main.go'
        ),
      })

      const path = result.current.pullFileView.path({
        provider: 'bb',
        owner: 'test-owner',
        repo: 'test-repo',
        pullId: 888,
        tree: 'another/repo/structure/main.go',
      })
      expect(path).toBe(
        '/bb/test-owner/test-repo/pull/888/blob/another/repo/structure/main.go'
      )
    })
    it('passes flags selected through to url', () => {
      const { result } = renderHook(() => useNavLinks(), {
        wrapper: wrapper(
          '/gl/doggo/squirrel-locator/pull/409/blob/src/some/repo/structure/main.go'
        ),
      })

      const path = result.current.pullFileView.path({
        queryParams: { flags: ['myFlag'] },
      })

      expect(path).toBe(
        '/gl/doggo/squirrel-locator/pull/409/blob/src/some/repo/structure/main.go?flags%5B0%5D=myFlag'
      )
    })
  })

  describe('pull indirect changes', () => {
    it('returns the correct link with nothing passed', () => {
      const { result } = renderHook(() => useNavLinks(), {
        wrapper: wrapper(
          '/gl/doggo/squirrel-locator/pull/409/indirect-changes'
        ),
      })

      const path = result.current.pullIndirectChanges.path()
      expect(path).toBe('/gl/doggo/squirrel-locator/pull/409/indirect-changes')
    })

    it('can override the params', () => {
      const { result } = renderHook(() => useNavLinks(), {
        wrapper: wrapper(
          '/gl/doggo/squirrel-locator/pull/409/indirect-changes'
        ),
      })

      const path = result.current.pullIndirectChanges.path({
        provider: 'bb',
        owner: 'test-owner',
        repo: 'test-repo',
        pullId: 888,
      })
      expect(path).toBe('/bb/test-owner/test-repo/pull/888/indirect-changes')
    })
    it('passes flags selected through to url', () => {
      const { result } = renderHook(() => useNavLinks(), {
        wrapper: wrapper(
          '/gl/doggo/squirrel-locator/pull/409/indirect-changes'
        ),
      })

      const path = result.current.pullIndirectChanges.path({
        queryParams: { flags: ['myFlag'] },
      })

      expect(path).toBe(
        '/gl/doggo/squirrel-locator/pull/409/indirect-changes?flags%5B0%5D=myFlag'
      )
    })
  })

  describe('commit indirect changes', () => {
    it('returns the correct link with nothing passed', () => {
      const { result } = renderHook(() => useNavLinks(), {
        wrapper: wrapper('/gl/doggo/squirrel-locator'),
      })

      const path = result.current.commitIndirectChanges.path({ commit: 409 })
      expect(path).toBe(
        '/gl/doggo/squirrel-locator/commit/409/indirect-changes'
      )
    })

    it('can override the params', () => {
      const { result } = renderHook(() => useNavLinks(), {
        wrapper: wrapper('/gl/doggo/squirrel-locator'),
      })

      const path = result.current.commitIndirectChanges.path({
        provider: 'bb',
        owner: 'test-owner',
        repo: 'test-repo',
        commit: 888,
      })
      expect(path).toBe('/bb/test-owner/test-repo/commit/888/indirect-changes')
    })

    it('appends other args as query params', () => {
      const { result } = renderHook(() => useNavLinks(), {
        wrapper: wrapper('/gl/doggo/squirrel-locator'),
      })

      const path = result.current.commitIndirectChanges.path({
        commit: 409,
        queryParams: { flags: ['flag-1'] },
      })
      expect(path).toBe(
        '/gl/doggo/squirrel-locator/commit/409/indirect-changes?flags%5B0%5D=flag-1'
      )
    })
  })

  describe('prevLink', () => {
    describe('ref provided', () => {
      it('returns the correct url', () => {
        const url = `/gh/codecov?ref=${encodeURIComponent(
          '/gh/codecov/codecov-demo'
        )}`
        const { result } = renderHook(() => useNavLinks(), {
          wrapper: wrapper(url),
        })

        const path = result.current.prevLink.path({
          ref: encodeURIComponent('/gh/codecov/codecov-demo'),
        })
        expect(path).toBe('/gh/codecov/codecov-demo')
      })
    })

    describe('no ref provided', () => {
      it('returns the correct url', () => {
        const { result } = renderHook(() => useNavLinks(), {
          wrapper: wrapper('/gh/feedback'),
        })

        const path = result.current.prevLink.path()
        expect(path).toBe('/gh')
      })
    })
  })

  describe('access', () => {
    describe('testing all orgs and repos', () => {
      it('returns the correct url', () => {
        const { result } = renderHook(() => useNavLinks(), {
          wrapper: wrapper('/admin/gh/access'),
        })

        const path = result.current.access.path()
        expect(path).toBe('/admin/gh/access')
      })

      it('can override params', () => {
        const { result } = renderHook(() => useNavLinks(), {
          wrapper: wrapper('/admin/gh/access'),
        })

        const path = result.current.access.path({ provider: 'gl' })
        expect(path).toBe('/admin/gl/access')
      })
    })
  })

  describe('users', () => {
    describe('testing all orgs and repos', () => {
      it('returns the correct url', () => {
        const { result } = renderHook(() => useNavLinks(), {
          wrapper: wrapper('/admin/gh/users'),
        })

        const path = result.current.users.path()
        expect(path).toBe('/admin/gh/users')
      })

      it('can override params', () => {
        const { result } = renderHook(() => useNavLinks(), {
          wrapper: wrapper('/admin/gh/users'),
        })

        const path = result.current.users.path({ provider: 'gl' })
        expect(path).toBe('/admin/gl/users')
      })
    })
  })

  describe('general repo upload token link', () => {
    it('returns the correct link with nothing passed', () => {
      const { result } = renderHook(() => useNavLinks(), {
        wrapper: wrapper('/gh/codecov'),
      })

      const path = result.current.orgUploadToken.path()
      expect(path).toBe('/account/gh/codecov/org-upload-token')
    })

    it('can override the params', () => {
      const { result } = renderHook(() => useNavLinks(), {
        wrapper: wrapper('/gh/codecov'),
      })

      const path = result.current.orgUploadToken.path({
        provider: 'bb',
        owner: 'test-owner',
      })
      expect(path).toBe('/account/bb/test-owner/org-upload-token')
    })
  })

  describe('github repo secrets', () => {
    it('returns the correct link with nothing passed', () => {
      const { result } = renderHook(() => useNavLinks(), {
        wrapper: wrapper('/gh/codecov/cool-repo'),
      })

      const path = result.current.githubRepoSecrets.path()
      expect(path).toBe(
        'https://github.com/codecov/cool-repo/settings/secrets/actions/new'
      )
    })

    it('can override the params', () => {
      const { result } = renderHook(() => useNavLinks(), {
        wrapper: wrapper('/gh/codecov/cool-repo'),
      })

      const path = result.current.githubRepoSecrets.path({
        owner: 'test-owner',
        repo: 'test-repo',
      })
      expect(path).toBe(
        'https://github.com/test-owner/test-repo/settings/secrets/actions/new'
      )
    })
  })

  describe('github repo actions', () => {
    it('returns the correct link with nothing passed', () => {
      const { result } = renderHook(() => useNavLinks(), {
        wrapper: wrapper('/gh/codecov/cool-repo'),
      })

      const path = result.current.githubRepoActions.path({ branch: 'main' })
      expect(path).toBe(
        'https://github.com/codecov/cool-repo/tree/main/.github/workflows'
      )
    })

    it('can override the params', () => {
      const { result } = renderHook(() => useNavLinks(), {
        wrapper: wrapper('/gh/codecov/cool-repo'),
      })

      const path = result.current.githubRepoActions.path({
        owner: 'test-owner',
        repo: 'test-repo',
        branch: 'master',
      })
      expect(path).toBe(
        'https://github.com/test-owner/test-repo/tree/master/.github/workflows'
      )
    })
  })

  describe('circleCIEnvVars', () => {
    it('returns the correct link with nothing passed', () => {
      const { result } = renderHook(() => useNavLinks(), {
        wrapper: wrapper('/gh/codecov/cool-repo'),
      })

      const path = result.current.circleCIEnvVars.path()
      expect(path).toBe(
        'https://app.circleci.com/settings/project/gh/codecov/cool-repo/environment-variables'
      )
    })

    it('can override the params', () => {
      const { result } = renderHook(() => useNavLinks(), {
        wrapper: wrapper('/gh/codecov/cool-repo'),
      })

      const path = result.current.circleCIEnvVars.path({
        provider: 'bb',
        owner: 'test-owner',
        repo: 'test-repo',
      })
      expect(path).toBe(
        'https://app.circleci.com/settings/project/bb/test-owner/test-repo/environment-variables'
      )
    })
  })

  describe('circleCI yaml', () => {
    it('returns the correct link with nothing passed', () => {
      const { result } = renderHook(() => useNavLinks(), {
        wrapper: wrapper('/gh/codecov/cool-repo'),
      })

      const path = result.current.circleCIyaml.path({ branch: 'main' })
      expect(path).toBe(
        'https://github.com/codecov/cool-repo/tree/main/.circleci/config'
      )
    })

    it('can override the params', () => {
      const { result } = renderHook(() => useNavLinks(), {
        wrapper: wrapper('/gh/codecov/cool-repo'),
      })

      const path = result.current.circleCIyaml.path({
        owner: 'test-owner',
        repo: 'test-repo',
        branch: 'master',
      })
      expect(path).toBe(
        'https://github.com/test-owner/test-repo/tree/master/.circleci/config'
      )
    })
  })

  describe('billingAndUsers', () => {
    it('returns the correct link with nothing passed', () => {
      const { result } = renderHook(() => useNavLinks(), {
        wrapper: wrapper('/account/gh/codecov/billing'),
      })

      const path = result.current.billingAndUsers.path()
      expect(path).toBe('/account/gh/codecov/billing')
    })

    it('can override the params', () => {
      const { result } = renderHook(() => useNavLinks(), {
        wrapper: wrapper('/account/gh/codecov/billing'),
      })

      const path = result.current.billingAndUsers.path({
        provider: 'bb',
        owner: 'test-owner',
      })
      expect(path).toBe('/account/bb/test-owner/billing')
    })
  })

  describe('Profile', () => {
    it('returns the correct link with nothing passed', () => {
      const { result } = renderHook(() => useNavLinks(), {
        wrapper: wrapper('/account/gh/codecov'),
      })

      const path = result.current.profile.path()
      expect(path).toBe('/account/gh/codecov')
    })

    it('can override the params', () => {
      const { result } = renderHook(() => useNavLinks(), {
        wrapper: wrapper('/account/gh/codecov'),
      })

      const path = result.current.profile.path({
        provider: 'bb',
        owner: 'test-owner',
      })
      expect(path).toBe('/account/bb/test-owner')
    })
  })

  describe('Okta access', () => {
    it('returns the correct link with nothing passed', () => {
      const { result } = renderHook(() => useNavLinks(), {
        wrapper: wrapper('/account/gh/codecov/okta-access'),
      })

      const path = result.current.oktaAccess.path()
      expect(path).toBe('/account/gh/codecov/okta-access')
    })

    it('can override the params', () => {
      const { result } = renderHook(() => useNavLinks(), {
        wrapper: wrapper('/account/gh/codecov/okta-access'),
      })

      const path = result.current.oktaAccess.path({ provider: 'gl' })
      expect(path).toBe('/account/gl/codecov/okta-access')
    })
  })

  describe('bundles tab', () => {
    it('returns the correct link with nothing passed', () => {
      const { result } = renderHook(() => useNavLinks(), {
        wrapper: wrapper('/gh/codecov/cool-repo'),
      })

      const path = result.current.bundles.path()
      expect(path).toBe('/gh/codecov/cool-repo/bundles')
    })

    it('can override the params', () => {
      const { result } = renderHook(() => useNavLinks(), {
        wrapper: wrapper('/gh/codecov/cool-repo'),
      })

      const path = result.current.bundles.path({
        provider: 'bb',
        owner: 'test-owner',
        repo: 'test-repo',
      })
      expect(path).toBe('/bb/test-owner/test-repo/bundles')
    })

    describe('passing branch option', () => {
      it('appends the branch param', () => {
        const { result } = renderHook(() => useNavLinks(), {
          wrapper: wrapper('/gh/codecov/cool-repo'),
        })

        const path = result.current.bundles.path({ branch: 'test-branch' })
        expect(path).toBe('/gh/codecov/cool-repo/bundles/test-branch')
      })
    })

    describe('passing branch and bundle option', () => {
      it('appends the branch and bundle param', () => {
        const { result } = renderHook(() => useNavLinks(), {
          wrapper: wrapper('/gh/codecov/cool-repo'),
        })

        const path = result.current.bundles.path({
          branch: 'test-branch',
          bundle: 'test-bundle',
        })
        expect(path).toBe(
          '/gh/codecov/cool-repo/bundles/test-branch/test-bundle'
        )
      })

      it('does not pass "All branches" into the url', () => {
        const { result } = renderHook(() => useNavLinks(), {
          wrapper: wrapper('/gh/codecov/cool-repo'),
        })

        const path = result.current.bundles.path({
          branch: 'All branches',
          bundle: 'test-bundle',
        })
        expect(path).toBe('/gh/codecov/cool-repo/bundles')
      })
    })
  })

  describe('bundle onboarding', () => {
    it('returns the correct link with nothing passed', () => {
      const { result } = renderHook(() => useNavLinks(), {
        wrapper: wrapper('/gh/codecov/cool-repo'),
      })

      const path = result.current.bundleOnboarding.path()
      expect(path).toBe('/gh/codecov/cool-repo/bundles/new')
    })

    it('can override the params', () => {
      const { result } = renderHook(() => useNavLinks(), {
        wrapper: wrapper('/gh/codecov/cool-repo'),
      })

      const path = result.current.bundleOnboarding.path({
        provider: 'bb',
        owner: 'test-owner',
        repo: 'test-repo',
      })
      expect(path).toBe('/bb/test-owner/test-repo/bundles/new')
    })
  })

  describe('rollup onboarding', () => {
    it('returns the correct link with nothing passed', () => {
      const { result } = renderHook(() => useNavLinks(), {
        wrapper: wrapper('/gh/codecov/cool-repo'),
      })

      const path = result.current.bundleRollupOnboarding.path()
      expect(path).toBe('/gh/codecov/cool-repo/bundles/new/rollup')
    })

    it('can override the params', () => {
      const { result } = renderHook(() => useNavLinks(), {
        wrapper: wrapper('/gh/codecov/cool-repo'),
      })

      const path = result.current.bundleRollupOnboarding.path({
        provider: 'bb',
        owner: 'test-owner',
        repo: 'test-repo',
      })
      expect(path).toBe('/bb/test-owner/test-repo/bundles/new/rollup')
    })
  })

  describe('webpack onboarding', () => {
    it('returns the correct link with nothing passed', () => {
      const { result } = renderHook(() => useNavLinks(), {
        wrapper: wrapper('/gh/codecov/cool-repo'),
      })

      const path = result.current.bundleWebpackOnboarding.path()
      expect(path).toBe('/gh/codecov/cool-repo/bundles/new/webpack')
    })

    it('can override the params', () => {
      const { result } = renderHook(() => useNavLinks(), {
        wrapper: wrapper('/gh/codecov/cool-repo'),
      })

      const path = result.current.bundleWebpackOnboarding.path({
        provider: 'bb',
        owner: 'test-owner',
        repo: 'test-repo',
      })
      expect(path).toBe('/bb/test-owner/test-repo/bundles/new/webpack')
    })
  })

  describe('nuxt onboarding', () => {
    it('returns the correct link with nothing passed', () => {
      const { result } = renderHook(() => useNavLinks(), {
        wrapper: wrapper('/gh/codecov/cool-repo'),
      })

      const path = result.current.bundleNuxtOnboarding.path()
      expect(path).toBe('/gh/codecov/cool-repo/bundles/new/nuxt')
    })

    it('can override the params', () => {
      const { result } = renderHook(() => useNavLinks(), {
        wrapper: wrapper('/gh/codecov/cool-repo'),
      })

      const path = result.current.bundleNuxtOnboarding.path({
        provider: 'bb',
        owner: 'test-owner',
        repo: 'test-repo',
      })
      expect(path).toBe('/bb/test-owner/test-repo/bundles/new/nuxt')
    })
  })

  describe('remix vite onboarding', () => {
    it('returns the correct link with nothing passed', () => {
      const { result } = renderHook(() => useNavLinks(), {
        wrapper: wrapper('/gh/codecov/cool-repo'),
      })

      const path = result.current.bundleRemixOnboarding.path()
      expect(path).toBe('/gh/codecov/cool-repo/bundles/new/remix-vite')
    })

    it('can override the params', () => {
      const { result } = renderHook(() => useNavLinks(), {
        wrapper: wrapper('/gh/codecov/cool-repo'),
      })

      const path = result.current.bundleRemixOnboarding.path({
        provider: 'bb',
        owner: 'test-owner',
        repo: 'test-repo',
      })
      expect(path).toBe('/bb/test-owner/test-repo/bundles/new/remix-vite')
    })
  })

  describe('sveltekit onboarding', () => {
    it('returns the correct link with nothing passed', () => {
      const { result } = renderHook(() => useNavLinks(), {
        wrapper: wrapper('/gh/codecov/cool-repo'),
      })

      const path = result.current.bundleSvelteKitOnboarding.path()
      expect(path).toBe('/gh/codecov/cool-repo/bundles/new/sveltekit')
    })

    it('can override the params', () => {
      const { result } = renderHook(() => useNavLinks(), {
        wrapper: wrapper('/gh/codecov/cool-repo'),
      })

      const path = result.current.bundleSvelteKitOnboarding.path({
        provider: 'bb',
        owner: 'test-owner',
        repo: 'test-repo',
      })
      expect(path).toBe('/bb/test-owner/test-repo/bundles/new/sveltekit')
    })
  })

  describe('solidstart onboarding', () => {
    it('returns the correct link with nothing passed', () => {
      const { result } = renderHook(() => useNavLinks(), {
        wrapper: wrapper('/gh/codecov/cool-repo'),
      })

      const path = result.current.bundleSolidStartOnboarding.path()
      expect(path).toBe('/gh/codecov/cool-repo/bundles/new/solidstart')
    })

    it('can override the params', () => {
      const { result } = renderHook(() => useNavLinks(), {
        wrapper: wrapper('/gh/codecov/cool-repo'),
      })

      const path = result.current.bundleSolidStartOnboarding.path({
        provider: 'bb',
        owner: 'test-owner',
        repo: 'test-repo',
      })
      expect(path).toBe('/bb/test-owner/test-repo/bundles/new/solidstart')
    })
  })

  describe('Failed tests tab', () => {
    it('returns the correct link with nothing passed', () => {
      const { result } = renderHook(() => useNavLinks(), {
        wrapper: wrapper('/gl/codecov/cool-repo'),
      })

      const path = result.current.failedTestsOnboarding.path()
      expect(path).toBe('/gl/codecov/cool-repo/tests/new')
    })

    it('can override the params', () => {
      const { result } = renderHook(() => useNavLinks(), {
        wrapper: wrapper('/gl/codecov/cool-repo'),
      })

      const path = result.current.failedTestsOnboarding.path({
        provider: 'bb',
        owner: 'test-owner',
        repo: 'test-repo',
      })
      expect(path).toBe('/bb/test-owner/test-repo/tests/new')
    })

    it('can return the failed test table', () => {
      const { result } = renderHook(() => useNavLinks(), {
        wrapper: wrapper('/gl/codecov/cool-repo'),
      })

      const path = result.current.failedTests.path()
      expect(path).toBe('/gl/codecov/cool-repo/tests')
    })

    it('can override the failed test table params', () => {
      const { result } = renderHook(() => useNavLinks(), {
        wrapper: wrapper('/gl/codecov/cool-repo'),
      })

      const path = result.current.failedTests.path({
        provider: 'bb',
        owner: 'test-owner',
        repo: 'test-repo',
      })
      expect(path).toBe('/bb/test-owner/test-repo/tests')
    })

    it('can also accept a branch', () => {
      const { result } = renderHook(() => useNavLinks(), {
        wrapper: wrapper('/gl/codecov/cool-repo'),
      })

      const path = result.current.failedTests.path({
        provider: 'bb',
        owner: 'test-owner',
        repo: 'test-repo',
        branch: 'cool',
      })
      expect(path).toBe('/bb/test-owner/test-repo/tests/cool')
    })

    it('does not pass "All branches" into the url', () => {
      const { result } = renderHook(() => useNavLinks(), {
        wrapper: wrapper('/gl/codecov/cool-repo'),
      })

      const path = result.current.failedTests.path({
        provider: 'bb',
        owner: 'test-owner',
        repo: 'test-repo',
        branch: 'All branches',
      })
      expect(path).toBe('/bb/test-owner/test-repo/tests')
    })
  })

  describe('Failed tests tab Codecov CLI view', () => {
    it('returns the correct link with nothing passed', () => {
      const { result } = renderHook(() => useNavLinks(), {
        wrapper: wrapper('/gl/codecov/cool-repo'),
      })

      const path = result.current.failedTestsCodecovCLI.path()
      expect(path).toBe('/gl/codecov/cool-repo/tests/new/codecov-cli')
    })

    it('can override the params', () => {
      const { result } = renderHook(() => useNavLinks(), {
        wrapper: wrapper('/gl/codecov/cool-repo'),
      })

      const path = result.current.failedTestsCodecovCLI.path({
        provider: 'bb',
        owner: 'test-owner',
        repo: 'test-repo',
      })
      expect(path).toBe('/bb/test-owner/test-repo/tests/new/codecov-cli')
    })
  })

  describe('okta login', () => {
    it('returns the correct link with nothing passed', () => {
      const { result } = renderHook(() => useNavLinks(), {
        wrapper: wrapper('/gh/test-owner'),
      })

      const path = result.current.oktaLogin.path()
      expect(path).toBe('/login/okta/gh/test-owner')
    })

    it('can override the params', () => {
      const { result } = renderHook(() => useNavLinks(), {
        wrapper: wrapper('/bb/test-owner'),
      })

      const path = result.current.oktaLogin.path({
        provider: 'bb',
        owner: 'test-owner',
      })
      expect(path).toBe('/login/okta/bb/test-owner')
    })
  })
})
