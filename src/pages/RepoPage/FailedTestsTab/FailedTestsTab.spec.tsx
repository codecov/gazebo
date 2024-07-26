import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { PropsWithChildren, Suspense } from 'react'
import { MemoryRouter, Route, useLocation } from 'react-router-dom'

import { useRedirect } from 'shared/useRedirect'

import FailedTestsTab from './FailedTestsTab'

jest.mock('./GitHubActions', () => () => 'GitHub Actions tab')
jest.mock('./CodecovCLI', () => () => 'Codecov CLI tab')
jest.mock(
  './FailedTestsTable/FailedTestsTable.tsx',
  () => () => 'Failed Tests Table'
)
jest.mock('./FailedTestsTable/BranchSelector', () => () => 'Branch Selector')

jest.mock('shared/useRedirect')
const mockedUseRedirect = useRedirect as jest.Mock

let testLocation: ReturnType<typeof useLocation>

const server = setupServer()
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      suspense: false,
    },
  },
})

const wrapper: (initialEntries?: string) => React.FC<PropsWithChildren> =
  (initialEntries = '/gh/codecov/cool-repo/tests') =>
  ({ children }) =>
    (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[initialEntries]}>
          <Route
            path={[
              '/:provider/:owner/:repo/tests',
              '/:provider/:owner/:repo/tests/new',
              '/:provider/:owner/:repo/tests/new/codecov-cli',
              '/:provider/:owner/:repo/tests/:branch',
            ]}
            exact
          >
            <Suspense fallback={null}>{children}</Suspense>
          </Route>
          <Route
            path="*"
            render={({ location }) => {
              testLocation = location
              return null
            }}
          />
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

const mockRepoOverview = ({ testAnalyticsEnabled = false }) => {
  return {
    owner: {
      repository: {
        __typename: 'Repository',
        private: false,
        defaultBranch: 'main',
        oldestCommitAt: '2022-10-10T11:59:59',
        coverageEnabled: true,
        bundleAnalysisEnabled: true,
        languages: ['javascript'],
        testAnalyticsEnabled,
      },
    },
  }
}

describe('FailedTestsTab', () => {
  const hardRedirect = jest.fn()
  mockedUseRedirect.mockImplementation((data) => ({
    hardRedirect: () => hardRedirect(data),
  }))

  function setup({ testEnabled = false }: { testEnabled?: boolean }) {
    server.use(
      graphql.query('GetRepoOverview', (req, res, ctx) => {
        if (testEnabled) {
          return res(
            ctx.status(200),
            ctx.data(mockRepoOverview({ testAnalyticsEnabled: true }))
          )
        }
        return res(ctx.status(200), ctx.data(mockRepoOverview({})))
      })
    )

    return { user: userEvent.setup({}) }
  }

  it('renders intro', () => {
    setup({})
    render(<FailedTestsTab />, { wrapper: wrapper() })

    const intro = screen.getByText('Test Analytics')
    expect(intro).toBeInTheDocument()
  })

  it('renders onboarding failed tests img', () => {
    setup({})
    render(<FailedTestsTab />, { wrapper: wrapper() })

    const img = screen.getByAltText('failed-tests-onboarding')
    expect(img).toBeInTheDocument()
  })

  describe('Setup Options', () => {
    it('renders', () => {
      setup({})
      render(<FailedTestsTab />, { wrapper: wrapper() })

      const selectorHeader = screen.getByText('Select a setup option')
      expect(selectorHeader).toBeInTheDocument()

      const githubActions = screen.getByText('Using GitHub Actions')
      const codecovCLI = screen.getByText("Using Codecov's CLI")
      expect(githubActions).toBeInTheDocument()
      expect(codecovCLI).toBeInTheDocument()
    })

    describe('initial selection', () => {
      describe('when on /tests path', () => {
        it('selects GitHub Actions as default', () => {
          setup({})
          render(<FailedTestsTab />, { wrapper: wrapper() })

          const githubActions = screen.getByTestId('github-actions-radio')
          expect(githubActions).toBeInTheDocument()
          expect(githubActions).toHaveAttribute('data-state', 'checked')
        })
      })

      describe('when on /tests/new/codecov-cli path', () => {
        it('selects Codecov CLI as default', () => {
          setup({})
          render(<FailedTestsTab />, {
            wrapper: wrapper('/gl/codecov/cool-repo/tests/new/codecov-cli'),
          })

          const codecovCLI = screen.getByTestId('codecov-cli-radio')
          expect(codecovCLI).toBeInTheDocument()
          expect(codecovCLI).toHaveAttribute('data-state', 'checked')
        })
      })
    })

    describe('navigation', () => {
      describe('when GitHub Actions is selected', () => {
        it('should navigate to /tests/new', async () => {
          const { user } = setup({})
          render(<FailedTestsTab />, {
            wrapper: wrapper('/gh/codecov/cool-repo/tests/new/codecov-cli'),
          })

          const githubActions = screen.getByTestId('github-actions-radio')
          expect(githubActions).toBeInTheDocument()
          expect(githubActions).toHaveAttribute('data-state', 'unchecked')

          await user.click(githubActions)

          expect(githubActions).toBeInTheDocument()
          expect(githubActions).toHaveAttribute('data-state', 'checked')

          expect(testLocation.pathname).toBe('/gh/codecov/cool-repo/tests/new')
        })
      })

      describe('when Codecov CLI is selected', () => {
        it('should navigate to /codecov-cli', async () => {
          const { user } = setup({})
          render(<FailedTestsTab />, { wrapper: wrapper() })

          const codecovCLI = screen.getByTestId('codecov-cli-radio')
          expect(codecovCLI).toBeInTheDocument()
          expect(codecovCLI).toHaveAttribute('data-state', 'unchecked')

          await user.click(codecovCLI)

          expect(codecovCLI).toBeInTheDocument()
          expect(codecovCLI).toHaveAttribute('data-state', 'checked')

          expect(testLocation.pathname).toBe(
            '/gh/codecov/cool-repo/tests/new/codecov-cli'
          )
        })
      })
    })
  })

  describe('rendering component', () => {
    it('renders github actions', () => {
      setup({})
      render(<FailedTestsTab />, { wrapper: wrapper() })
      const content = screen.getByText(/GitHub Actions tab/)
      expect(content).toBeInTheDocument()
    })

    it('renders Codecov CLI', () => {
      setup({})
      render(<FailedTestsTab />, {
        wrapper: wrapper('/gh/codecov/cool-repo/tests/new/codecov-cli'),
      })
      const content = screen.getByText(/Codecov CLI tab/)
      expect(content).toBeInTheDocument()
    })

    it('renders Failed Tests Table', async () => {
      setup({ testEnabled: true })
      render(<FailedTestsTab />, {
        wrapper: wrapper('/gh/codecov/cool-repo/tests'),
      })
      const content = await screen.findByText(/Failed Tests Table/)
      expect(content).toBeInTheDocument()
    })

    it('renders Branch Selector', async () => {
      setup({ testEnabled: true })
      render(<FailedTestsTab />, {
        wrapper: wrapper('/gh/codecov/cool-repo/tests'),
      })
      const content = await screen.findByText(/Branch Selector/)
      expect(content).toBeInTheDocument()
    })
  })
})
