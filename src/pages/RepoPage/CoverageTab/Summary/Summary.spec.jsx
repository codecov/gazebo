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

const mockBranches = (hasNextPage = false) => ({
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
    },
  },
})
const server = setupServer()

const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <MemoryRouter initialEntries={['/gh/test/critical-role']}>
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
  const fetchNextPage = jest.fn()
  const mockSearching = jest.fn()
  const mockSetNewPath = jest.fn()
  const mockUseCoverageRedirectData = {
    redirectState: {
      isRedirectionEnabled: false,
      newPath: undefined,
    },
    setNewPath: mockSetNewPath,
  }

  function setup(
    { hasNextPage, coverageRedirectData } = {
      hasNextPage: false,
      coverageRedirectData: mockUseCoverageRedirectData,
    }
  ) {
    useCoverageRedirect.mockReturnValue(coverageRedirectData)
    server.use(
      graphql.query('GetRepoOverview', (req, res, ctx) =>
        res(
          ctx.status(200),
          ctx.data({ owner: { repository: mockRepoOverview } })
        )
      ),
      graphql.query('GetBranches', (req, res, ctx) => {
        if (req.variables?.after) {
          fetchNextPage(req.variables?.after)
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
  }

  describe('with populated data', () => {
    beforeEach(() => {
      setup()
    })

    it('renders the branch selector', async () => {
      render(<Summary />, { wrapper })

      const branchContext = await screen.findByText(/Branch Context/)
      expect(branchContext).toBeInTheDocument()
    })

    it('renders default branch as selected branch', async () => {
      render(<Summary />, { wrapper })

      const dropDownBtn = await screen.findByText('main')
      expect(dropDownBtn).toBeInTheDocument()
    })

    it('renders the source commit short sha', async () => {
      render(<Summary />, { wrapper })

      const shortSha = await screen.findByText(/321fdsa/)
      expect(shortSha).toBeInTheDocument()
    })
  })

  describe('branch coverage', () => {
    beforeEach(() => {
      setup()
    })

    it('renders the branch coverage', async () => {
      render(<Summary />, { wrapper })

      const percentage = await screen.findByText('95.00%')
      expect(percentage).toBeInTheDocument()
    })
    it('renders the lines covered', async () => {
      render(<Summary />, { wrapper })

      const lineCoverage = await screen.findByText('100 of 100 lines covered')
      expect(lineCoverage).toBeInTheDocument()
    })
  })
  /*
    I don't love this test but I couldn't think of a good way to test
    the select user interaction and the location change correctly.
  */
  describe('uses a conditional Redirect', () => {
    beforeEach(() => {
      setup({
        coverageRedirectData: {
          redirectState: {
            newPath: '/some/new/location',
            isRedirectionEnabled: true,
          },
          setNewPath: mockSetNewPath,
        },
      })
    })

    it('updates the location', async () => {
      render(<Summary />, { wrapper })

      const button = await screen.findByText('main')
      userEvent.click(button)

      const branch1 = await screen.findByText('branch-1')
      userEvent.click(branch1)

      expect(mockSetNewPath).toHaveBeenCalled()
    })
  })

  describe('fires the setNewPath on branch selection', () => {
    beforeEach(() => {
      setup()
    })

    it('updates the location', async () => {
      render(<Summary />, { wrapper })

      const main = await screen.findByText('main')
      userEvent.click(main)

      const branch1 = await screen.findByText('branch-1')
      userEvent.click(branch1)

      expect(mockSetNewPath).toHaveBeenCalled()
      expect(mockSetNewPath).toHaveBeenCalledWith('branch-1')
    })
  })

  describe('when onLoadMore is triggered', () => {
    describe('there is a next page', () => {
      beforeEach(() => {
        setup({
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
      })

      it('calls fetchNextPage', async () => {
        render(<Summary />, { wrapper })

        const select = await screen.findByRole('button', {
          name: 'select branch',
        })
        userEvent.click(select)

        await waitFor(() => expect(fetchNextPage).toBeCalled())
      })
    })

    describe('when there is not a next page', () => {
      const fetchNextPage = jest.fn()
      beforeEach(() => {
        setup({
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
      })
      it('does not call fetchNextPage', async () => {
        render(<Summary />, { wrapper })

        const select = await screen.findByRole('button', {
          name: 'select branch',
        })
        userEvent.click(select)

        await waitFor(() => expect(fetchNextPage).not.toBeCalled())
      })
    })
  })

  describe('user searches for branch', () => {
    beforeEach(() => {
      setup()
    })

    it('calls the api with the search value', async () => {
      render(<Summary />, { wrapper })

      const select = await screen.findByText('main')
      userEvent.click(select)

      const input = await screen.findByRole('textbox')
      userEvent.type(input, 'searching for branch')

      await waitFor(() =>
        expect(mockSearching).toHaveBeenCalledWith('searching for branch')
      )
    })
  })
})
