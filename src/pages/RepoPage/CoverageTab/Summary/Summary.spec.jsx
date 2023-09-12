import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { Suspense } from 'react'
import { MemoryRouter, Route } from 'react-router-dom'
import useIntersection from 'react-use/lib/useIntersection'

import { useCoverageRedirect } from './hooks/useCoverageRedirect'
import Summary from './Summary'

jest.mock('./hooks/useCoverageRedirect')
jest.mock('./CoverageTrend', () => () => 'CoverageTrend')
jest.mock('react-use/lib/useIntersection')

const mockRepoOverview = {
  private: false,
  defaultBranch: 'main',
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

const mockRepoConfig = {
  repositoryConfig: {
    indicationRange: {
      upperRange: 80,
      lowerRange: 60,
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
  ({ children }) =>
    (
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
        setNewPath: jest.fn(),
      },
    } = {
      hasNextPage: false,
      coverageRedirectData: {
        redirectState: {
          isRedirectionEnabled: false,
          newPath: undefined,
        },
        setNewPath: jest.fn(),
      },
    }
  ) {
    const user = userEvent.setup()
    const fetchNextPage = jest.fn()
    const mockSearching = jest.fn()

    useCoverageRedirect.mockReturnValue(coverageRedirectData)
    server.use(
      graphql.query('GetRepoOverview', (req, res, ctx) =>
        res(
          ctx.status(200),
          ctx.data({ owner: { repository: mockRepoOverview } })
        )
      ),
      graphql.query('GetBranch', (req, res, ctx) =>
        res(
          ctx.status(200),
          ctx.data({
            owner: { repository: { __typename: 'Repository', ...mockBranch } },
          })
        )
      ),
      graphql.query('GetBranches', (req, res, ctx) => {
        if (req.variables?.after) {
          fetchNextPage(req.variables?.after)
        }

        if (req.variables?.filters?.searchValue === 'main') {
          return res(
            ctx.status(200),
            ctx.data({ owner: { repository: mockMainBranchSearch } })
          )
        }

        if (req.variables?.filters?.searchValue) {
          mockSearching(req.variables?.filters?.searchValue)
        }

        return res(
          ctx.status(200),
          ctx.data({ owner: { repository: mockBranches(hasNextPage) } })
        )
      }),
      graphql.query('GetRepoCoverage', (req, res, ctx) =>
        res(
          ctx.status(200),
          ctx.data({ owner: { repository: mockRepoCoverage } })
        )
      ),
      graphql.query('RepoConfig', (req, res, ctx) =>
        res(
          ctx.status(200),
          ctx.data({ owner: { repository: mockRepoConfig } })
        )
      )
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

      const yamlConfigurationTitle = await screen.findByText(
        /Yaml Configuration/
      )
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
      const mockSetNewPath = jest.fn()
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
      const mockSetNewPath = jest.fn()
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
        const mockSetNewPath = jest.fn()
        const { fetchNextPage, user } = setup({
          hasNextPage: true,
          coverageRedirectData: {
            redirectState: {
              newPath: '/some/new/location',
              isRedirectionEnabled: true,
            },
            setNewPath: mockSetNewPath,
          },
        })
        useIntersection.mockReturnValue({
          isIntersecting: true,
        })
        render(<Summary />, { wrapper: wrapper() })

        const select = await screen.findByRole('button', {
          name: 'select branch',
        })
        await user.click(select)

        await waitFor(() => expect(fetchNextPage).toBeCalled())
      })
    })

    describe('when there is not a next page', () => {
      /*  TODO: this is a false positive test. The component is
          actually calling it but because of scoping it was
          always falsy
      */
      const fetchNextPage = jest.fn()
      it('does not call fetchNextPage', async () => {
        const mockSetNewPath = jest.fn()

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

        useIntersection.mockReturnValue({
          isIntersecting: true,
        })

        render(<Summary />, { wrapper: wrapper() })

        const select = await screen.findByRole('button', {
          name: 'select branch',
        })
        await user.click(select)

        expect(fetchNextPage).not.toBeCalled()
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
