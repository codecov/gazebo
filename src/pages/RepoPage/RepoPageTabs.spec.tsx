import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  render,
  renderHook,
  screen,
  waitFor,
  waitForElementToBeRemoved,
} from '@testing-library/react'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { Suspense } from 'react'
import { MemoryRouter, Route } from 'react-router-dom'

import { TierNames, TTierNames } from 'services/tier'
import { useFlags } from 'shared/featureFlags'

import RepoPageTabs, { useRepoTabs } from './RepoPageTabs'

jest.mock('shared/featureFlags')
const mockedUseFlags = useFlags as jest.Mock<{
  componentTab?: boolean
}>

const mockRepoOverview = ({
  language = '',
  isRepoPrivate = false,
  coverageEnabled = false,
  bundleAnalysisEnabled = false,
  testAnalyticsEnabled = false,
}) => {
  let languages = null
  if (language !== '') {
    languages = [language]
  }

  return {
    owner: {
      isCurrentUserActivated: true,
      repository: {
        __typename: 'Repository',
        private: isRepoPrivate,
        defaultBranch: 'main',
        oldestCommitAt: '2022-10-10T11:59:59',
        coverageEnabled,
        bundleAnalysisEnabled,
        languages,
        testAnalyticsEnabled,
      },
    },
  }
}

const mockRepo = ({ isCurrentUserPartOfOrg = true }) => ({
  owner: {
    isAdmin: true,
    isCurrentUserPartOfOrg,
    isCurrentUserActivated: true,
    repository: {
      __typename: 'Repository',
      private: false,
      uploadToken: null,
      defaultBranch: 'main',
      yaml: null,
      activated: true,
      oldestCommitAt: '2022-10-10T11:59:59',
      active: true,
      isFirstPullRequest: false,
    },
  },
})

const server = setupServer()
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      suspense: true,
    },
  },
})

const wrapper =
  (
    initialEntries = '/gh/codecov/cool-repo'
  ): React.FC<React.PropsWithChildren> =>
  ({ children }) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialEntries]}>
        <Route
          path={[
            '/:provider/:owner/:repo/blob/:ref/:path+',
            '/:provider/:owner/:repo/commits',
            '/:provider/:owner/:repo/compare',
            '/:provider/:owner/:repo/flags/:branch',
            '/:provider/:owner/:repo/flags',
            '/:provider/:owner/:repo/components/:branch',
            '/:provider/:owner/:repo/components',
            '/:provider/:owner/:repo/new',
            '/:provider/:owner/:repo/pulls',
            '/:provider/:owner/:repo/config',
            '/:provider/:owner/:repo/tree/:branch',
            '/:provider/:owner/:repo/tree/:branch/:path+',
            '/:provider/:owner/:repo',
          ]}
        >
          <Suspense fallback={<p>Loading</p>}>{children}</Suspense>
        </Route>
      </MemoryRouter>
    </QueryClientProvider>
  )

beforeAll(() => {
  server.listen()
})

afterEach(() => {
  queryClient.clear()
  server.resetHandlers()
})

afterAll(() => {
  server.close()
})

interface SetupArgs {
  language?: string
  isRepoPrivate?: boolean
  coverageEnabled?: boolean
  bundleAnalysisEnabled?: boolean
  tierName?: TTierNames
  isCurrentUserPartOfOrg?: boolean
  componentTab?: boolean
  testAnalyticsEnabled?: boolean
}

describe('RepoPageTabs', () => {
  function setup({
    language,
    bundleAnalysisEnabled,
    coverageEnabled,
    isRepoPrivate,
    tierName = TierNames.PRO,
    isCurrentUserPartOfOrg = true,
    componentTab = true,
    testAnalyticsEnabled = false,
  }: SetupArgs) {
    mockedUseFlags.mockReturnValue({
      componentTab,
    })

    server.use(
      graphql.query('GetRepoOverview', (req, res, ctx) => {
        return res(
          ctx.status(200),
          ctx.data(
            mockRepoOverview({
              language,
              isRepoPrivate,
              coverageEnabled,
              bundleAnalysisEnabled,
              testAnalyticsEnabled,
            })
          )
        )
      }),
      graphql.query('OwnerTier', (req, res, ctx) => {
        return res(ctx.status(200), ctx.data({ owner: { plan: { tierName } } }))
      }),
      graphql.query('GetRepo', (req, res, ctx) => {
        return res(
          ctx.status(200),
          ctx.data(mockRepo({ isCurrentUserPartOfOrg }))
        )
      })
    )
  }

  describe('coverage tab', () => {
    describe('when coverage is enabled', () => {
      it('renders the coverage tab', async () => {
        setup({
          isCurrentUserPartOfOrg: false,
          coverageEnabled: true,
        })
        render(<RepoPageTabs refetchEnabled={false} />, { wrapper: wrapper() })

        const tab = await screen.findByText('Coverage')
        expect(tab).toBeInTheDocument()
        expect(tab).toHaveAttribute('aria-current', 'page')
        expect(tab).toHaveAttribute('href', '/gh/codecov/cool-repo')
      })
    })

    describe('when user belongs to the org', () => {
      it('renders the coverage tab', async () => {
        setup({
          isCurrentUserPartOfOrg: true,
          coverageEnabled: false,
        })
        render(<RepoPageTabs refetchEnabled={false} />, { wrapper: wrapper() })

        const tab = await screen.findByText('Coverage')
        expect(tab).toBeInTheDocument()
        expect(tab).toHaveAttribute('aria-current', 'page')
        expect(tab).toHaveAttribute('href', '/gh/codecov/cool-repo')
      })
    })

    describe('user does not belong to org, and coverage is disabled', () => {
      it('does not render coverage tab', async () => {
        setup({
          isCurrentUserPartOfOrg: false,
          coverageEnabled: false,
        })
        render(<RepoPageTabs refetchEnabled={false} />, { wrapper: wrapper() })

        const loading = await screen.findByText('Loading')
        await waitForElementToBeRemoved(loading)

        const tab = screen.queryByText('Coverage')
        expect(tab).not.toBeInTheDocument()
      })
    })
  })

  describe('bundles tab', () => {
    describe('bundle analysis is enabled', () => {
      it('renders bundles tab', async () => {
        setup({ bundleAnalysisEnabled: true })
        render(<RepoPageTabs refetchEnabled={false} />, {
          wrapper: wrapper('/gh/codecov/test-repo/bundles'),
        })

        const tab = await screen.findByText('Bundles')
        expect(tab).toBeInTheDocument()
        expect(tab).toHaveAttribute('aria-current', 'page')
        expect(tab).toHaveAttribute('href', '/gh/codecov/test-repo/bundles')
      })
    })

    describe('js or ts is present and user belongs to the org', () => {
      it('renders the bundles tab', async () => {
        setup({ language: 'javascript', isCurrentUserPartOfOrg: true })
        render(<RepoPageTabs refetchEnabled={false} />, {
          wrapper: wrapper('/gh/codecov/test-repo/bundles'),
        })

        const tab = await screen.findByText('Bundles')
        expect(tab).toBeInTheDocument()
        expect(tab).toHaveAttribute('aria-current', 'page')
        expect(tab).toHaveAttribute('href', '/gh/codecov/test-repo/bundles')
      })
    })

    describe('user does not belong to the org', () => {
      it('does not render the bundles tab', async () => {
        setup({ language: 'javascript', isCurrentUserPartOfOrg: false })
        render(<RepoPageTabs refetchEnabled={false} />, {
          wrapper: wrapper('/gh/codecov/test-repo/bundles'),
        })

        const loader = await screen.findByText('Loading')
        await waitForElementToBeRemoved(loader)

        const tab = screen.queryByText('Bundles')
        expect(tab).not.toBeInTheDocument()
      })
    })
  })

  describe('commits tab', () => {
    describe('coverage is enabled', () => {
      it('renders the commits tab', async () => {
        setup({ coverageEnabled: true })
        render(<RepoPageTabs refetchEnabled={false} />, {
          wrapper: wrapper('/gh/codecov/test-repo/commits'),
        })

        const tab = await screen.findByText('Commits')
        expect(tab).toBeInTheDocument()
        expect(tab).toHaveAttribute('aria-current', 'page')
        expect(tab).toHaveAttribute('href', '/gh/codecov/test-repo/commits')
      })
    })

    describe('bundle analysis is enabled', () => {
      it('renders the commits tab', async () => {
        setup({ bundleAnalysisEnabled: true })
        render(<RepoPageTabs refetchEnabled={false} />, {
          wrapper: wrapper('/gh/codecov/test-repo/commits'),
        })

        const tab = await screen.findByText('Commits')
        expect(tab).toBeInTheDocument()
        expect(tab).toHaveAttribute('aria-current', 'page')
        expect(tab).toHaveAttribute('href', '/gh/codecov/test-repo/commits')
      })
    })

    describe('nothing is enabled', () => {
      it('does not render the commits tab', async () => {
        setup({ bundleAnalysisEnabled: false, coverageEnabled: false })
        render(<RepoPageTabs refetchEnabled={false} />, {
          wrapper: wrapper('/gh/codecov/test-repo/commits'),
        })

        const loader = await screen.findByText('Loading')
        await waitForElementToBeRemoved(loader)

        const tab = screen.queryByText('Commits')
        expect(tab).not.toBeInTheDocument()
      })
    })
  })

  describe('pulls tab', () => {
    describe('coverage enabled', () => {
      it('renders the pulls tab', async () => {
        setup({ coverageEnabled: true })
        render(<RepoPageTabs refetchEnabled={false} />, {
          wrapper: wrapper('/gh/codecov/test-repo/pulls'),
        })

        const tab = await screen.findByText('Pulls')
        expect(tab).toBeInTheDocument()
        expect(tab).toHaveAttribute('aria-current', 'page')
        expect(tab).toHaveAttribute('href', '/gh/codecov/test-repo/pulls')
      })
    })

    describe('bundle analysis enabled', () => {
      it('renders the pulls tab', async () => {
        setup({ bundleAnalysisEnabled: true })
        render(<RepoPageTabs refetchEnabled={false} />, {
          wrapper: wrapper('/gh/codecov/test-repo/pulls'),
        })

        const tab = await screen.findByText('Pulls')
        expect(tab).toBeInTheDocument()
        expect(tab).toHaveAttribute('aria-current', 'page')
        expect(tab).toHaveAttribute('href', '/gh/codecov/test-repo/pulls')
      })
    })

    describe('nothing is enabled', () => {
      it('does not render the pulls tab', async () => {
        setup({ bundleAnalysisEnabled: false, coverageEnabled: false })
        render(<RepoPageTabs refetchEnabled={false} />, {
          wrapper: wrapper('/gh/codecov/test-repo/pulls'),
        })

        const loader = await screen.findByText('Loading')
        await waitForElementToBeRemoved(loader)

        const tab = screen.queryByText('Pulls')
        expect(tab).not.toBeInTheDocument()
      })
    })
  })

  describe('configuration tab', () => {
    describe('user is part of the org', () => {
      it('renders the configuration tab', async () => {
        setup({})
        render(<RepoPageTabs refetchEnabled={false} />, {
          wrapper: wrapper('/gh/codecov/test-repo/config'),
        })

        const tab = await screen.findByText('Configuration')
        expect(tab).toBeInTheDocument()
        expect(tab).toHaveAttribute('aria-current', 'page')
        expect(tab).toHaveAttribute('href', '/gh/codecov/test-repo/config')
      })
    })

    describe('user is not part of the org', () => {
      it('does not render the configuration tab', async () => {
        setup({ isCurrentUserPartOfOrg: false })
        render(<RepoPageTabs refetchEnabled={false} />, {
          wrapper: wrapper('/gh/codecov/test-repo/config'),
        })

        const loader = await screen.findByText('Loading')
        await waitForElementToBeRemoved(loader)

        const tab = screen.queryByText('Configuration')
        expect(tab).not.toBeInTheDocument()
      })
    })
  })

  describe('Failed tests tab', () => {
    it('renders the failed tests onboarding when test analytics is not enabled', async () => {
      setup({
        coverageEnabled: false,
        testAnalyticsEnabled: false,
      })
      render(<RepoPageTabs refetchEnabled={false} />, {
        wrapper: wrapper('/gh/codecov/test-repo/tests/new'),
      })

      const tab = await screen.findByText('Tests')
      expect(tab).toBeInTheDocument()
      expect(tab).toHaveAttribute('aria-current', 'page')
      expect(tab).toHaveAttribute('href', '/gh/codecov/test-repo/tests/new')
    })

    it('renders the failed tests page when test analytics enabled', async () => {
      setup({
        coverageEnabled: false,
        testAnalyticsEnabled: true,
      })
      render(<RepoPageTabs refetchEnabled={false} />, {
        wrapper: wrapper('/gh/codecov/test-repo/tests'),
      })

      const tab = await screen.findByText('Tests')
      expect(tab).toBeInTheDocument()
      expect(tab).toHaveAttribute('aria-current', 'page')
      expect(tab).toHaveAttribute('href', '/gh/codecov/test-repo/tests')
    })

    it('renders beta badge', async () => {
      setup({
        coverageEnabled: false,
      })
      render(<RepoPageTabs refetchEnabled={false} />, {
        wrapper: wrapper('/gh/codecov/test-repo/tests/new'),
      })

      const betaBadge = await screen.findByText('beta')
      expect(betaBadge).toBeInTheDocument()
    })
  })

  it('does not render the tab when isCurrentUserPartOfOrg is set to false', async () => {
    setup({
      isCurrentUserPartOfOrg: false,
    })

    render(<RepoPageTabs refetchEnabled={false} />, {
      wrapper: wrapper('/gh/codecov/test-repo/tests/new'),
    })

    const loading = await screen.findByText('Loading')
    await waitForElementToBeRemoved(loading)

    const tab = screen.queryByText('Tests')
    expect(tab).not.toBeInTheDocument()
  })
})

describe('useRepoTabs', () => {
  function setup({
    language,
    bundleAnalysisEnabled,
    coverageEnabled,
    testAnalyticsEnabled = false,
    isRepoPrivate,
    tierName = TierNames.PRO,
    isCurrentUserPartOfOrg = true,
  }: SetupArgs) {
    mockedUseFlags.mockReturnValue({
      componentTab: true,
    })

    server.use(
      graphql.query('GetRepoOverview', (req, res, ctx) => {
        return res(
          ctx.status(200),
          ctx.data(
            mockRepoOverview({
              language,
              isRepoPrivate,
              coverageEnabled,
              bundleAnalysisEnabled,
              testAnalyticsEnabled,
            })
          )
        )
      }),
      graphql.query('OwnerTier', (req, res, ctx) => {
        return res(ctx.status(200), ctx.data({ owner: { plan: { tierName } } }))
      }),
      graphql.query('GetRepo', (req, res, ctx) => {
        return res(
          ctx.status(200),
          ctx.data(mockRepo({ isCurrentUserPartOfOrg }))
        )
      })
    )
  }

  describe('coverage tab', () => {
    describe('when no matches are made', () => {
      it('returns the correct tab definition', async () => {
        setup({})
        const { result } = renderHook(
          () =>
            useRepoTabs({
              refetchEnabled: false,
            }),
          { wrapper: wrapper() }
        )

        const expectedTab = [
          {
            children: 'Coverage',
            exact: true,
            location: undefined,
            pageName: 'overview',
          },
        ]
        await waitFor(() =>
          expect(result.current).toEqual(expect.arrayContaining(expectedTab))
        )
      })
    })

    describe('when match tree is true', () => {
      it('returns the correct tab definition', async () => {
        setup({})
        const { result } = renderHook(
          () =>
            useRepoTabs({
              refetchEnabled: false,
            }),
          {
            wrapper: wrapper(
              '/gh/codecov/test-repo/tree/selected%2fbranch/src'
            ),
          }
        )

        const expectedTab = [
          {
            children: 'Coverage',
            exact: false,
            location: {
              pathname: '/gh/codecov/test-repo/tree/selected%2fbranch',
            },
            pageName: 'overview',
          },
        ]
        await waitFor(() =>
          expect(result.current).toEqual(expect.arrayContaining(expectedTab))
        )
      })
      it('returns the correct tab definition when All branch is selected', async () => {
        setup({})
        const { result } = renderHook(
          () =>
            useRepoTabs({
              refetchEnabled: false,
            }),
          { wrapper: wrapper('/gh/codecov/test-repo/tree/All%20branches') }
        )

        const expectedTab = [
          {
            children: 'Coverage',
            exact: false,
            location: {
              pathname: '/gh/codecov/test-repo',
            },
            pageName: 'overview',
          },
        ]
        await waitFor(() =>
          expect(result.current).toEqual(expect.arrayContaining(expectedTab))
        )
      })
    })

    describe('when match blobs is true', () => {
      it('returns the correct tab definition', async () => {
        setup({})
        const { result } = renderHook(
          () =>
            useRepoTabs({
              refetchEnabled: false,
            }),
          { wrapper: wrapper('/gh/codecov/test-repo/blob/main/src/file.js') }
        )

        const expectedTab = [
          {
            children: 'Coverage',
            exact: false,
            location: {
              pathname: '/gh/codecov/test-repo/blob',
            },
            pageName: 'overview',
          },
        ]
        await waitFor(() =>
          expect(result.current).toEqual(expect.arrayContaining(expectedTab))
        )
      })
    })

    describe('when match coverage onboarding is true', () => {
      it('returns the correct tab definition', async () => {
        setup({})
        const { result } = renderHook(
          () =>
            useRepoTabs({
              refetchEnabled: false,
            }),
          { wrapper: wrapper('/gh/codecov/test-repo/new') }
        )

        const expectedTab = [
          {
            children: 'Coverage',
            exact: false,
            pageName: 'overview',
          },
        ]
        await waitFor(() =>
          expect(result.current).toEqual(expect.arrayContaining(expectedTab))
        )
      })
    })

    describe('when match flags is true', () => {
      it('returns the correct tab definition when no branch selected', async () => {
        setup({})
        const { result } = renderHook(
          () =>
            useRepoTabs({
              refetchEnabled: false,
            }),
          { wrapper: wrapper('/gh/codecov/test-repo/flags') }
        )

        const expectedTab = [
          {
            children: 'Coverage',
            exact: false,
            location: {
              pathname: '/gh/codecov/test-repo',
            },
            pageName: 'overview',
          },
        ]
        await waitFor(() =>
          expect(result.current).toEqual(expect.arrayContaining(expectedTab))
        )
      })
      it('returns the correct tab definition when branch is selected', async () => {
        setup({})
        const { result } = renderHook(
          () =>
            useRepoTabs({
              refetchEnabled: false,
            }),
          { wrapper: wrapper('/gh/codecov/test-repo/flags/selected%2fbranch') }
        )

        const expectedTab = [
          {
            children: 'Coverage',
            exact: false,
            location: {
              pathname: '/gh/codecov/test-repo/tree/selected%2fbranch',
            },
            pageName: 'overview',
          },
        ]
        await waitFor(() =>
          expect(result.current).toEqual(expect.arrayContaining(expectedTab))
        )
      })
    })

    describe('when match components is true', () => {
      it('returns the correct tab definition when no branch selected', async () => {
        setup({})
        const { result } = renderHook(
          () =>
            useRepoTabs({
              refetchEnabled: false,
            }),
          { wrapper: wrapper('/gh/codecov/test-repo/components') }
        )

        const expectedTab = [
          {
            children: 'Coverage',
            exact: false,
            location: {
              pathname: '/gh/codecov/test-repo',
            },
            pageName: 'overview',
          },
        ]
        await waitFor(() =>
          expect(result.current).toEqual(expect.arrayContaining(expectedTab))
        )
      })
      it('returns the correct tab definition when branch is selected', async () => {
        setup({})
        const { result } = renderHook(
          () =>
            useRepoTabs({
              refetchEnabled: false,
            }),
          {
            wrapper: wrapper(
              '/gh/codecov/test-repo/components/selected%2fbranch'
            ),
          }
        )

        const expectedTab = [
          {
            children: 'Coverage',
            exact: false,
            location: {
              pathname: '/gh/codecov/test-repo/tree/selected%2fbranch',
            },
            pageName: 'overview',
          },
        ]
        await waitFor(() =>
          expect(result.current).toEqual(expect.arrayContaining(expectedTab))
        )
      })
    })
  })

  describe('bundles tab', () => {
    describe('js is present in the language array', () => {
      it('adds the bundle link to the array', async () => {
        setup({ language: 'javascript' })
        const { result } = renderHook(
          () =>
            useRepoTabs({
              refetchEnabled: false,
            }),
          { wrapper: wrapper('/gh/codecov/test-repo') }
        )

        const expectedTab = [
          expect.objectContaining({
            pageName: 'bundles',
          }),
        ]
        await waitFor(() =>
          expect(result.current).toEqual(expect.arrayContaining(expectedTab))
        )
      })
    })

    describe('ts is present in the language array', () => {
      it('adds the bundle link to the array', async () => {
        setup({ language: 'typescript' })
        const { result } = renderHook(
          () =>
            useRepoTabs({
              refetchEnabled: false,
            }),
          { wrapper: wrapper('/gh/codecov/test-repo') }
        )

        const expectedTab = [
          expect.objectContaining({
            pageName: 'bundles',
          }),
        ]
        await waitFor(() =>
          expect(result.current).toEqual(expect.arrayContaining(expectedTab))
        )
      })
    })

    describe('js and ts are not present in the language array', () => {
      it('does not add the bundle link to the array', async () => {
        setup({ language: 'python' })
        const { result } = renderHook(
          () =>
            useRepoTabs({
              refetchEnabled: false,
            }),
          { wrapper: wrapper('/gh/codecov/test-repo') }
        )

        await waitForElementToBeRemoved(await screen.findByText('Loading'))

        const expectedTab = [
          expect.objectContaining({
            pageName: 'bundles',
          }),
        ]
        await waitFor(() =>
          expect(result.current).not.toEqual(
            expect.arrayContaining(expectedTab)
          )
        )
      })
    })

    describe('bundle analysis is enabled', () => {
      it('adds the bundle link to the array', async () => {
        setup({ bundleAnalysisEnabled: true })
        const { result } = renderHook(
          () =>
            useRepoTabs({
              refetchEnabled: false,
            }),
          { wrapper: wrapper('/gh/codecov/test-repo') }
        )

        const expectedTab = [
          expect.objectContaining({
            pageName: 'bundles',
          }),
        ]
        await waitFor(() =>
          expect(result.current).toEqual(expect.arrayContaining(expectedTab))
        )
      })
    })

    describe('bundle analysis is disabled', () => {
      it('does not add the bundle link to the array', async () => {
        setup({ bundleAnalysisEnabled: false })
        const { result } = renderHook(
          () =>
            useRepoTabs({
              refetchEnabled: false,
            }),
          { wrapper: wrapper('/gh/codecov/test-repo') }
        )

        await waitForElementToBeRemoved(await screen.findByText('Loading'))

        const expectedTab = [
          expect.objectContaining({
            pageName: 'bundles',
          }),
        ]
        await waitFor(() =>
          expect(result.current).not.toEqual(
            expect.arrayContaining(expectedTab)
          )
        )
      })
    })
  })

  describe('commits and pulls tab', () => {
    describe('bundle analysis is enabled', () => {
      it('adds the commits and pulls link to the array', async () => {
        setup({ bundleAnalysisEnabled: true })
        const { result } = renderHook(
          () =>
            useRepoTabs({
              refetchEnabled: false,
            }),
          { wrapper: wrapper('/gh/codecov/test-repo') }
        )

        const expectedTab = [
          {
            pageName: 'commits',
          },
          {
            pageName: 'pulls',
          },
        ]
        await waitFor(() =>
          expect(result.current).toEqual(expect.arrayContaining(expectedTab))
        )
      })
    })

    describe('bundle analysis is disabled', () => {
      it('does not add the commits and pulls link to the array', async () => {
        setup({ bundleAnalysisEnabled: false })
        const { result } = renderHook(
          () =>
            useRepoTabs({
              refetchEnabled: false,
            }),
          { wrapper: wrapper('/gh/codecov/test-repo') }
        )

        await waitForElementToBeRemoved(await screen.findByText('Loading'))

        const expectedTab = [
          {
            pageName: 'commits',
          },
          {
            pageName: 'pulls',
          },
        ]
        await waitFor(() =>
          expect(result.current).not.toEqual(
            expect.arrayContaining(expectedTab)
          )
        )
      })
    })

    describe('coverage is enabled', () => {
      it('adds the commits and pulls link to the array', async () => {
        setup({ coverageEnabled: true })
        const { result } = renderHook(
          () =>
            useRepoTabs({
              refetchEnabled: false,
            }),
          { wrapper: wrapper('/gh/codecov/test-repo') }
        )

        const expectedTab = [
          {
            pageName: 'commits',
          },
          {
            pageName: 'pulls',
          },
        ]
        await waitFor(() =>
          expect(result.current).toEqual(expect.arrayContaining(expectedTab))
        )
      })
    })

    describe('coverage is disabled', () => {
      it('does not add the commits and pulls link to the array', async () => {
        setup({ coverageEnabled: false })
        const { result } = renderHook(
          () =>
            useRepoTabs({
              refetchEnabled: false,
            }),
          { wrapper: wrapper('/gh/codecov/test-repo') }
        )

        await waitForElementToBeRemoved(await screen.findByText('Loading'))

        const expectedTab = [
          {
            pageName: 'commits',
          },
          {
            pageName: 'pulls',
          },
        ]
        await waitFor(() =>
          expect(result.current).not.toEqual(
            expect.arrayContaining(expectedTab)
          )
        )
      })
    })
  })

  describe('configuration tab', () => {
    describe('when user is part of the org', () => {
      it('adds the configuration link to the array', async () => {
        setup({})
        const { result } = renderHook(
          () =>
            useRepoTabs({
              refetchEnabled: false,
            }),
          { wrapper: wrapper('/gh/codecov/test-repo') }
        )

        const expectedTab = [
          {
            pageName: 'configuration',
          },
        ]
        await waitFor(() =>
          expect(result.current).toEqual(expect.arrayContaining(expectedTab))
        )
      })
    })

    describe('when user is not part of the org', () => {
      it('does not add the configuration link to the array', async () => {
        setup({ isCurrentUserPartOfOrg: false })
        const { result } = renderHook(
          () =>
            useRepoTabs({
              refetchEnabled: false,
            }),
          { wrapper: wrapper('/gh/codecov/test-repo') }
        )

        await waitForElementToBeRemoved(await screen.findByText('Loading'))

        const expectedTab = [
          {
            pageName: 'configuration',
          },
        ]
        await waitFor(() =>
          expect(result.current).not.toEqual(
            expect.arrayContaining(expectedTab)
          )
        )
      })
    })
  })

  describe('tests tab', () => {
    describe('when test analytics is enabled', () => {
      it('adds the tests link to the array', async () => {
        setup({ testAnalyticsEnabled: true })
        const { result } = renderHook(
          () =>
            useRepoTabs({
              refetchEnabled: false,
            }),
          { wrapper: wrapper('/gh/codecov/test-repo') }
        )

        const expectedTab = [
          {
            pageName: 'failedTests',
            children: expect.anything(),
          },
        ]
        await waitFor(() =>
          expect(result.current).toEqual(expect.arrayContaining(expectedTab))
        )
      })
    })

    describe('when test analytics is disabled', () => {
      it('does not add the tests link to the array', async () => {
        setup({ testAnalyticsEnabled: false })
        const { result } = renderHook(
          () =>
            useRepoTabs({
              refetchEnabled: false,
            }),
          { wrapper: wrapper('/gh/codecov/test-repo') }
        )

        const expectedTab = [
          {
            pageName: 'failedTestsOnboarding',
            children: expect.anything(),
          },
        ]

        await waitFor(() =>
          expect(result.current).toEqual(expect.arrayContaining(expectedTab))
        )
      })
    })

    describe('when test analytics is disabled and user is not part of the org', () => {
      it('does not add the tests link to the array', async () => {
        setup({ testAnalyticsEnabled: false, isCurrentUserPartOfOrg: false })
        const { result } = renderHook(
          () =>
            useRepoTabs({
              refetchEnabled: false,
            }),
          { wrapper: wrapper('/gh/codecov/test-repo') }
        )

        await waitFor(() => expect(result.current).toEqual([]))
      })
    })
  })
})
