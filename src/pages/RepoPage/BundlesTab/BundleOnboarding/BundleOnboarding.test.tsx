import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { graphql, HttpResponse } from 'msw2'
import { setupServer } from 'msw2/node'
import { Suspense } from 'react'
import { MemoryRouter, Route, useLocation } from 'react-router-dom'

import BundleOnboarding from './BundleOnboarding'

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
            '/:provider/:owner/:repo/bundles/new/remix',
            '/:provider/:owner/:repo/bundles/new/sveltekit',
            '/:provider/:owner/:repo/bundles/new/solidstart',
            '/:provider/:owner/:repo/bundles/new/nuxt',
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
          data: mockGetRepo(hasUploadToken, hasCommits),
        })
      }),
      graphql.query('GetOrgUploadToken', (info) => {
        return HttpResponse.json({ data: mockGetOrgUploadToken })
      }),
      graphql.mutation('storeEventMetric', (info) => {
        mockMetricMutationVariables(info.variables)
        return HttpResponse.json({ data: { storeEventMetric: null } })
      })
    )

    return { hardRedirect, mockMetricMutationVariables, user }
  }

  it('renders intro', async () => {
    setup({})
    render(<BundleOnboarding />, { wrapper: wrapper() })

    const heading = await screen.findByRole('heading', {
      name: 'Bundle Analysis',
    })
    expect(heading).toBeInTheDocument()

    const blurb = await screen.findByText(
      /Javascript Bundle Analysis helps you improves your application's performance, bandwidth usage, and load times/
    )
    expect(blurb).toBeInTheDocument()
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

    describe('when Remix (Vite) is selected', () => {
      it('should navigate to /new/remix-vite', async () => {
        const { user } = setup({})
        render(<BundleOnboarding />, { wrapper: wrapper() })

        const remix = await screen.findByTestId('remix-radio')
        expect(remix).toBeInTheDocument()
        expect(remix).toHaveAttribute('data-state', 'unchecked')

        await user.click(remix)

        expect(remix).toBeInTheDocument()
        expect(remix).toHaveAttribute('data-state', 'checked')

        expect(testLocation.pathname).toBe(
          '/gh/codecov/test-repo/bundles/new/remix-vite'
        )
      })
    })

    describe('when SvelteKit is selected', () => {
      it('should navigate to /new/sveltekit', async () => {
        const { user } = setup({})
        render(<BundleOnboarding />, { wrapper: wrapper() })

        const sveltekit = await screen.findByTestId('sveltekit-radio')
        expect(sveltekit).toBeInTheDocument()
        expect(sveltekit).toHaveAttribute('data-state', 'unchecked')

        await user.click(sveltekit)

        expect(sveltekit).toBeInTheDocument()
        expect(sveltekit).toHaveAttribute('data-state', 'checked')

        expect(testLocation.pathname).toBe(
          '/gh/codecov/test-repo/bundles/new/sveltekit'
        )
      })
    })

    describe('when SolidStart is selected', () => {
      it('should navigate to /new/solidstart', async () => {
        const { user } = setup({})
        render(<BundleOnboarding />, { wrapper: wrapper() })

        const solidstart = await screen.findByTestId('solidstart-radio')
        expect(solidstart).toBeInTheDocument()
        expect(solidstart).toHaveAttribute('data-state', 'unchecked')

        await user.click(solidstart)

        expect(solidstart).toBeInTheDocument()
        expect(solidstart).toHaveAttribute('data-state', 'checked')

        expect(testLocation.pathname).toBe(
          '/gh/codecov/test-repo/bundles/new/solidstart'
        )
      })
    })

    describe('when Nuxt is selected', () => {
      it('should navigate to /new/nuxt', async () => {
        const { user } = setup({})
        render(<BundleOnboarding />, { wrapper: wrapper() })

        const nuxt = await screen.findByTestId('nuxt-radio')
        expect(nuxt).toBeInTheDocument()
        expect(nuxt).toHaveAttribute('data-state', 'unchecked')

        await user.click(nuxt)

        expect(nuxt).toBeInTheDocument()
        expect(nuxt).toHaveAttribute('data-state', 'checked')

        expect(testLocation.pathname).toBe(
          '/gh/codecov/test-repo/bundles/new/nuxt'
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

      it('renders remix tab', async () => {
        setup({})
        render(<BundleOnboarding />, { wrapper: wrapper() })

        const remixTab = await screen.findByTestId('remix-radio')
        expect(remixTab).toBeInTheDocument()
        expect(remixTab).toHaveAttribute('data-state', 'unchecked')
      })

      it('renders nuxt tab', async () => {
        setup({})
        render(<BundleOnboarding />, { wrapper: wrapper() })

        const nuxtTab = await screen.findByTestId('nuxt-radio')
        expect(nuxtTab).toBeInTheDocument()
        expect(nuxtTab).toHaveAttribute('data-state', 'unchecked')
      })

      it('renders solidstart tab', async () => {
        setup({})
        render(<BundleOnboarding />, { wrapper: wrapper() })

        const solidstartTab = await screen.findByTestId('solidstart-radio')
        expect(solidstartTab).toBeInTheDocument()
        expect(solidstartTab).toHaveAttribute('data-state', 'unchecked')
      })

      it('renders sveltekit tab', async () => {
        setup({})
        render(<BundleOnboarding />, { wrapper: wrapper() })

        const sveltekitTab = await screen.findByTestId('sveltekit-radio')
        expect(sveltekitTab).toBeInTheDocument()
        expect(sveltekitTab).toHaveAttribute('data-state', 'unchecked')
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

      it('renders remix tab', async () => {
        setup({})
        render(<BundleOnboarding />, {
          wrapper: wrapper('/gh/codecov/test-repo/bundles/new/rollup'),
        })

        const remixTab = await screen.findByTestId('remix-radio')
        expect(remixTab).toBeInTheDocument()
        expect(remixTab).toHaveAttribute('data-state', 'unchecked')
      })

      it('renders nuxt tab', async () => {
        setup({})
        render(<BundleOnboarding />, {
          wrapper: wrapper('/gh/codecov/test-repo/bundles/new/rollup'),
        })

        const nuxtTab = await screen.findByTestId('nuxt-radio')
        expect(nuxtTab).toBeInTheDocument()
        expect(nuxtTab).toHaveAttribute('data-state', 'unchecked')
      })

      it('renders solidstart tab', async () => {
        setup({})
        render(<BundleOnboarding />, {
          wrapper: wrapper('/gh/codecov/test-repo/bundles/new/rollup'),
        })

        const solidstartTab = await screen.findByTestId('solidstart-radio')
        expect(solidstartTab).toBeInTheDocument()
        expect(solidstartTab).toHaveAttribute('data-state', 'unchecked')
      })

      it('renders sveltekit tab', async () => {
        setup({})
        render(<BundleOnboarding />, {
          wrapper: wrapper('/gh/codecov/test-repo/bundles/new/rollup'),
        })

        const sveltekitTab = await screen.findByTestId('sveltekit-radio')
        expect(sveltekitTab).toBeInTheDocument()
        expect(sveltekitTab).toHaveAttribute('data-state', 'unchecked')
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

      it('renders remix tab', async () => {
        setup({})
        render(<BundleOnboarding />, {
          wrapper: wrapper('/gh/codecov/test-repo/bundles/new/webpack'),
        })

        const remixTab = await screen.findByTestId('remix-radio')
        expect(remixTab).toBeInTheDocument()
        expect(remixTab).toHaveAttribute('data-state', 'unchecked')
      })

      it('renders nuxt tab', async () => {
        setup({})
        render(<BundleOnboarding />, {
          wrapper: wrapper('/gh/codecov/test-repo/bundles/new/webpack'),
        })

        const nuxtTab = await screen.findByTestId('nuxt-radio')
        expect(nuxtTab).toBeInTheDocument()
        expect(nuxtTab).toHaveAttribute('data-state', 'unchecked')
      })

      it('renders solidstart tab', async () => {
        setup({})
        render(<BundleOnboarding />, {
          wrapper: wrapper('/gh/codecov/test-repo/bundles/new/webpack'),
        })

        const solidstartTab = await screen.findByTestId('solidstart-radio')
        expect(solidstartTab).toBeInTheDocument()
        expect(solidstartTab).toHaveAttribute('data-state', 'unchecked')
      })

      it('renders sveltekit tab', async () => {
        setup({})
        render(<BundleOnboarding />, {
          wrapper: wrapper('/gh/codecov/test-repo/bundles/new/webpack'),
        })

        const sveltekitTab = await screen.findByTestId('sveltekit-radio')
        expect(sveltekitTab).toBeInTheDocument()
        expect(sveltekitTab).toHaveAttribute('data-state', 'unchecked')
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

  describe('on /new/remix-vite route', () => {
    describe('rendering tabs', () => {
      it('renders vite tab', async () => {
        setup({})
        render(<BundleOnboarding />, {
          wrapper: wrapper('/gh/codecov/test-repo/bundles/new/remix-vite'),
        })

        const viteTab = await screen.findByTestId('vite-radio')
        expect(viteTab).toBeInTheDocument()
        expect(viteTab).toHaveAttribute('data-state', 'unchecked')
      })

      it('renders rollup tab', async () => {
        setup({})
        render(<BundleOnboarding />, {
          wrapper: wrapper('/gh/codecov/test-repo/bundles/new/remix-vite'),
        })

        const rollupTab = await screen.findByTestId('rollup-radio')
        expect(rollupTab).toBeInTheDocument()
        expect(rollupTab).toHaveAttribute('data-state', 'unchecked')
      })

      it('renders webpack tab', async () => {
        setup({})
        render(<BundleOnboarding />, {
          wrapper: wrapper('/gh/codecov/test-repo/bundles/new/remix-vite'),
        })

        const webpackTab = await screen.findByTestId('webpack-radio')
        expect(webpackTab).toBeInTheDocument()
        expect(webpackTab).toHaveAttribute('data-state', 'unchecked')
      })

      it('renders selected remix tab', async () => {
        setup({})
        render(<BundleOnboarding />, {
          wrapper: wrapper('/gh/codecov/test-repo/bundles/new/remix-vite'),
        })

        const remixTab = await screen.findByTestId('remix-radio')
        expect(remixTab).toBeInTheDocument()
        expect(remixTab).toHaveAttribute('data-state', 'checked')
      })

      it('renders nuxt tab', async () => {
        setup({})
        render(<BundleOnboarding />, {
          wrapper: wrapper('/gh/codecov/test-repo/bundles/new/remix-vite'),
        })

        const nuxtTab = await screen.findByTestId('nuxt-radio')
        expect(nuxtTab).toBeInTheDocument()
        expect(nuxtTab).toHaveAttribute('data-state', 'unchecked')
      })

      it('renders solidstart tab', async () => {
        setup({})
        render(<BundleOnboarding />, {
          wrapper: wrapper('/gh/codecov/test-repo/bundles/new/remix-vite'),
        })

        const solidstartTab = await screen.findByTestId('solidstart-radio')
        expect(solidstartTab).toBeInTheDocument()
        expect(solidstartTab).toHaveAttribute('data-state', 'unchecked')
      })

      it('renders sveltekit tab', async () => {
        setup({})
        render(<BundleOnboarding />, {
          wrapper: wrapper('/gh/codecov/test-repo/bundles/new/remix-vite'),
        })

        const sveltekitTab = await screen.findByTestId('sveltekit-radio')
        expect(sveltekitTab).toBeInTheDocument()
        expect(sveltekitTab).toHaveAttribute('data-state', 'unchecked')
      })
    })

    describe('rendering body', () => {
      it('renders webpack onboarding', async () => {
        setup({})
        render(<BundleOnboarding />, {
          wrapper: wrapper('/gh/codecov/test-repo/bundles/new/remix-vite'),
        })

        const webpackOnboarding = await screen.findByText(
          /Install the Codecov Remix (Vite) Plugin/
        )
        expect(webpackOnboarding).toBeInTheDocument()
      })
    })
  })

  describe('on /new/nuxt route', () => {
    describe('rendering tabs', () => {
      it('renders vite tab', async () => {
        setup({})
        render(<BundleOnboarding />, {
          wrapper: wrapper('/gh/codecov/test-repo/bundles/new/nuxt'),
        })

        const viteTab = await screen.findByTestId('vite-radio')
        expect(viteTab).toBeInTheDocument()
        expect(viteTab).toHaveAttribute('data-state', 'unchecked')
      })

      it('renders rollup tab', async () => {
        setup({})
        render(<BundleOnboarding />, {
          wrapper: wrapper('/gh/codecov/test-repo/bundles/new/nuxt'),
        })

        const rollupTab = await screen.findByTestId('rollup-radio')
        expect(rollupTab).toBeInTheDocument()
        expect(rollupTab).toHaveAttribute('data-state', 'unchecked')
      })

      it('renders webpack tab', async () => {
        setup({})
        render(<BundleOnboarding />, {
          wrapper: wrapper('/gh/codecov/test-repo/bundles/new/nuxt'),
        })

        const webpackTab = await screen.findByTestId('webpack-radio')
        expect(webpackTab).toBeInTheDocument()
        expect(webpackTab).toHaveAttribute('data-state', 'unchecked')
      })

      it('renders remix tab', async () => {
        setup({})
        render(<BundleOnboarding />, {
          wrapper: wrapper('/gh/codecov/test-repo/bundles/new/nuxt'),
        })

        const remixTab = await screen.findByTestId('remix-radio')
        expect(remixTab).toBeInTheDocument()
        expect(remixTab).toHaveAttribute('data-state', 'unchecked')
      })

      it('renders selected nuxt tab', async () => {
        setup({})
        render(<BundleOnboarding />, {
          wrapper: wrapper('/gh/codecov/test-repo/bundles/new/nuxt'),
        })

        const nuxtTab = await screen.findByTestId('nuxt-radio')
        expect(nuxtTab).toBeInTheDocument()
        expect(nuxtTab).toHaveAttribute('data-state', 'checked')
      })

      it('renders solidstart tab', async () => {
        setup({})
        render(<BundleOnboarding />, {
          wrapper: wrapper('/gh/codecov/test-repo/bundles/new/nuxt'),
        })

        const solidstartTab = await screen.findByTestId('solidstart-radio')
        expect(solidstartTab).toBeInTheDocument()
        expect(solidstartTab).toHaveAttribute('data-state', 'unchecked')
      })

      it('renders sveltekit tab', async () => {
        setup({})
        render(<BundleOnboarding />, {
          wrapper: wrapper('/gh/codecov/test-repo/bundles/new/nuxt'),
        })

        const sveltekitTab = await screen.findByTestId('sveltekit-radio')
        expect(sveltekitTab).toBeInTheDocument()
        expect(sveltekitTab).toHaveAttribute('data-state', 'unchecked')
      })
    })

    describe('rendering body', () => {
      it('renders webpack onboarding', async () => {
        setup({})
        render(<BundleOnboarding />, {
          wrapper: wrapper('/gh/codecov/test-repo/bundles/new/nuxt'),
        })

        const webpackOnboarding = await screen.findByText(
          /Install the Codecov Nuxt Plugin/
        )
        expect(webpackOnboarding).toBeInTheDocument()
      })
    })
  })

  describe('on /new/sveltekit route', () => {
    describe('rendering tabs', () => {
      it('renders vite tab', async () => {
        setup({})
        render(<BundleOnboarding />, {
          wrapper: wrapper('/gh/codecov/test-repo/bundles/new/sveltekit'),
        })

        const viteTab = await screen.findByTestId('vite-radio')
        expect(viteTab).toBeInTheDocument()
        expect(viteTab).toHaveAttribute('data-state', 'unchecked')
      })

      it('renders rollup tab', async () => {
        setup({})
        render(<BundleOnboarding />, {
          wrapper: wrapper('/gh/codecov/test-repo/bundles/new/sveltekit'),
        })

        const rollupTab = await screen.findByTestId('rollup-radio')
        expect(rollupTab).toBeInTheDocument()
        expect(rollupTab).toHaveAttribute('data-state', 'unchecked')
      })

      it('renders webpack tab', async () => {
        setup({})
        render(<BundleOnboarding />, {
          wrapper: wrapper('/gh/codecov/test-repo/bundles/new/sveltekit'),
        })

        const webpackTab = await screen.findByTestId('webpack-radio')
        expect(webpackTab).toBeInTheDocument()
        expect(webpackTab).toHaveAttribute('data-state', 'unchecked')
      })

      it('renders remix tab', async () => {
        setup({})
        render(<BundleOnboarding />, {
          wrapper: wrapper('/gh/codecov/test-repo/bundles/new/sveltekit'),
        })

        const remixTab = await screen.findByTestId('remix-radio')
        expect(remixTab).toBeInTheDocument()
        expect(remixTab).toHaveAttribute('data-state', 'unchecked')
      })

      it('renders nuxt tab', async () => {
        setup({})
        render(<BundleOnboarding />, {
          wrapper: wrapper('/gh/codecov/test-repo/bundles/new/sveltekit'),
        })

        const nuxtTab = await screen.findByTestId('nuxt-radio')
        expect(nuxtTab).toBeInTheDocument()
        expect(nuxtTab).toHaveAttribute('data-state', 'unchecked')
      })

      it('renders solidstart tab', async () => {
        setup({})
        render(<BundleOnboarding />, {
          wrapper: wrapper('/gh/codecov/test-repo/bundles/new/sveltekit'),
        })

        const solidstartTab = await screen.findByTestId('solidstart-radio')
        expect(solidstartTab).toBeInTheDocument()
        expect(solidstartTab).toHaveAttribute('data-state', 'unchecked')
      })

      it('renders selected sveltekit tab', async () => {
        setup({})
        render(<BundleOnboarding />, {
          wrapper: wrapper('/gh/codecov/test-repo/bundles/new/sveltekit'),
        })

        const sveltekitTab = await screen.findByTestId('sveltekit-radio')
        expect(sveltekitTab).toBeInTheDocument()
        expect(sveltekitTab).toHaveAttribute('data-state', 'checked')
      })
    })

    describe('rendering body', () => {
      it('renders webpack onboarding', async () => {
        setup({})
        render(<BundleOnboarding />, {
          wrapper: wrapper('/gh/codecov/test-repo/bundles/new/sveltekit'),
        })

        const webpackOnboarding = await screen.findByText(
          /Install the Codecov SvelteKit Plugin/
        )
        expect(webpackOnboarding).toBeInTheDocument()
      })
    })
  })

  describe('on /new/solidstart route', () => {
    describe('rendering tabs', () => {
      it('renders vite tab', async () => {
        setup({})
        render(<BundleOnboarding />, {
          wrapper: wrapper('/gh/codecov/test-repo/bundles/new/solidstart'),
        })

        const viteTab = await screen.findByTestId('vite-radio')
        expect(viteTab).toBeInTheDocument()
        expect(viteTab).toHaveAttribute('data-state', 'unchecked')
      })

      it('renders rollup tab', async () => {
        setup({})
        render(<BundleOnboarding />, {
          wrapper: wrapper('/gh/codecov/test-repo/bundles/new/solidstart'),
        })

        const rollupTab = await screen.findByTestId('rollup-radio')
        expect(rollupTab).toBeInTheDocument()
        expect(rollupTab).toHaveAttribute('data-state', 'unchecked')
      })

      it('renders webpack tab', async () => {
        setup({})
        render(<BundleOnboarding />, {
          wrapper: wrapper('/gh/codecov/test-repo/bundles/new/solidstart'),
        })

        const webpackTab = await screen.findByTestId('webpack-radio')
        expect(webpackTab).toBeInTheDocument()
        expect(webpackTab).toHaveAttribute('data-state', 'unchecked')
      })

      it('renders remix tab', async () => {
        setup({})
        render(<BundleOnboarding />, {
          wrapper: wrapper('/gh/codecov/test-repo/bundles/new/solidstart'),
        })

        const remixTab = await screen.findByTestId('remix-radio')
        expect(remixTab).toBeInTheDocument()
        expect(remixTab).toHaveAttribute('data-state', 'unchecked')
      })

      it('renders nuxt tab', async () => {
        setup({})
        render(<BundleOnboarding />, {
          wrapper: wrapper('/gh/codecov/test-repo/bundles/new/solidstart'),
        })

        const nuxtTab = await screen.findByTestId('nuxt-radio')
        expect(nuxtTab).toBeInTheDocument()
        expect(nuxtTab).toHaveAttribute('data-state', 'unchecked')
      })

      it('renders selected solidstart tab', async () => {
        setup({})
        render(<BundleOnboarding />, {
          wrapper: wrapper('/gh/codecov/test-repo/bundles/new/solidstart'),
        })

        const solidstartTab = await screen.findByTestId('solidstart-radio')
        expect(solidstartTab).toBeInTheDocument()
        expect(solidstartTab).toHaveAttribute('data-state', 'checked')
      })

      it('renders sveltekit tab', async () => {
        setup({})
        render(<BundleOnboarding />, {
          wrapper: wrapper('/gh/codecov/test-repo/bundles/new/solidstart'),
        })

        const sveltekitTab = await screen.findByTestId('sveltekit-radio')
        expect(sveltekitTab).toBeInTheDocument()
        expect(sveltekitTab).toHaveAttribute('data-state', 'unchecked')
      })
    })

    describe('rendering body', () => {
      it('renders webpack onboarding', async () => {
        setup({})
        render(<BundleOnboarding />, {
          wrapper: wrapper('/gh/codecov/test-repo/bundles/new/solidstart'),
        })

        const webpackOnboarding = await screen.findByText(
          /Install the Codecov SolidStart Plugin/
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
