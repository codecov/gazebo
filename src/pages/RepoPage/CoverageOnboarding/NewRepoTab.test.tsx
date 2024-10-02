import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { graphql, HttpResponse } from 'msw2'
import { setupServer } from 'msw2/node'
import { PropsWithChildren, Suspense } from 'react'
import { MemoryRouter, Route, useLocation } from 'react-router-dom'

import NewRepoTab from './NewRepoTab'

const mocks = vi.hoisted(() => ({
  useRedirect: vi.fn(),
}))

vi.mock('shared/useRedirect', async () => {
  const actual = await vi.importActual('shared/useRedirect')
  return {
    ...actual,
    useRedirect: mocks.useRedirect,
  }
})

vi.mock('./GitHubActions', () => ({ default: () => 'GitHubActions' }))
vi.mock('./CircleCI', () => ({ default: () => 'CircleCI' }))
vi.mock('./OtherCI', () => ({ default: () => 'OtherCI' }))
vi.mock('./ActivationBanner', () => ({ default: () => 'ActivationBanner' }))

const mockCurrentUser = {
  me: {
    trackingMetadata: {
      ownerid: 'user-owner-id',
    },
  },
}

const mockGetRepo = (
  noUploadToken = false,
  hasCommits = false,
  isCurrentUserActivated = false,
  isPrivate = false
) => ({
  owner: {
    isCurrentUserPartOfOrg: true,
    isAdmin: null,
    isCurrentUserActivated,
    repository: {
      __typename: 'Repository',
      private: isPrivate,
      uploadToken: noUploadToken
        ? null
        : '9e6a6189-20f1-482d-ab62-ecfaa2629295',
      defaultBranch: 'main',
      yaml: '',
      activated: false,
      oldestCommitAt: '',
      active: hasCommits,
      isFirstPullRequest: false,
    },
  },
})

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      suspense: true,
      retry: false,
    },
  },
})
const server = setupServer()
let testLocation: ReturnType<typeof useLocation>

const wrapper: (initialEntries?: string) => React.FC<PropsWithChildren> =
  (initialEntries = '/gh/codecov/cool-repo/new') =>
  ({ children }) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialEntries]}>
        <Route
          path={[
            '/:provider/:owner/:repo/new',
            '/:provider/:owner/:repo/new/circle-ci',
            '/:provider/:owner/:repo/new/other-ci',
          ]}
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
  console.error = () => {}
  server.listen()
})
afterEach(() => {
  queryClient.clear()
  server.resetHandlers()
})
afterAll(() => server.close())

interface SetupArgs {
  hasCommits?: boolean
  noUploadToken?: boolean
  isCurrentUserActivated?: boolean
  isPrivate?: boolean
}

describe('NewRepoTab', () => {
  function setup({
    hasCommits = false,
    noUploadToken = false,
    isCurrentUserActivated = false,
    isPrivate = false,
  }: SetupArgs) {
    const user = userEvent.setup()
    const hardRedirect = vi.fn()
    mocks.useRedirect.mockImplementation((data) => ({
      hardRedirect: () => hardRedirect(data),
    }))
    const mockMetricMutationVariables = vi.fn()
    const mockGetItem = vi.spyOn(window.localStorage.__proto__, 'getItem')
    mockGetItem.mockReturnValue(null)

    server.use(
      graphql.query('GetRepo', (info) => {
        return HttpResponse.json({
          data: mockGetRepo(
            noUploadToken,
            hasCommits,
            isCurrentUserActivated,
            isPrivate
          ),
        })
      }),
      graphql.query('CurrentUser', (info) => {
        return HttpResponse.json({ data: mockCurrentUser })
      }),
      graphql.mutation('storeEventMetric', (info) => {
        mockMetricMutationVariables(info?.variables)
        return HttpResponse.json({ data: { storeEventMetric: null } })
      })
    )

    return { hardRedirect, mockMetricMutationVariables, user }
  }

  it('renders intro blurb', async () => {
    setup({})
    render(<NewRepoTab />, { wrapper: wrapper() })

    const heading = await screen.findByRole('heading', {
      name: 'Coverage Analytics',
    })
    expect(heading).toBeInTheDocument()

    const blurb = await screen.findByText(
      /Before integrating with Codecov, ensure your project generates coverage reports,/
    )
    expect(blurb).toBeInTheDocument()
  })

  describe('CISelector', () => {
    it('renders', async () => {
      setup({})
      render(<NewRepoTab />, { wrapper: wrapper() })

      const selectorHeader = await screen.findByText('Select a setup option')
      expect(selectorHeader).toBeInTheDocument()

      const githubActions = await screen.findByText('Using GitHub Actions')
      const circleCI = await screen.findByText('Using Circle CI')
      const codecovCLI = await screen.findByText("Using Codecov's CLI")
      expect(githubActions).toBeInTheDocument()
      expect(circleCI).toBeInTheDocument()
      expect(codecovCLI).toBeInTheDocument()
    })

    describe('initial selection', () => {
      describe('when on GH provider and /new path', () => {
        it('selects GitHub Actions as default', async () => {
          setup({})
          render(<NewRepoTab />, { wrapper: wrapper() })

          const githubActions = await screen.findByTestId(
            'github-actions-radio'
          )
          expect(githubActions).toBeInTheDocument()
          expect(githubActions).toHaveAttribute('data-state', 'checked')
        })
      })

      describe('when on non GH provider and /new path', () => {
        it('selects Other CI as default', async () => {
          setup({})
          render(<NewRepoTab />, {
            wrapper: wrapper('/gl/codecov/cool-repo/new'),
          })

          const otherCI = await screen.findByTestId('other-ci-radio')
          expect(otherCI).toBeInTheDocument()
          expect(otherCI).toHaveAttribute('data-state', 'checked')
        })
      })

      describe('when on /new/circle-ci', () => {
        it('selects Circle CI as default', async () => {
          setup({})
          render(<NewRepoTab />, {
            wrapper: wrapper('/gl/codecov/cool-repo/new/circle-ci'),
          })

          const circleCI = await screen.findByTestId('circle-ci-radio')
          expect(circleCI).toBeInTheDocument()
          expect(circleCI).toHaveAttribute('data-state', 'checked')
        })
      })

      describe('when on /new/other-ci', () => {
        it('selects Other CI as default', async () => {
          setup({})
          render(<NewRepoTab />, {
            wrapper: wrapper('/gl/codecov/cool-repo/new/other-ci'),
          })

          const otherCI = await screen.findByTestId('other-ci-radio')
          expect(otherCI).toBeInTheDocument()
          expect(otherCI).toHaveAttribute('data-state', 'checked')
        })
      })
    })

    describe('navigation', () => {
      describe('when GitHub Actions is selected', () => {
        it('should navigate to /new', async () => {
          const { user, mockMetricMutationVariables } = setup({})
          render(<NewRepoTab />, {
            wrapper: wrapper('/gh/codecov/cool-repo/new/other-ci'),
          })

          const githubActions = await screen.findByTestId(
            'github-actions-radio'
          )
          expect(githubActions).toBeInTheDocument()
          expect(githubActions).toHaveAttribute('data-state', 'unchecked')

          await user.click(githubActions)

          expect(githubActions).toBeInTheDocument()
          expect(githubActions).toHaveAttribute('data-state', 'checked')
          expect(mockMetricMutationVariables).toHaveBeenCalled()
          expect(testLocation.pathname).toBe('/gh/codecov/cool-repo/new')
        })
      })

      describe('when Circle CI is selected', () => {
        it('should navigate to /new/circle-ci', async () => {
          const { user } = setup({})
          render(<NewRepoTab />, { wrapper: wrapper() })

          const circleCI = await screen.findByTestId('circle-ci-radio')
          expect(circleCI).toBeInTheDocument()
          expect(circleCI).toHaveAttribute('data-state', 'unchecked')

          await user.click(circleCI)

          expect(circleCI).toBeInTheDocument()
          expect(circleCI).toHaveAttribute('data-state', 'checked')

          expect(testLocation.pathname).toBe(
            '/gh/codecov/cool-repo/new/circle-ci'
          )
        })
      })

      describe('when Other CI is selected', () => {
        it('should navigate to /new/other-ci', async () => {
          const { user } = setup({})
          render(<NewRepoTab />, { wrapper: wrapper() })

          const otherCI = await screen.findByTestId('other-ci-radio')
          expect(otherCI).toBeInTheDocument()
          expect(otherCI).toHaveAttribute('data-state', 'unchecked')

          await user.click(otherCI)

          expect(otherCI).toBeInTheDocument()
          expect(otherCI).toHaveAttribute('data-state', 'checked')

          expect(testLocation.pathname).toBe(
            '/gh/codecov/cool-repo/new/other-ci'
          )
        })
      })
    })
  })

  describe('rendering component', () => {
    beforeEach(() =>
      setup({
        isPrivate: true,
      })
    )

    it('renders github actions', async () => {
      render(<NewRepoTab />, { wrapper: wrapper() })
      const content = await screen.findByText(/GitHubActions/)
      expect(content).toBeInTheDocument()
    })

    it('renders circle ci', async () => {
      render(<NewRepoTab />, {
        wrapper: wrapper('/gh/codecov/cool-repo/new/circle-ci'),
      })
      const content = await screen.findByText(/CircleCI/)
      expect(content).toBeInTheDocument()
    })

    it('renders other ci', async () => {
      render(<NewRepoTab />, {
        wrapper: wrapper('/gh/codecov/cool-repo/new/other-ci'),
      })
      const content = await screen.findByText(/OtherCI/)
      expect(content).toBeInTheDocument()
    })
  })

  describe('testing redirects', () => {
    describe('repo does not have an upload token', () => {
      it('redirects to provider', async () => {
        const { hardRedirect } = setup({ noUploadToken: true })
        render(<NewRepoTab />, { wrapper: wrapper() })

        await waitFor(() => expect(hardRedirect).toHaveBeenCalled())
      })

      it('displays 404', async () => {
        setup({ noUploadToken: true })
        render(<NewRepoTab />, { wrapper: wrapper() })

        const fourOhFour = await screen.findByText('Not found')
        expect(fourOhFour).toBeInTheDocument()
      })
    })
  })

  describe('ActivationBanner', () => {
    describe('when user is activated', () => {
      it('does not render ActivationBanner', async () => {
        setup({
          isCurrentUserActivated: true,
          isPrivate: true,
        })
        render(<NewRepoTab />, { wrapper: wrapper() })

        // Wait for full render
        expect(await screen.findByText(/GitHubActions/)).toBeInTheDocument()

        const banner = screen.queryByText(/ActivationBanner/)
        expect(banner).not.toBeInTheDocument()
      })
    })

    describe('when user is not activated but public repo', () => {
      it('does not render ActivationBanner', async () => {
        setup({
          isCurrentUserActivated: false,
          isPrivate: false,
        })
        render(<NewRepoTab />, { wrapper: wrapper() })

        // Wait for full render
        expect(await screen.findByText(/GitHubActions/)).toBeInTheDocument()

        const banner = screen.queryByText(/ActivationBanner/)
        expect(banner).not.toBeInTheDocument()
      })
    })

    describe('when user is not activated and is private repo', () => {
      it('renders ActivationBanner', async () => {
        setup({
          isCurrentUserActivated: false,
          isPrivate: true,
        })
        render(<NewRepoTab />, { wrapper: wrapper() })

        const banner = await screen.findByText(/ActivationBanner/)
        expect(banner).toBeInTheDocument()
      })
    })
  })
})
