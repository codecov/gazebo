import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { Suspense } from 'react'
import { MemoryRouter, Route, useLocation } from 'react-router-dom'

import { useRedirect } from 'shared/useRedirect'

import BundleOnboarding from './BundleOnboarding'

jest.mock('shared/useRedirect')
const mockedUseRedirect = useRedirect as jest.Mock

const mockGetRepo = (hasUploadToken: boolean, isActive: boolean) => ({
  owner: {
    isCurrentUserPartOfOrg: true,
    orgUploadToken: hasUploadToken
      ? '9e6a6189-20f1-482d-ab62-ecfaa2629290'
      : null,
    isAdmin: null,
    isCurrentUserActivated: null,
    repository: {
      __typename: 'Repository',
      private: false,
      uploadToken: hasUploadToken
        ? '9e6a6189-20f1-482d-ab62-ecfaa2629295'
        : null,
      defaultBranch: 'main',
      yaml: '',
      activated: false,
      oldestCommitAt: '',
      active: isActive,
      isFirstPullRequest: false,
    },
  },
})

const mockGetOrgUploadToken = {
  owner: {
    orgUploadToken: '9e6a6189-20f1-482d-ab62-ecfaa2629290',
  },
}

const server = setupServer()
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      suspense: true,
    },
  },
})
let testLocation: ReturnType<typeof useLocation>

const wrapper =
  (
    initialEntries = '/gh/codecov/test-repo/bundles/new'
  ): React.FC<React.PropsWithChildren> =>
  ({ children }) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialEntries]}>
        <Route
          path={[
            '/:provider/:owner/:repo/bundles/new',
            '/:provider/:owner/:repo/bundles/new/rollup',
            '/:provider/:owner/:repo/bundles/new/webpack',
            '/:provider',
          ]}
        >
          <Suspense fallback={<p>Loading</p>}>{children}</Suspense>
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

interface SetupArgs {
  hasCommits?: boolean
  hasUploadToken?: boolean
}

describe('BundleOnboarding', () => {
  function setup(
    { hasCommits = true, hasUploadToken = true }: SetupArgs = {
      hasCommits: true,
      hasUploadToken: true,
    }
  ) {
    const user = userEvent.setup()
    const hardRedirect = jest.fn()
    mockedUseRedirect.mockImplementation((data) => ({
      hardRedirect: () => hardRedirect(data),
    }))
    const mockMetricMutationVariables = jest.fn()
    const mockGetItem = jest.spyOn(window.localStorage.__proto__, 'getItem')
    mockGetItem.mockReturnValue(null)

    server.use(
      graphql.query('GetRepo', (req, res, ctx) =>
        res(ctx.status(200), ctx.data(mockGetRepo(hasUploadToken, hasCommits)))
      ),
      graphql.query('GetOrgUploadToken', (req, res, ctx) => {
        return res(ctx.status(200), ctx.data(mockGetOrgUploadToken))
      }),
      graphql.mutation('storeEventMetric', (req, res, ctx) => {
        mockMetricMutationVariables(req?.variables)
        return res(ctx.status(200), ctx.data({ storeEventMetric: null }))
      })
    )

    return { hardRedirect, mockMetricMutationVariables, user }
  }

  it('renders IntroBlurb', async () => {
    setup({})
    render(<BundleOnboarding />, { wrapper: wrapper() })

    const introBlurb = await screen.findByTestId('ba-intro-blurb')
    expect(introBlurb).toBeInTheDocument()
  })

  describe('navigation', () => {
    describe('when Vite is selected', () => {
      it('should navigate to /new', async () => {
        const { user, mockMetricMutationVariables } = setup({})
        render(<BundleOnboarding />, {
          wrapper: wrapper('/gh/codecov/test-repo/bundles/new/rollup'),
        })

        const vite = await screen.findByTestId('vite-radio')
        expect(vite).toBeInTheDocument()
        expect(vite).toHaveAttribute('data-state', 'unchecked')

        await user.click(vite)
        expect(mockMetricMutationVariables).toHaveBeenCalled()

        expect(vite).toBeInTheDocument()
        expect(vite).toHaveAttribute('data-state', 'checked')
        expect(testLocation.pathname).toBe('/gh/codecov/test-repo/bundles/new')
      })
    })

    describe('when Rollup is selected', () => {
      it('should navigate to /new/rollup', async () => {
        const { user } = setup({})
        render(<BundleOnboarding />, { wrapper: wrapper() })

        const rollup = await screen.findByTestId('rollup-radio')
        expect(rollup).toBeInTheDocument()
        expect(rollup).toHaveAttribute('data-state', 'unchecked')

        await user.click(rollup)

        expect(rollup).toBeInTheDocument()
        expect(rollup).toHaveAttribute('data-state', 'checked')

        expect(testLocation.pathname).toBe(
          '/gh/codecov/test-repo/bundles/new/rollup'
        )
      })
    })

    describe('when Webpack is selected', () => {
      it('should navigate to /new/webpack', async () => {
        const { user } = setup({})
        render(<BundleOnboarding />, { wrapper: wrapper() })

        const webpack = await screen.findByTestId('webpack-radio')
        expect(webpack).toBeInTheDocument()
        expect(webpack).toHaveAttribute('data-state', 'unchecked')

        await user.click(webpack)

        expect(webpack).toBeInTheDocument()
        expect(webpack).toHaveAttribute('data-state', 'checked')

        expect(testLocation.pathname).toBe(
          '/gh/codecov/test-repo/bundles/new/webpack'
        )
      })
    })
  })

  describe('on /new route', () => {
    describe('rendering tabs', () => {
      it('renders selected vite tab', async () => {
        setup({})
        render(<BundleOnboarding />, { wrapper: wrapper() })

        const viteTab = await screen.findByTestId('vite-radio')
        expect(viteTab).toBeInTheDocument()
        expect(viteTab).toHaveAttribute('data-state', 'checked')
      })

      it('renders rollup tab', async () => {
        setup({})
        render(<BundleOnboarding />, { wrapper: wrapper() })

        const rollupTab = await screen.findByTestId('rollup-radio')
        expect(rollupTab).toBeInTheDocument()
        expect(rollupTab).toHaveAttribute('data-state', 'unchecked')
      })

      it('renders webpack tab', async () => {
        setup({})
        render(<BundleOnboarding />, { wrapper: wrapper() })

        const webpackTab = await screen.findByTestId('webpack-radio')
        expect(webpackTab).toBeInTheDocument()
        expect(webpackTab).toHaveAttribute('data-state', 'unchecked')
      })
    })

    describe('rendering body', () => {
      it('renders vite onboarding', async () => {
        setup({})
        render(<BundleOnboarding />, { wrapper: wrapper() })

        const viteOnboarding = await screen.findByText(
          /Install the Codecov Vite Plugin/
        )
        expect(viteOnboarding).toBeInTheDocument()
      })
    })
  })

  describe('on /new/rollup route', () => {
    describe('rendering tabs', () => {
      it('renders vite tab', async () => {
        setup({})
        render(<BundleOnboarding />, {
          wrapper: wrapper('/gh/codecov/test-repo/bundles/new/rollup'),
        })

        const viteTab = await screen.findByTestId('vite-radio')
        expect(viteTab).toBeInTheDocument()
        expect(viteTab).toHaveAttribute('data-state', 'unchecked')
      })

      it('renders selected rollup tab', async () => {
        setup({})
        render(<BundleOnboarding />, {
          wrapper: wrapper('/gh/codecov/test-repo/bundles/new/rollup'),
        })

        const rollupTab = await screen.findByTestId('rollup-radio')
        expect(rollupTab).toBeInTheDocument()
        expect(rollupTab).toHaveAttribute('data-state', 'checked')
      })

      it('renders webpack tab', async () => {
        setup({})
        render(<BundleOnboarding />, {
          wrapper: wrapper('/gh/codecov/test-repo/bundles/new/rollup'),
        })

        const webpackTab = await screen.findByTestId('webpack-radio')
        expect(webpackTab).toBeInTheDocument()
        expect(webpackTab).toHaveAttribute('data-state', 'unchecked')
      })
    })

    describe('rendering body', () => {
      it('renders rollup onboarding', async () => {
        setup({})
        render(<BundleOnboarding />, {
          wrapper: wrapper('/gh/codecov/test-repo/bundles/new/rollup'),
        })

        const rollupOnboarding = await screen.findByText(
          /Install the Codecov Rollup Plugin/
        )
        expect(rollupOnboarding).toBeInTheDocument()
      })
    })
  })

  describe('on /new/webpack route', () => {
    describe('rendering tabs', () => {
      it('renders vite tab', async () => {
        setup({})
        render(<BundleOnboarding />, {
          wrapper: wrapper('/gh/codecov/test-repo/bundles/new/webpack'),
        })

        const viteTab = await screen.findByTestId('vite-radio')
        expect(viteTab).toBeInTheDocument()
        expect(viteTab).toHaveAttribute('data-state', 'unchecked')
      })

      it('renders rollup tab', async () => {
        setup({})
        render(<BundleOnboarding />, {
          wrapper: wrapper('/gh/codecov/test-repo/bundles/new/webpack'),
        })

        const rollupTab = await screen.findByTestId('rollup-radio')
        expect(rollupTab).toBeInTheDocument()
        expect(rollupTab).toHaveAttribute('data-state', 'unchecked')
      })

      it('renders selected webpack tab', async () => {
        setup({})
        render(<BundleOnboarding />, {
          wrapper: wrapper('/gh/codecov/test-repo/bundles/new/webpack'),
        })

        const webpackTab = await screen.findByTestId('webpack-radio')
        expect(webpackTab).toBeInTheDocument()
        expect(webpackTab).toHaveAttribute('data-state', 'checked')
      })
    })

    describe('rendering body', () => {
      it('renders webpack onboarding', async () => {
        setup({})
        render(<BundleOnboarding />, {
          wrapper: wrapper('/gh/codecov/test-repo/bundles/new/webpack'),
        })

        const webpackOnboarding = await screen.findByText(
          /Install the Codecov Webpack Plugin/
        )
        expect(webpackOnboarding).toBeInTheDocument()
      })
    })
  })

  describe('upload token is not present', () => {
    it('redirects to provider', async () => {
      const { hardRedirect } = setup({
        hasCommits: false,
        hasUploadToken: false,
      })
      render(<BundleOnboarding />, { wrapper: wrapper() })

      await waitFor(() => expect(hardRedirect).toHaveBeenCalled())
    })

    it('displays 404', async () => {
      setup({ hasCommits: false, hasUploadToken: false })
      render(<BundleOnboarding />, { wrapper: wrapper() })

      const fourOhFour = await screen.findByText('Not found')
      expect(fourOhFour).toBeInTheDocument()
    })
  })
})
