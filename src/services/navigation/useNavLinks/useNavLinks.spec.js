import { renderHook } from '@testing-library/react-hooks'
import Cookie from 'js-cookie'
import { MemoryRouter, Route } from 'react-router-dom'

import config from 'config'

import { useNavLinks } from './useNavLinks'

const wrapper =
  (location) =>
  ({ children }) =>
    (
      <MemoryRouter initialEntries={[location]} initialIndex={0}>
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
    )

describe('useNavLinks one off', () => {
  describe('Sign In', () => {
    afterEach(() => {
      Cookie.remove('utmParams')
    })
    it('forwards the utm tags', () => {
      Cookie.set(
        'utmParams',
        'utm_source=a&utm_medium=b&utm_campaign=c&utm_term=d&utm_content=e'
      )
      const { result } = renderHook(() => useNavLinks(), {
        wrapper: wrapper('/gh/doggo/squirrel-locator'),
      })

      expect(
        result.current.signIn.path({
          to: 'htts://app.codecov.io/gh/codecov',
        })
      ).toBe(
        'https://stage-web.codecov.dev/login/gh?to=htts%3A%2F%2Fapp.codecov.io%2Fgh%2Fcodecov&utm_source=a&utm_medium=b&utm_campaign=c&utm_term=d&utm_content=e'
      )
      Cookie.remove('utmParams')
    })
  })
})

describe('useNavLinks cleaned', () => {
  describe.each([
    // [
    //   'provider',
    //   '/gl/doggo/squirrel-locator',
    //   '/gl',
    //   [{ props: { provider: 'dog' }, expected: '/dog' }],
    // ],
    // [
    //   'signOut',
    //   '/gl/doggo/squirrel-locator',
    //   `${config.BASE_URL}/logout/gl`,
    //   [
    //     {
    //       props: { provider: 'bb' },
    //       expected: `${config.BASE_URL}/logout/bb`,
    //     },
    //   ],
    // ],
    // [
    //   'signIn',
    //   '/gl/doggo/squirrel-locator',
    //   `${config.BASE_URL}/login/gl`,
    //   [
    //     {
    //       props: { provider: 'bb' },
    //       expected: `${config.BASE_URL}/login/bb`,
    //     },
    //     {
    //       props: {
    //         to: 'htts://app.codecov.io/gh/codecov',
    //       },
    //       expected: `${config.BASE_URL}/login/gl?to=htts%3A%2F%2Fapp.codecov.io%2Fgh%2Fcodecov`,
    //     },
    //   ],
    // ],
    // [
    //   'owner',
    //   '/gl/doggo/squirrel-locator',
    //   '/gl/doggo',
    //   [
    //     {
    //       props: { provider: 'bb' },
    //       expected: `/bb/doggo`,
    //     },
    //     {
    //       props: {
    //         owner: 'cat',
    //       },
    //       expected: `/gl/cat`,
    //     },
    //   ],
    // ],
    // [
    //   'analytics',
    //   '/gl/doggo/squirrel-locator',
    //   '/analytics/gl/doggo',
    //   [
    //     {
    //       props: { provider: 'bb' },
    //       expected: `/analytics/bb/doggo`,
    //     },
    //     {
    //       props: {
    //         owner: 'cat',
    //       },
    //       expected: `/analytics/gl/cat`,
    //     },
    //   ],
    // ],
    // [
    //   'planTab',
    //   '/gl/doggo/squirrel-locator',
    //   `/plan/gl/doggo`,
    //   [
    //     {
    //       props: { provider: 'bb' },
    //       expected: `/plan/bb/doggo`,
    //     },
    //     {
    //       props: {
    //         owner: 'cat',
    //       },
    //       expected: `/plan/gl/cat`,
    //     },
    //   ],
    // ],
    // [
    //   'allOrgsPlanPage',
    //   '/gl/doggo',
    //   `/plan/gl`,
    //   [
    //     {
    //       props: { provider: 'bb' },
    //       expected: `/plan/bb`,
    //     },
    //   ],
    // ],
    // [
    //   'membersTab',
    //   '/gh/critical-role/calloway',
    //   `/members/gh/critical-role`,
    //   [
    //     {
    //       props: { provider: 'bb' },
    //       expected: `/members/bb/critical-role`,
    //     },
    //     {
    //       props: { owner: 'skirmisher' },
    //       expected: `/members/gh/skirmisher`,
    //     },
    //   ],
    // ],
    // [
    //   'upgradeOrgPlan',
    //   '/gl/doggo/squirrel-locator',
    //   `/plan/gl/doggo/upgrade`,
    //   [
    //     {
    //       props: { provider: 'bb' },
    //       expected: `/plan/bb/doggo/upgrade`,
    //     },
    //     {
    //       props: { owner: 'cat' },
    //       expected: `/plan/gl/cat/upgrade`,
    //     },
    //   ],
    // ],
    // [
    //   'cancelOrgPlan',
    //   '/gl/doggo/squirrel-locator',
    //   `/plan/gl/doggo/cancel`,
    //   [
    //     {
    //       props: { provider: 'bb' },
    //       expected: `/plan/bb/doggo/cancel`,
    //     },
    //     {
    //       props: { owner: 'cat' },
    //       expected: `/plan/gl/cat/cancel`,
    //     },
    //   ],
    // ],
    // [
    //   'invoicesPage',
    //   '/gl/doggo/squirrel-locator',
    //   `/plan/gl/doggo/invoices`,
    //   [
    //     {
    //       props: { provider: 'bb' },
    //       expected: `/plan/bb/doggo/invoices`,
    //     },
    //     {
    //       props: { owner: 'cat' },
    //       expected: `/plan/gl/cat/invoices`,
    //     },
    //   ],
    // ],
    // [
    //   'invoiceDetailsPage',
    //   '/gl/doggo/squirrel-locator/9',
    //   `/plan/gl/doggo/invoices/9`,
    //   [
    //     {
    //       props: { provider: 'bb' },
    //       expected: `/plan/bb/doggo/invoices/9`,
    //     },
    //     {
    //       props: { owner: 'cat' },
    //       expected: `/plan/gl/cat/invoices/9`,
    //     },
    //   ],
    // ],
    [
      'downgradePlanPage',
      '/gl/doggo/squirrel-locator/9',
      `/plan/gl/doggo/invoices/9`,
      [
        {
          props: { provider: 'bb' },
          expected: `/plan/bb/doggo/invoices/9`,
        },
        {
          props: { owner: 'cat' },
          expected: `/plan/gl/cat/invoices/9`,
        },
      ],
    ],
  ])(`%s`, (name, location, expectedDefault, overrides) => {
    it('Returns the correct link with nothing passed', () => {
      const { result } = renderHook(() => useNavLinks(), {
        wrapper: wrapper(location),
      })
      expect(result.current[name].path()).toBe(expectedDefault)
    })
    it.each(overrides)(`can override params`, ({ props, expected }) => {
      const { result } = renderHook(() => useNavLinks(), {
        wrapper: wrapper(location),
      })

      expect(result.current[name].path(props)).toBe(expected)
    })
  })
})
describe.skip('useNavLinks', () => {
  describe('downgradePlanPage', () => {
    beforeAll(() => {
      setup(['/gl/doggo/squirrel-locator/9'])
    })

    it('Returns the correct link with nothing passed', () => {
      expect(result.current.downgradePlanPage.path()).toBe(
        `/plan/gl/doggo/cancel/downgrade`
      )
    })
    it('can override the params', () => {
      expect(result.current.downgradePlanPage.path({ provider: 'bb' })).toBe(
        `/plan/bb/doggo/cancel/downgrade`
      )
      expect(result.current.downgradePlanPage.path({ owner: 'cat' })).toBe(
        `/plan/gl/cat/cancel/downgrade`
      )
    })
  })

  describe('repo link', () => {
    beforeAll(() => {
      setup(['/gl/doggo/squirrel-locator'])
    })

    it('Returns the correct link with nothing passed', () => {
      expect(result.current.repo.path()).toBe('/gl/doggo/squirrel-locator')
    })
    it('can override the params', () => {
      expect(result.current.repo.path({ provider: 'bb' })).toBe(
        '/bb/doggo/squirrel-locator'
      )
      expect(result.current.repo.path({ owner: 'cat' })).toBe(
        '/gl/cat/squirrel-locator'
      )
      expect(result.current.repo.path({ repo: 'no-cats' })).toBe(
        '/gl/doggo/no-cats'
      )
    })
  })

  describe('account link', () => {
    beforeAll(() => {
      setup(['/gl/doggo/squirrel-locator'])
    })

    it('Returns the correct link with nothing passed', () => {
      expect(result.current.account.path()).toBe('/account/gl/doggo')
    })
    it('can override the params', () => {
      expect(result.current.account.path({ provider: 'bb' })).toBe(
        '/account/bb/doggo'
      )
      expect(result.current.account.path({ owner: 'cat' })).toBe(
        '/account/gl/cat'
      )
    })
  })

  describe('accountAdmin link', () => {
    beforeAll(() => {
      setup(['/gl/doggo/squirrel-locator'])
    })

    it('Returns the correct link with nothing passed', () => {
      expect(result.current.accountAdmin.path()).toBe('/account/gl/doggo')
    })
    it('can override the params', () => {
      expect(result.current.accountAdmin.path({ provider: 'bb' })).toBe(
        '/account/bb/doggo'
      )
      expect(result.current.accountAdmin.path({ owner: 'cat' })).toBe(
        '/account/gl/cat'
      )
    })
  })

  describe('yamlTab link', () => {
    beforeAll(() => {
      setup(['/gl/doggo/squirrel-locator'])
    })

    it('Returns the correct link with nothing passed', () => {
      expect(result.current.yamlTab.path()).toBe('/account/gl/doggo/yaml')
    })
    it('can override the params', () => {
      expect(result.current.yamlTab.path({ provider: 'bb' })).toBe(
        '/account/bb/doggo/yaml'
      )
      expect(result.current.yamlTab.path({ owner: 'cat' })).toBe(
        '/account/gl/cat/yaml'
      )
    })
  })

  describe('accessTab link', () => {
    beforeAll(() => {
      setup(['/gl/doggo/squirrel-locator'])
    })

    it('Returns the correct link with nothing passed', () => {
      expect(result.current.accessTab.path()).toBe('/account/gl/doggo/access')
    })
    it('can override the params', () => {
      expect(result.current.accessTab.path({ provider: 'bb' })).toBe(
        '/account/bb/doggo/access'
      )
      expect(result.current.accessTab.path({ owner: 'cat' })).toBe(
        '/account/gl/cat/access'
      )
    })
  })

  describe('internalAccessTab link', () => {
    beforeAll(() => {
      setup(['/gl/doggo/squirrel-locator'])
    })

    it('Returns the correct link with nothing passed', () => {
      expect(result.current.internalAccessTab.path()).toBe(
        '/account/gl/doggo/access'
      )
    })
    it('can override the params', () => {
      expect(result.current.internalAccessTab.path({ provider: 'bb' })).toBe(
        '/account/bb/doggo/access'
      )
      expect(result.current.internalAccessTab.path({ owner: 'cat' })).toBe(
        '/account/gl/cat/access'
      )
    })
  })

  describe('commits link', () => {
    beforeAll(() => {
      setup(['/gl/doggo/squirrel-locator'])
    })

    it('Returns the correct link with nothing passed', () => {
      expect(result.current.commits.path()).toBe(
        '/gl/doggo/squirrel-locator/commits'
      )
    })
    it('can override the params', () => {
      expect(result.current.commits.path({ provider: 'bb' })).toBe(
        '/bb/doggo/squirrel-locator/commits'
      )
      expect(result.current.commits.path({ owner: 'cat' })).toBe(
        '/gl/cat/squirrel-locator/commits'
      )
      expect(result.current.commits.path({ repo: 'test' })).toBe(
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
        result.current.commitFile.path({
          commit: 'abcd',
          path: 'index.js',
        })
      ).toBe('/gh/test/test-repo/commit/abcd/index.js')
    })
    it('can override the params', () => {
      expect(
        result.current.commitFile.path({
          provider: 'bb',
          commit: 'abcd',
          path: 'index.js',
        })
      ).toBe('/bb/test/test-repo/commit/abcd/index.js')
      expect(
        result.current.commitFile.path({
          owner: 'cat',
          commit: 'abcd',
          path: 'index.js',
        })
      ).toBe('/gh/cat/test-repo/commit/abcd/index.js')
      expect(
        result.current.commitFile.path({
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
      expect(result.current.treeView.path()).toBe('/gl/doggo/watch/tree/')
    })
    it('can override the params', () => {
      expect(result.current.treeView.path({ provider: 'bb' })).toBe(
        '/bb/doggo/watch/tree/'
      )
      expect(result.current.treeView.path({ owner: 'cat' })).toBe(
        '/gl/cat/watch/tree/'
      )
      expect(result.current.treeView.path({ repo: 'sleep' })).toBe(
        '/gl/doggo/sleep/tree/'
      )
    })
    it('accepts a ref option', () => {
      expect(
        result.current.treeView.path({
          ref: 'main',
        })
      ).toBe('/gl/doggo/watch/tree/main/')
    })
    it('accepts a tree option', () => {
      expect(
        result.current.treeView.path({
          tree: 'src/view/catWatch.php',
          ref: 'ref',
        })
      ).toBe('/gl/doggo/watch/tree/ref/src/view/catWatch.php')
      expect(result.current.treeView.path({ tree: 'src', ref: 'ref' })).toBe(
        '/gl/doggo/watch/tree/ref/src'
      )
      expect(
        result.current.treeView.path({
          tree: 'src/view',
          ref: 'ref',
        })
      ).toBe('/gl/doggo/watch/tree/ref/src/view')
    })
  })

  describe('fileViewer link', () => {
    beforeAll(() => {
      setup(['/gh/codecov-owner/another-test/blob/main/index.js'])
    })

    it('Returns the correct link with nothing passed', () => {
      expect(
        result.current.fileViewer.path({
          ref: 'main',
          tree: 'index.js',
        })
      ).toBe('/gh/codecov-owner/another-test/blob/main/index.js')
    })

    it('can override the params', () => {
      expect(
        result.current.fileViewer.path({
          provider: 'bb',
          ref: 'main',
          tree: 'index.js',
        })
      ).toBe('/bb/codecov-owner/another-test/blob/main/index.js')
      expect(
        result.current.fileViewer.path({
          owner: 'cat',
          ref: 'main',
          tree: 'index.js',
        })
      ).toBe('/gh/cat/another-test/blob/main/index.js')

      expect(
        result.current.fileViewer.path({
          ref: 'main',
          tree: 'flags1/mafs.js',
        })
      ).toBe('/gh/codecov-owner/another-test/blob/main/flags1/mafs.js')

      expect(
        result.current.fileViewer.path({
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
      expect(result.current.commitTreeView.path({ commit: 'sha256' })).toBe(
        '/gl/doggo/watch/commit/sha256/tree'
      )
    })

    it('can override the params', () => {
      expect(
        result.current.commitTreeView.path({
          provider: 'bb',
          commit: 'sha256',
        })
      ).toBe('/bb/doggo/watch/commit/sha256/tree')
      expect(
        result.current.commitTreeView.path({
          owner: 'cat',
          commit: 'sha256',
        })
      ).toBe('/gl/cat/watch/commit/sha256/tree')
      expect(
        result.current.commitTreeView.path({
          repo: 'sleep',
          commit: 'sha256',
        })
      ).toBe('/gl/doggo/sleep/commit/sha256/tree')
    })

    it('accepts a commit option', () => {
      expect(
        result.current.commitTreeView.path({
          commit: 'sha256',
        })
      ).toBe('/gl/doggo/watch/commit/sha256/tree')
    })

    it('accepts a tree option', () => {
      expect(
        result.current.commitTreeView.path({
          tree: 'src/view/catWatch.php',
          commit: 'sha128',
        })
      ).toBe('/gl/doggo/watch/commit/sha128/tree/src/view/catWatch.php')

      expect(
        result.current.commitTreeView.path({
          tree: 'src',
          commit: 'sha128',
        })
      ).toBe('/gl/doggo/watch/commit/sha128/tree/src')

      expect(
        result.current.commitTreeView.path({
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
        result.current.commitFileDiff.path({
          commit: 'sha256',
          tree: 'index.js',
        })
      ).toBe('/gh/codecov-owner/another-test/commit/sha256/blob/index.js')
    })

    it('can override the params', () => {
      expect(
        result.current.commitFileDiff.path({
          provider: 'bb',
          commit: 'sha256',
          tree: 'index.js',
        })
      ).toBe('/bb/codecov-owner/another-test/commit/sha256/blob/index.js')

      expect(
        result.current.commitFileDiff.path({
          owner: 'cat',
          commit: 'sha256',
          tree: 'index.js',
        })
      ).toBe('/gh/cat/another-test/commit/sha256/blob/index.js')

      expect(
        result.current.commitFileDiff.path({
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
      expect(result.current.overview.path()).toBe('/gh/RulaKhaled/test')
    })
    it('can override the params', () => {
      expect(result.current.overview.path({ provider: 'bb' })).toBe(
        '/bb/RulaKhaled/test'
      )
      expect(result.current.overview.path({ owner: 'cat' })).toBe(
        '/gh/cat/test'
      )
    })
  })

  describe('repo flags tab link', () => {
    beforeAll(() => {
      setup(['/gh/codecov/gazebo/flags'])
    })

    it('Returns the correct link with nothing passed', () => {
      expect(result.current.flagsTab.path()).toBe('/gh/codecov/gazebo/flags')
    })
    it('can override the params', () => {
      expect(result.current.flagsTab.path({ provider: 'bb' })).toBe(
        '/bb/codecov/gazebo/flags'
      )
      expect(result.current.flagsTab.path({ owner: 'cat' })).toBe(
        '/gh/cat/gazebo/flags'
      )
    })
  })

  describe('repo branches link', () => {
    beforeAll(() => {
      setup(['/gh/RulaKhaled/test/branches'])
    })

    it('Returns the correct link with nothing passed', () => {
      expect(result.current.branches.path()).toBe(
        '/gh/RulaKhaled/test/branches'
      )
    })
    it('can override the params', () => {
      expect(result.current.branches.path({ provider: 'bb' })).toBe(
        '/bb/RulaKhaled/test/branches'
      )
      expect(result.current.branches.path({ owner: 'cat' })).toBe(
        '/gh/cat/test/branches'
      )
    })
  })

  describe('repo pulls link', () => {
    beforeAll(() => {
      setup(['/gh/RulaKhaled/test/pulls'])
    })

    it('Returns the correct link with nothing passed', () => {
      expect(result.current.pulls.path()).toBe('/gh/RulaKhaled/test/pulls')
    })
    it('can override the params', () => {
      expect(result.current.pulls.path({ provider: 'bb' })).toBe(
        '/bb/RulaKhaled/test/pulls'
      )
      expect(result.current.pulls.path({ repo: 'cat' })).toBe(
        '/gh/RulaKhaled/cat/pulls'
      )
    })
  })

  describe('repo settings link', () => {
    beforeAll(() => {
      setup(['/gh/RulaKhaled/test/settings'])
    })

    it('Returns the correct link with nothing passed', () => {
      expect(result.current.settings.path()).toBe(
        '/gh/RulaKhaled/test/settings'
      )
    })
    it('can override the params', () => {
      expect(result.current.settings.path({ provider: 'bb' })).toBe(
        '/bb/RulaKhaled/test/settings'
      )
      expect(result.current.settings.path({ repo: 'cat' })).toBe(
        '/gh/RulaKhaled/cat/settings'
      )
    })
  })

  describe('repo new link', () => {
    beforeAll(() => {
      setup(['/gh/RulaKhaled/test/new'])
    })

    it('Returns the correct link with nothing passed', () => {
      expect(result.current.new.path()).toBe('/gh/RulaKhaled/test/new')
    })
    it('can override the params', () => {
      expect(result.current.new.path({ provider: 'bb' })).toBe(
        '/bb/RulaKhaled/test/new'
      )
      expect(result.current.new.path({ repo: 'cat' })).toBe(
        '/gh/RulaKhaled/cat/new'
      )
    })
  })

  describe('repo new other link', () => {
    beforeAll(() => {
      setup(['/gh/RulaKhaled/test/new/other'])
    })

    it('Returns the correct link with nothing passed', () => {
      expect(result.current.newOtherCI.path()).toBe(
        '/gh/RulaKhaled/test/new/other-ci'
      )
    })
    it('can override the params', () => {
      expect(result.current.newOtherCI.path({ provider: 'bb' })).toBe(
        '/bb/RulaKhaled/test/new/other-ci'
      )
      expect(result.current.newOtherCI.path({ repo: 'cat' })).toBe(
        '/gh/RulaKhaled/cat/new/other-ci'
      )
    })
  })

  describe('general repo settings link', () => {
    beforeAll(() => {
      setup(['/gh/RulaKhaled/test/settings'])
    })

    it('Returns the correct link with nothing passed', () => {
      expect(result.current.settingsGeneral.path()).toBe(
        '/gh/RulaKhaled/test/settings'
      )
    })
    it('can override the params', () => {
      expect(result.current.settingsGeneral.path({ provider: 'bb' })).toBe(
        '/bb/RulaKhaled/test/settings'
      )
      expect(result.current.settingsGeneral.path({ repo: 'cat' })).toBe(
        '/gh/RulaKhaled/cat/settings'
      )
    })
  })

  describe('repo yaml link', () => {
    beforeAll(() => {
      setup(['/gh/RulaKhaled/test/settings/yaml'])
    })

    it('Returns the correct link with nothing passed', () => {
      expect(result.current.settingsYaml.path()).toBe(
        '/gh/RulaKhaled/test/settings/yaml'
      )
    })
    it('can override the params', () => {
      expect(result.current.settingsYaml.path({ provider: 'bb' })).toBe(
        '/bb/RulaKhaled/test/settings/yaml'
      )
      expect(result.current.settingsYaml.path({ repo: 'cat' })).toBe(
        '/gh/RulaKhaled/cat/settings/yaml'
      )
    })
  })

  describe('badge repo settings link', () => {
    beforeAll(() => {
      setup(['/gh/RulaKhaled/test/settings/badge'])
    })

    it('Returns the correct link with nothing passed', () => {
      expect(result.current.settingsBadge.path()).toBe(
        '/gh/RulaKhaled/test/settings/badge'
      )
    })
    it('can override the params', () => {
      expect(result.current.settingsBadge.path({ provider: 'bb' })).toBe(
        '/bb/RulaKhaled/test/settings/badge'
      )
      expect(result.current.settingsBadge.path({ repo: 'cat' })).toBe(
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
      expect(result.current.signUp.path({ pathname: 'random/path/name' })).toBe(
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
      expect(result.current.pullDetail.path()).toBe(
        `/gl/doggo/squirrel-locator/pull/409`
      )
    })
    it('can override the params', () => {
      expect(result.current.pullDetail.path({ provider: 'bb' })).toBe(
        `/bb/doggo/squirrel-locator/pull/409`
      )
      expect(result.current.pullDetail.path({ owner: 'cat' })).toBe(
        `/gl/cat/squirrel-locator/pull/409`
      )
      expect(result.current.pullDetail.path({ repo: 'tennis-ball' })).toBe(
        `/gl/doggo/tennis-ball/pull/409`
      )
      expect(result.current.pullDetail.path({ pullId: 888 })).toBe(
        `/gl/doggo/squirrel-locator/pull/888`
      )
    })
  })

  describe('pull commits', () => {
    beforeAll(() => {
      setup(['/gl/doggo/squirrel-locator/pull/409/commits'])
    })

    it('Returns the correct link with nothing passed', () => {
      expect(result.current.pullCommits.path()).toBe(
        `/gl/doggo/squirrel-locator/pull/409/commits`
      )
    })
    it('can override the params', () => {
      expect(result.current.pullCommits.path({ provider: 'bb' })).toBe(
        `/bb/doggo/squirrel-locator/pull/409/commits`
      )
      expect(result.current.pullCommits.path({ owner: 'cat' })).toBe(
        `/gl/cat/squirrel-locator/pull/409/commits`
      )
      expect(result.current.pullCommits.path({ repo: 'tennis-ball' })).toBe(
        `/gl/doggo/tennis-ball/pull/409/commits`
      )
      expect(result.current.pullCommits.path({ pullId: 888 })).toBe(
        `/gl/doggo/squirrel-locator/pull/888/commits`
      )
    })
  })

  describe('pull flags', () => {
    beforeAll(() => {
      setup(['/gl/doggo/squirrel-locator/pull/409/flags'])
    })

    it('Returns the correct link with nothing passed', () => {
      expect(result.current.pullFlags.path()).toBe(
        `/gl/doggo/squirrel-locator/pull/409/flags`
      )
    })
    it('can override the params', () => {
      expect(result.current.pullFlags.path({ provider: 'bb' })).toBe(
        `/bb/doggo/squirrel-locator/pull/409/flags`
      )
      expect(result.current.pullFlags.path({ owner: 'cat' })).toBe(
        `/gl/cat/squirrel-locator/pull/409/flags`
      )
      expect(result.current.pullFlags.path({ repo: 'tennis-ball' })).toBe(
        `/gl/doggo/tennis-ball/pull/409/flags`
      )
      expect(result.current.pullFlags.path({ pullId: 888 })).toBe(
        `/gl/doggo/squirrel-locator/pull/888/flags`
      )
    })
  })

  describe('pull components', () => {
    beforeAll(() => {
      setup(['/gl/doggo/squirrel-locator/pull/409/components'])
    })

    it('Returns the correct link with nothing passed', () => {
      expect(result.current.pullComponents.path()).toBe(
        `/gl/doggo/squirrel-locator/pull/409/components`
      )
    })
    it('can override the params', () => {
      expect(result.current.pullComponents.path({ provider: 'bb' })).toBe(
        `/bb/doggo/squirrel-locator/pull/409/components`
      )
      expect(result.current.pullComponents.path({ owner: 'cat' })).toBe(
        `/gl/cat/squirrel-locator/pull/409/components`
      )
      expect(result.current.pullComponents.path({ repo: 'tennis-ball' })).toBe(
        `/gl/doggo/tennis-ball/pull/409/components`
      )
      expect(result.current.pullComponents.path({ pullId: 888 })).toBe(
        `/gl/doggo/squirrel-locator/pull/888/components`
      )
    })
  })

  describe('pull indirect changes', () => {
    beforeAll(() => {
      setup(['/gl/doggo/squirrel-locator/pull/409/indirect-changes'])
    })

    it('Returns the correct link with nothing passed', () => {
      expect(result.current.pullIndirectChanges.path()).toBe(
        `/gl/doggo/squirrel-locator/pull/409/indirect-changes`
      )
    })
    it('can override the params', () => {
      expect(result.current.pullIndirectChanges.path({ provider: 'bb' })).toBe(
        `/bb/doggo/squirrel-locator/pull/409/indirect-changes`
      )
      expect(result.current.pullIndirectChanges.path({ owner: 'cat' })).toBe(
        `/gl/cat/squirrel-locator/pull/409/indirect-changes`
      )
      expect(
        result.current.pullIndirectChanges.path({
          repo: 'tennis-ball',
        })
      ).toBe(`/gl/doggo/tennis-ball/pull/409/indirect-changes`)
      expect(result.current.pullIndirectChanges.path({ pullId: 888 })).toBe(
        `/gl/doggo/squirrel-locator/pull/888/indirect-changes`
      )
    })
  })

  describe('commit indirect changes', () => {
    beforeAll(() => {
      setup(['/gl/doggo/squirrel-locator'])
    })

    it('Returns the correct link with nothing passed', () => {
      expect(result.current.commitIndirectChanges.path({ commit: 409 })).toBe(
        `/gl/doggo/squirrel-locator/commit/409/indirect-changes`
      )
    })
    it('can override the params', () => {
      expect(
        result.current.commitIndirectChanges.path({
          provider: 'bb',
          commit: 409,
        })
      ).toBe(`/bb/doggo/squirrel-locator/commit/409/indirect-changes`)
      expect(
        result.current.commitIndirectChanges.path({
          owner: 'cat',
          commit: 409,
        })
      ).toBe(`/gl/cat/squirrel-locator/commit/409/indirect-changes`)
      expect(
        result.current.commitIndirectChanges.path({
          repo: 'tennis-ball',
          commit: 409,
        })
      ).toBe(`/gl/doggo/tennis-ball/commit/409/indirect-changes`)
      expect(result.current.commitIndirectChanges.path({ commit: 888 })).toBe(
        `/gl/doggo/squirrel-locator/commit/888/indirect-changes`
      )
    })
  })

  describe('feedback', () => {
    describe('ref provided', () => {
      beforeAll(() => {
        setup(['/gh/codecov/codecov-demo'])
      })

      it('returns the correct url', () => {
        expect(
          result.current.feedback.path({
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
        expect(result.current.feedback.path()).toBe('/gh/feedback')
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
          result.current.prevLink.path({
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
        expect(result.current.prevLink.path()).toBe('/gh')
      })
    })
  })

  describe('access', () => {
    describe('testing all orgs and repos', () => {
      beforeAll(() => {
        setup(['/admin/gh/access'])
      })

      it('returns the correct url', () => {
        expect(result.current.access.path()).toBe('/admin/gh/access')
      })

      it('returns the correct url provided provider', () => {
        expect(result.current.access.path({ provider: 'gl' })).toBe(
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
        expect(result.current.users.path()).toBe('/admin/gh/users')
      })

      it('returns the correct url provided provider', () => {
        expect(result.current.users.path({ provider: 'gl' })).toBe(
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
      expect(result.current.orgUploadToken.path()).toBe(
        '/account/gh/codecov/org-upload-token'
      )
    })
    it('can override the params', () => {
      expect(result.current.orgUploadToken.path({ provider: 'bb' })).toBe(
        '/account/bb/codecov/org-upload-token'
      )
      expect(result.current.orgUploadToken.path({ owner: 'cat' })).toBe(
        '/account/gh/cat/org-upload-token'
      )
    })
  })

  describe('github repo secrets', () => {
    beforeAll(() => {
      setup(['/gh/codecov/cool-repo'])
    })

    it('Returns the correct link with nothing passed', () => {
      expect(result.current.githubRepoSecrets.path()).toBe(
        'https://github.com/codecov/cool-repo/settings/secrets/actions'
      )
    })
    it('can override the params', () => {
      expect(result.current.githubRepoSecrets.path({ repo: 'test-repo' })).toBe(
        'https://github.com/codecov/test-repo/settings/secrets/actions'
      )
      expect(result.current.githubRepoSecrets.path({ owner: 'cat' })).toBe(
        'https://github.com/cat/cool-repo/settings/secrets/actions'
      )
    })
  })

  describe('github repo actions', () => {
    beforeAll(() => {
      setup(['/gh/codecov/cool-repo'])
    })

    it('Returns the correct link with nothing passed', () => {
      expect(result.current.githubRepoActions.path()).toBe(
        'https://github.com/codecov/cool-repo/actions'
      )
    })
    it('can override the params', () => {
      expect(result.current.githubRepoActions.path({ repo: 'test-repo' })).toBe(
        'https://github.com/codecov/test-repo/actions'
      )
      expect(result.current.githubRepoActions.path({ owner: 'cat' })).toBe(
        'https://github.com/cat/cool-repo/actions'
      )
    })
  })
})
