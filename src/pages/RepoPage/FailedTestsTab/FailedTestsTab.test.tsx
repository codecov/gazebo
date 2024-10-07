import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { graphql, HttpResponse } from 'msw2'
import { setupServer } from 'msw2/node'
import { PropsWithChildren, Suspense } from 'react'
import { MemoryRouter, Route, useLocation } from 'react-router-dom'

import FailedTestsTab from './FailedTestsTab'

const mocks = vi.hoisted(() => ({
  useRedirect: vi.fn(),
}))

vi.mock('./GitHubActions', () => ({
  default: () => 'GitHub Actions tab',
}))
vi.mock('./CodecovCLI', () => ({
  default: () => 'Codecov CLI tab',
}))
vi.mock('./FailedTestsTable/FailedTestsTable.tsx', () => ({
  default: () => 'Failed Tests Table',
}))
vi.mock('./FailedTestsTable/BranchSelector', () => ({
  default: () => 'Branch Selector',
}))
vi.mock('../ActivationAlert', () => ({
  default: () => 'Activation Alert',
}))

vi.mock('shared/useRedirect', async () => {
  const actual = await vi.importActual('shared/useRedirect')
  return {
    ...actual,
    useRedirect: mocks.useRedirect,
  }
})

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
  ({ children }) => (
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

const mockRepoOverview = ({
  testAnalyticsEnabled = false,
  isCurrentUserActivated = true,
  isPrivate = false,
}) => {
  return {
    owner: {
      isCurrentUserActivated,
      repository: {
        __typename: 'Repository',
        private: isPrivate,
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
  const hardRedirect = vi.fn()
  mocks.useRedirect.mockImplementation((data) => ({
    hardRedirect: () => hardRedirect(data),
  }))

  function setup({
    testEnabled = false,
    isCurrentUserActivated = true,
    isPrivate = false,
  }: {
    testEnabled?: boolean
    isCurrentUserActivated?: boolean
    isPrivate?: boolean
  }) {
    server.use(
      graphql.query('GetRepoOverview', (info) => {
        if (testEnabled) {
          return HttpResponse.json({
            data: mockRepoOverview({
              testAnalyticsEnabled: true,
              isCurrentUserActivated,
              isPrivate,
            }),
          })
        }
        return HttpResponse.json({ data: mockRepoOverview({}) })
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

    it('renders Failed Tests Page', async () => {
      setup({ testEnabled: true })
      render(<FailedTestsTab />, {
        wrapper: wrapper('/gh/codecov/cool-repo/tests'),
      })
      const content = await screen.findByText(/Failed Tests Page/)
      expect(content).toBeInTheDocument()
    })
  })

  describe('when user is not activated', () => {
    it('renders activation alert if private repo', async () => {
      setup({
        testEnabled: true,
        isCurrentUserActivated: false,
        isPrivate: true,
      })
      render(<FailedTestsTab />, {
        wrapper: wrapper('/gh/codecov/cool-repo/tests'),
      })

      const activationAlert = await screen.findByText(/Activation Alert/)
      expect(activationAlert).toBeInTheDocument()
    })

    it('renders failed tests page if public repo', async () => {
      setup({
        testEnabled: true,
        isCurrentUserActivated: false,
        isPrivate: false,
      })
      render(<FailedTestsTab />, {
        wrapper: wrapper('/gh/codecov/cool-repo/tests'),
      })

      const activationAlert = await screen.findByText(/Failed Tests Page/)
      expect(activationAlert).toBeInTheDocument()
    })
  })
})
