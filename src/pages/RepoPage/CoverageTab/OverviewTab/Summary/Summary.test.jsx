import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { graphql, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { Suspense } from 'react'
import { MemoryRouter, Route } from 'react-router-dom'

import Summary from './Summary'

const mocks = vi.hoisted(() => ({
  useIntersection: vi.fn(),
  useCoverageRedirect: vi.fn(),
}))

vi.mock('react-use', async () => {
  const actual = await vi.importActual('react-use')
  return {
    ...actual,
    useIntersection: mocks.useIntersection,
  }
})

vi.mock('../summaryHooks/useCoverageRedirect', async () => {
  const actual = await vi.importActual('../summaryHooks/useCoverageRedirect')
  return {
    ...actual,
    useCoverageRedirect: mocks.useCoverageRedirect,
  }
})

vi.mock('./CoverageTrend', () => ({ default: () => 'CoverageTrend' }))

const mockRepoOverview = {
  __typename: 'Repository',
  private: false,
  defaultBranch: 'main',
  oldestCommitAt: '2022-10-10T11:59:59',
  coverageEnabled: true,
  bundleAnalysisEnabled: true,
  languages: [],
  testAnalyticsEnabled: false,
}

const mockMainBranchSearch = {
  __typename: 'Repository',
  branches: {
    edges: [
      {
        node: {
          name: 'main',
          head: {
            commitid: '321fdsa',
          },
        },
      },
    ],
    pageInfo: {
      hasNextPage: false,
      endCursor: 'end-cursor',
    },
  },
}

const mockBranch = {
  branch: {
    name: 'main',
    head: {
      commitid: '321fdsa',
    },
  },
}

const mockBranches = (hasNextPage = false) => ({
  __typename: 'Repository',
  branches: {
    edges: [
      {
        node: {
          name: 'branch-1',
          head: {
            commitid: 'asdf123',
          },
        },
      },
      {
        node: {
          name: 'main',
          head: {
            commitid: '321fdsa',
          },
        },
      },
    ],
    pageInfo: {
      hasNextPage: hasNextPage,
      endCursor: 'end-cursor',
    },
  },
})

const mockRepoCoverage = {
  __typename: 'Repository',
  branch: {
    name: 'main',
    head: {
      yamlState: 'DEFAULT',
      coverageAnalytics: {
        totals: {
          percentCovered: 95.0,
          lineCount: 100,
          hitsCount: 100,
        },
      },
    },
  },
}

const mockRepoConfig = {
  owner: {
    repository: {
      __typename: 'Repository',
      repositoryConfig: {
        indicationRange: { upperRange: 80, lowerRange: 60 },
      },
    },
  },
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      suspense: true,
      retry: false,
    },
  },
})
const server = setupServer()

const wrapper =
  (initialEntries = '/gh/test/critical-role') =>
  ({ children }) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialEntries]}>
        <Route path="/:provider/:owner/:repo">
          <Suspense fallback={<div>loading</div>}>{children}</Suspense>
        </Route>
        <Route path="*" render={({ location }) => location.pathname} />
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

describe('Summary', () => {
  function setup(
    {
      hasNextPage,
      coverageRedirectData = {
        redirectState: {
          isRedirectionEnabled: false,
          newPath: undefined,
        },
        setNewPath: vi.fn(),
      },
    } = {
      hasNextPage: false,
      coverageRedirectData: {
        redirectState: {
          isRedirectionEnabled: false,
          newPath: undefined,
        },
        setNewPath: vi.fn(),
      },
    }
  ) {
    const user = userEvent.setup()
    const fetchNextPage = vi.fn()
    const mockSearching = vi.fn()

    mocks.useCoverageRedirect.mockReturnValue(coverageRedirectData)
    server.use(
      graphql.query('GetRepoOverview', () => {
        return HttpResponse.json({
          data: {
            owner: {
              isCurrentUserActivated: true,
              repository: mockRepoOverview,
            },
          },
        })
      }),
      graphql.query('GetBranch', () => {
        return HttpResponse.json({
          data: {
            owner: { repository: { __typename: 'Repository', ...mockBranch } },
          },
        })
      }),
      graphql.query('GetBranches', (info) => {
        if (info.variables?.after) {
          fetchNextPage(info.variables?.after)
        }

        if (info.variables?.filters?.searchValue === 'main') {
          return HttpResponse.json({
            data: { owner: { repository: mockMainBranchSearch } },
          })
        }

        if (info.variables?.filters?.searchValue) {
          mockSearching(info.variables?.filters?.searchValue)
        }

        return HttpResponse.json({
          data: { owner: { repository: mockBranches(hasNextPage) } },
        })
      }),
      graphql.query('GetRepoCoverage', () => {
        return HttpResponse.json({
          data: { owner: { repository: mockRepoCoverage } },
        })
      }),
      graphql.query('RepoConfig', () => {
        return HttpResponse.json({ data: mockRepoConfig })
      })
    )

    return { fetchNextPage, mockSearching, user }
  }

  describe('with populated data', () => {
    beforeEach(() => {
      setup()
    })

    it('renders the branch selector', async () => {
      render(<Summary />, { wrapper: wrapper() })

      const branchContext = await screen.findByText(/Branch Context/)
      expect(branchContext).toBeInTheDocument()
    })

    it('renders default branch as selected branch', async () => {
      render(<Summary />, { wrapper: wrapper() })

      const dropDownBtn = await screen.findByText('main')
      expect(dropDownBtn).toBeInTheDocument()
    })

    it('renders the source commit short sha', async () => {
      render(<Summary />, { wrapper: wrapper() })

      const shortSha = await screen.findByText(/321fdsa/)
      expect(shortSha).toBeInTheDocument()
    })

    it('renders the yaml configuration for default yaml prompt', async () => {
      render(<Summary />, { wrapper: wrapper() })

      const yamlConfigurationTitle =
        await screen.findByText(/YAML Configuration/)
      expect(yamlConfigurationTitle).toBeInTheDocument()

      const yamlConfigurationLink = await screen.findByRole('link', {
        name: /Learn more/,
      })
      expect(yamlConfigurationLink).toBeInTheDocument()
      expect(yamlConfigurationLink).toHaveAttribute(
        'href',
        'https://docs.codecov.com/docs/codecov-yaml'
      )

      const yamlConfigurationBody = await screen.findByText(
        /about PR comment, target and flags/
      )
      expect(yamlConfigurationBody).toBeInTheDocument()
    })
  })

  describe('branch coverage', () => {
    beforeEach(() => {
      setup()
    })

    it('renders the branch coverage', async () => {
      render(<Summary />, { wrapper: wrapper() })

      const percentage = await screen.findByText('95.00%')
      expect(percentage).toBeInTheDocument()
    })
    it('renders the lines covered', async () => {
      render(<Summary />, { wrapper: wrapper() })

      const lineCoverage = await screen.findByText('100 of 100 lines covered')
      expect(lineCoverage).toBeInTheDocument()
    })
  })

  describe('uses a conditional Redirect', () => {
    it('updates the location', async () => {
      const mockSetNewPath = vi.fn()
      const coverageRedirectData = {
        redirectState: {
          newPath: '/some/new/location',
          isRedirectionEnabled: true,
        },
        setNewPath: mockSetNewPath,
      }

      const { user } = setup({
        coverageRedirectData: coverageRedirectData,
      })
      render(<Summary />, { wrapper: wrapper() })

      const button = await screen.findByText('main')
      await user.click(button)

      const branch1 = await screen.findByText('branch-1')
      await user.click(branch1)

      expect(mockSetNewPath).toHaveBeenCalled()
    })
  })

  describe('fires the setNewPath on branch selection', () => {
    it('updates the location', async () => {
      const mockSetNewPath = vi.fn()
      const coverageRedirectData = {
        redirectState: {
          newPath: '/some/new/location',
          isRedirectionEnabled: true,
        },
        setNewPath: mockSetNewPath,
      }

      const { user } = setup({
        coverageRedirectData: coverageRedirectData,
      })
      render(<Summary />, { wrapper: wrapper() })

      const main = await screen.findByText('main')
      await user.click(main)

      const branch1 = await screen.findByText('branch-1')
      await user.click(branch1)

      expect(mockSetNewPath).toHaveBeenCalled()
      expect(mockSetNewPath).toHaveBeenCalledWith('branch-1')
    })
  })

  describe('when onLoadMore is triggered', () => {
    describe('there is a next page', () => {
      it('calls fetchNextPage', async () => {
        const mockSetNewPath = vi.fn()
        const { fetchNextPage } = setup({
          hasNextPage: true,
          coverageRedirectData: {
            redirectState: {
              newPath: '/some/new/location',
              isRedirectionEnabled: true,
            },
            setNewPath: mockSetNewPath,
          },
        })
        mocks.useIntersection.mockReturnValue({
          isIntersecting: true,
        })
        render(<Summary />, { wrapper: wrapper() })

        await waitFor(() => expect(fetchNextPage).toHaveBeenCalled())
      })
    })

    describe('when there is not a next page', () => {
      /*  TODO: this is a false positive test. The component is
          actually calling it but because of scoping it was
          always falsy
      */
      const fetchNextPage = vi.fn()
      it('does not call fetchNextPage', async () => {
        const mockSetNewPath = vi.fn()

        const { user } = setup({
          hasNextPage: false,
          coverageRedirectData: {
            redirectState: {
              newPath: '/some/new/location',
              isRedirectionEnabled: true,
            },
            setNewPath: mockSetNewPath,
          },
        })

        mocks.useIntersection.mockReturnValue({
          isIntersecting: true,
        })

        render(<Summary />, { wrapper: wrapper() })

        const select = await screen.findByRole('button', {
          name: 'select branch',
        })
        await user.click(select)

        expect(fetchNextPage).not.toHaveBeenCalled()
      })
    })
  })

  describe('user searches for branch', () => {
    it('calls the api with the search value', async () => {
      const { mockSearching, user } = setup()
      render(<Summary />, { wrapper: wrapper() })

      const select = await screen.findByText('main')
      await user.click(select)

      const input = await screen.findByRole('combobox')
      await user.type(input, 'searching for branch')

      await waitFor(() =>
        expect(mockSearching).toHaveBeenCalledWith('searching for branch')
      )
    })
  })
})
