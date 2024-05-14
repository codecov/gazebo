import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { Suspense } from 'react'
import { MemoryRouter, Route } from 'react-router-dom'

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

const wrapper =
  (
    initialEntries = '/gh/codecov/test-repo/bundles/new'
  ): React.FC<React.PropsWithChildren> =>
  ({ children }) =>
    (
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
    { hasCommits = false, hasUploadToken = false }: SetupArgs = {
      hasCommits: false,
      hasUploadToken: false,
    }
  ) {
    const hardRedirect = jest.fn()
    mockedUseRedirect.mockImplementation((data) => ({
      hardRedirect: () => hardRedirect(data),
    }))

    server.use(
      graphql.query('GetRepo', (req, res, ctx) =>
        res(ctx.status(200), ctx.data(mockGetRepo(hasUploadToken, hasCommits)))
      ),
      graphql.query('GetOrgUploadToken', (req, res, ctx) => {
        return res(ctx.status(200), ctx.data(mockGetOrgUploadToken))
      })
    )

    return { hardRedirect }
  }

  it('renders IntroBlurb', async () => {
    setup({ hasCommits: true, hasUploadToken: true })
    render(<BundleOnboarding />, { wrapper: wrapper() })

    const introBlurb = await screen.findByTestId('ba-intro-blurb')
    expect(introBlurb).toBeInTheDocument()
  })

  describe('on /new route', () => {
    describe('rendering tabs', () => {
      it('renders selected vite tab', async () => {
        setup({ hasCommits: true, hasUploadToken: true })
        render(<BundleOnboarding />, { wrapper: wrapper() })

        const viteTab = await screen.findByTestId('vite-radio')
        expect(viteTab).toBeInTheDocument()
        expect(viteTab).toHaveAttribute('data-state', 'checked')
      })

      it('renders rollup tab', async () => {
        setup({ hasCommits: true, hasUploadToken: true })
        render(<BundleOnboarding />, { wrapper: wrapper() })

        const rollupTab = await screen.findByTestId('rollup-radio')
        expect(rollupTab).toBeInTheDocument()
        expect(rollupTab).toHaveAttribute('data-state', 'unchecked')
      })

      it('renders webpack tab', async () => {
        setup({ hasCommits: true, hasUploadToken: true })
        render(<BundleOnboarding />, { wrapper: wrapper() })

        const webpackTab = await screen.findByTestId('webpack-radio')
        expect(webpackTab).toBeInTheDocument()
        expect(webpackTab).toHaveAttribute('data-state', 'unchecked')
      })
    })

    describe('rendering body', () => {
      it('renders vite onboarding', async () => {
        setup({ hasCommits: true, hasUploadToken: true })
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
        setup({ hasCommits: true, hasUploadToken: true })
        render(<BundleOnboarding />, {
          wrapper: wrapper('/gh/codecov/test-repo/bundles/new/rollup'),
        })

        const viteTab = await screen.findByTestId('vite-radio')
        expect(viteTab).toBeInTheDocument()
        expect(viteTab).toHaveAttribute('data-state', 'unchecked')
      })

      it('renders selected rollup tab', async () => {
        setup({ hasCommits: true, hasUploadToken: true })
        render(<BundleOnboarding />, {
          wrapper: wrapper('/gh/codecov/test-repo/bundles/new/rollup'),
        })

        const rollupTab = await screen.findByTestId('rollup-radio')
        expect(rollupTab).toBeInTheDocument()
        expect(rollupTab).toHaveAttribute('data-state', 'checked')
      })

      it('renders webpack tab', async () => {
        setup({ hasCommits: true, hasUploadToken: true })
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
        setup({ hasCommits: true, hasUploadToken: true })
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
        setup({ hasCommits: true, hasUploadToken: true })
        render(<BundleOnboarding />, {
          wrapper: wrapper('/gh/codecov/test-repo/bundles/new/webpack'),
        })

        const viteTab = await screen.findByTestId('vite-radio')
        expect(viteTab).toBeInTheDocument()
        expect(viteTab).toHaveAttribute('data-state', 'unchecked')
      })

      it('renders rollup tab', async () => {
        setup({ hasCommits: true, hasUploadToken: true })
        render(<BundleOnboarding />, {
          wrapper: wrapper('/gh/codecov/test-repo/bundles/new/webpack'),
        })

        const rollupTab = await screen.findByTestId('rollup-radio')
        expect(rollupTab).toBeInTheDocument()
        expect(rollupTab).toHaveAttribute('data-state', 'unchecked')
      })

      it('renders selected webpack tab', async () => {
        setup({ hasCommits: true, hasUploadToken: true })
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
        setup({ hasCommits: true, hasUploadToken: true })
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
      const { hardRedirect } = setup({ hasUploadToken: false })
      render(<BundleOnboarding />, { wrapper: wrapper() })

      await waitFor(() => expect(hardRedirect).toHaveBeenCalled())
    })

    it('displays 404', async () => {
      setup({ hasUploadToken: false })
      render(<BundleOnboarding />, { wrapper: wrapper() })

      const fourOhFour = await screen.findByText('Not found')
      expect(fourOhFour).toBeInTheDocument()
    })
  })
})
