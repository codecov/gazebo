import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { graphql, HttpResponse } from 'msw2'
import { setupServer } from 'msw2/node'
import { Suspense } from 'react'
import { MemoryRouter, Route } from 'react-router-dom'
import { type Mock } from 'vitest'

import SummaryTeamPlan from './SummaryTeamPlan'

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

const mockRepoOverview = {
  __typename: 'Repository',
  private: false,
  defaultBranch: 'main',
  oldestCommitAt: '2022-10-10T11:59:59',
  coverageEnabled: true,
  bundleAnalysisEnabled: true,
  languages: [],
  testAnalyticsEnabled: true,
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
      totals: {
        percentCovered: 95.0,
        lineCount: 100,
        hitsCount: 100,
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
  (
    initialEntries = '/gh/test/critical-role'
  ): React.FC<React.PropsWithChildren> =>
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
      isIntersecting,
      hasNextPage,
      coverageRedirectData = {
        redirectState: {
          isRedirectionEnabled: false,
          newPath: undefined,
        },
        setNewPath: vi.fn(),
      },
    }: {
      isIntersecting?: boolean
      hasNextPage?: boolean
      coverageRedirectData?: {
        redirectState: {
          isRedirectionEnabled: boolean
          newPath?: string
        }
        setNewPath: Mock
      }
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

    mocks.useIntersection.mockReturnValue({
      isIntersecting,
    })

    server.use(
      graphql.query('GetRepoOverview', (info) => {
        return HttpResponse.json({
          data: {
            owner: {
              isCurrentUserActivated: true,
              repository: mockRepoOverview,
            },
          },
        })
      }),
      graphql.query('GetBranch', (info) => {
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
      graphql.query('GetRepoCoverage', (info) => {
        return HttpResponse.json({
          data: { owner: { repository: mockRepoCoverage } },
        })
      })
    )

    return { fetchNextPage, mockSearching, user }
  }

  describe('with populated data', () => {
    beforeEach(() => {
      setup()
    })

    it('renders default branch as selected branch', async () => {
      render(<SummaryTeamPlan />, { wrapper: wrapper() })

      const dropDownBtn = await screen.findByText('main')
      expect(dropDownBtn).toBeInTheDocument()
    })

    it('renders branch icon inside select button', async () => {
      render(<SummaryTeamPlan />, { wrapper: wrapper() })

      const dropDownBtn = await screen.findByRole('button')
      const icon = await within(dropDownBtn).findByTestId('branch')
      expect(icon).toBeInTheDocument()
    })

    it('renders the source commit short sha', async () => {
      render(<SummaryTeamPlan />, { wrapper: wrapper() })

      const shortSha = await screen.findByText(/321fdsa/)
      expect(shortSha).toBeInTheDocument()
    })

    it('renders the yaml configuration for default yaml prompt', async () => {
      render(<SummaryTeamPlan />, { wrapper: wrapper() })

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
        /about PR comments, targets, and badges/
      )
      expect(yamlConfigurationBody).toBeInTheDocument()
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
      render(<SummaryTeamPlan />, { wrapper: wrapper() })

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
      render(<SummaryTeamPlan />, { wrapper: wrapper() })

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
        const { fetchNextPage, user } = setup({
          isIntersecting: true,
          hasNextPage: true,
          coverageRedirectData: {
            redirectState: {
              newPath: '/some/new/location',
              isRedirectionEnabled: true,
            },
            setNewPath: mockSetNewPath,
          },
        })
        render(<SummaryTeamPlan />, { wrapper: wrapper() })

        const select = await screen.findByRole('button', {
          name: 'select branch',
        })
        await user.click(select)

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
          isIntersecting: true,
          hasNextPage: false,
          coverageRedirectData: {
            redirectState: {
              newPath: '/some/new/location',
              isRedirectionEnabled: true,
            },
            setNewPath: mockSetNewPath,
          },
        })
        render(<SummaryTeamPlan />, { wrapper: wrapper() })

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
      render(<SummaryTeamPlan />, { wrapper: wrapper() })

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
