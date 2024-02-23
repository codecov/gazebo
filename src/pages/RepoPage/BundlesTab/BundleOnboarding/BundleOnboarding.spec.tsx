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

jest.mock('./ViteOnboarding', () => () => <div>ViteOnboarding</div>)
jest.mock('./RollupOnboarding', () => () => <div>RollupOnboarding</div>)
jest.mock('./WebpackOnboarding', () => () => <div>WebpackOnboarding</div>)

const mockGetRepo = (hasUploadToken: boolean, isActive: boolean) => ({
  owner: {
    isCurrentUserPartOfOrg: true,
    repository: {
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
      )
    )

    return { hardRedirect }
  }

  describe('on /new route', () => {
    describe('rendering tabs', () => {
      it('renders selected vite tab', async () => {
        setup({ hasCommits: true, hasUploadToken: true })
        render(<BundleOnboarding />, { wrapper: wrapper() })

        const viteTab = await screen.findByText('Vite')
        expect(viteTab).toBeInTheDocument()
        expect(viteTab).toHaveAttribute('aria-current', 'page')
      })

      it('renders rollup tab', async () => {
        setup({ hasCommits: true, hasUploadToken: true })
        render(<BundleOnboarding />, { wrapper: wrapper() })

        const rollupTab = await screen.findByText('Rollup')
        expect(rollupTab).toBeInTheDocument()
        expect(rollupTab).not.toHaveAttribute('aria-current', 'page')
      })

      it('renders webpack tab', async () => {
        setup({ hasCommits: true, hasUploadToken: true })
        render(<BundleOnboarding />, { wrapper: wrapper() })

        const webpackTab = await screen.findByText('Webpack')
        expect(webpackTab).toBeInTheDocument()
        expect(webpackTab).not.toHaveAttribute('aria-current', 'page')
      })
    })

    describe('rendering body', () => {
      it('renders vite onboarding', async () => {
        setup({ hasCommits: true, hasUploadToken: true })
        render(<BundleOnboarding />, { wrapper: wrapper() })

        const viteOnboarding = await screen.findByText('ViteOnboarding')
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

        const viteTab = await screen.findByText('Vite')
        expect(viteTab).toBeInTheDocument()
        expect(viteTab).not.toHaveAttribute('aria-current', 'page')
      })

      it('renders selected rollup tab', async () => {
        setup({ hasCommits: true, hasUploadToken: true })
        render(<BundleOnboarding />, {
          wrapper: wrapper('/gh/codecov/test-repo/bundles/new/rollup'),
        })

        const rollupTab = await screen.findByText('Rollup')
        expect(rollupTab).toBeInTheDocument()
        expect(rollupTab).toHaveAttribute('aria-current', 'page')
      })

      it('renders webpack tab', async () => {
        setup({ hasCommits: true, hasUploadToken: true })
        render(<BundleOnboarding />, {
          wrapper: wrapper('/gh/codecov/test-repo/bundles/new/rollup'),
        })

        const webpackTab = await screen.findByText('Webpack')
        expect(webpackTab).toBeInTheDocument()
        expect(webpackTab).not.toHaveAttribute('aria-current', 'page')
      })
    })

    describe('rendering body', () => {
      it('renders rollup onboarding', async () => {
        setup({ hasCommits: true, hasUploadToken: true })
        render(<BundleOnboarding />, {
          wrapper: wrapper('/gh/codecov/test-repo/bundles/new/rollup'),
        })

        const rollupOnboarding = await screen.findByText('RollupOnboarding')
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

        const viteTab = await screen.findByText('Vite')
        expect(viteTab).toBeInTheDocument()
        expect(viteTab).not.toHaveAttribute('aria-current', 'page')
      })

      it('renders rollup tab', async () => {
        setup({ hasCommits: true, hasUploadToken: true })
        render(<BundleOnboarding />, {
          wrapper: wrapper('/gh/codecov/test-repo/bundles/new/webpack'),
        })

        const rollupTab = await screen.findByText('Rollup')
        expect(rollupTab).toBeInTheDocument()
        expect(rollupTab).not.toHaveAttribute('aria-current', 'page')
      })

      it('renders selected webpack tab', async () => {
        setup({ hasCommits: true, hasUploadToken: true })
        render(<BundleOnboarding />, {
          wrapper: wrapper('/gh/codecov/test-repo/bundles/new/webpack'),
        })

        const webpackTab = await screen.findByText('Webpack')
        expect(webpackTab).toBeInTheDocument()
        expect(webpackTab).toHaveAttribute('aria-current', 'page')
      })
    })

    describe('rendering body', () => {
      it('renders webpack onboarding', async () => {
        setup({ hasCommits: true, hasUploadToken: true })
        render(<BundleOnboarding />, {
          wrapper: wrapper('/gh/codecov/test-repo/bundles/new/webpack'),
        })

        const webpackOnboarding = await screen.findByText('WebpackOnboarding')
        expect(webpackOnboarding).toBeInTheDocument()
      })
    })
  })

  describe('upload token is not present', () => {
    it('redirects to provider', async () => {
      const { hardRedirect } = setup({ hasUploadToken: false })
      render(<BundleOnboarding />, { wrapper: wrapper() })

      await waitFor(() => expect(hardRedirect).toBeCalled())
    })

    it('displays 404', async () => {
      setup({ hasUploadToken: false })
      render(<BundleOnboarding />, { wrapper: wrapper() })

      const fourOhFour = await screen.findByText('Not found')
      expect(fourOhFour).toBeInTheDocument()
    })
  })
})
