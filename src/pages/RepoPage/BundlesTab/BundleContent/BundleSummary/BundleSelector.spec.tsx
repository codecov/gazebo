import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { Suspense } from 'react'
import { MemoryRouter, Route, useLocation } from 'react-router-dom'

import BundleSelector from './BundleSelector'

const mockRepoOverview = {
  __typename: 'Repository',
  private: false,
  defaultBranch: 'main',
  oldestCommitAt: '2022-10-10T11:59:59',
  coverageEnabled: true,
  bundleAnalysisEnabled: true,
  languages: [],
}

const mockBundles = {
  owner: {
    repository: {
      __typename: 'Repository',
      branch: {
        head: {
          bundleAnalysisReport: {
            __typename: 'BundleAnalysisReport',
            bundles: [{ name: 'bundle1' }],
          },
        },
      },
    },
  },
}

const mockBadBundles = {
  owner: {
    repository: {
      __typename: 'Repository',
      branch: {
        head: {
          commitid: '543a5268dce725d85be7747c0f9b61e9a68dea57',
          bundleAnalysisReport: {
            __typename: 'MissingHeadReport',
            message: 'missing head report',
          },
        },
      },
    },
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
    initialEntries = '/gh/codecov/test-repo/bundles/test-branch'
  ): React.FC<React.PropsWithChildren> =>
  ({ children }) =>
    (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[initialEntries]}>
          <Route
            path={[
              '/:provider/:owner/:repo/bundles/:branch/:bundle',
              '/:provider/:owner/:repo/bundles/:branch',
              '/:provider/:owner/:repo/bundles/',
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
  missingHeadReport?: boolean
  nullOverview?: boolean
}

describe('BundleSelector', () => {
  function setup({
    missingHeadReport = false,
    nullOverview = false,
  }: SetupArgs) {
    const user = userEvent.setup()

    server.use(
      graphql.query('GetRepoOverview', (req, res, ctx) => {
        if (nullOverview) {
          return res(ctx.status(200), ctx.data({ owner: null }))
        }

        return res(
          ctx.status(200),
          ctx.data({ owner: { repository: mockRepoOverview } })
        )
      }),
      graphql.query('BranchBundlesNames', (req, res, ctx) => {
        if (missingHeadReport) {
          return res(ctx.status(200), ctx.data(mockBadBundles))
        } else return res(ctx.status(200), ctx.data(mockBundles))
      })
    )

    return { user }
  }

  describe('when there are no bundles', () => {
    it('disables the select', async () => {
      setup({ missingHeadReport: true })
      render(<BundleSelector />, { wrapper: wrapper() })

      const select = await screen.findByRole('button', {
        name: 'bundle tab bundle selector',
      })
      expect(select).toBeInTheDocument()
      expect(select).toBeDisabled()
    })
  })

  describe('when there is branch data', () => {
    it('enables the select', async () => {
      setup({})
      render(<BundleSelector />, { wrapper: wrapper() })

      const select = await screen.findByRole('button', {
        name: 'bundle tab bundle selector',
      })
      expect(select).toBeInTheDocument()
      expect(select).not.toBeDisabled()
    })

    it('renders select bundle in button', async () => {
      setup({})
      render(<BundleSelector />, { wrapper: wrapper() })

      const select = await screen.findByRole('button', {
        name: 'bundle tab bundle selector',
      })
      expect(select).toBeInTheDocument()
      expect(select).toHaveTextContent('Select bundle')
    })

    describe('bundle is set in the url', () => {
      it('sets the button to that bundle', async () => {
        setup({})
        render(<BundleSelector />, {
          wrapper: wrapper(
            '/gh/codecov/test-repo/bundles/test-branch/test-bundle'
          ),
        })

        const select = await screen.findByRole('button', {
          name: 'bundle tab bundle selector',
        })
        expect(select).toBeInTheDocument()
        expect(select).not.toBeDisabled()
        expect(select).toHaveTextContent(/test-bundle/)
      })
    })

    describe('navigating to a different bundle', () => {
      describe('user selects a bundle', () => {
        it('navigates to the selected bundle', async () => {
          const { user } = setup({})
          render(<BundleSelector />, { wrapper: wrapper() })

          const select = await screen.findByRole('button', {
            name: 'bundle tab bundle selector',
          })
          await user.click(select)

          const bundle = await screen.findByText('bundle1')
          await user.click(bundle)

          await waitFor(() => {
            expect(testLocation.pathname).toBe(
              '/gh/codecov/test-repo/bundles/test-branch/bundle1'
            )
          })
        })
      })
    })

    describe('user searches for bundle', () => {
      describe('branch is found', () => {
        it('renders the found branch', async () => {
          const { user } = setup({})
          render(<BundleSelector />, {
            wrapper: wrapper(),
          })

          const select = await screen.findByRole('button', {
            name: 'bundle tab bundle selector',
          })
          await user.click(select)

          const input = await screen.findByRole('combobox')
          await user.type(input, 'bundle1')

          const foundBundle = await screen.findByText('bundle1')
          expect(foundBundle).toBeInTheDocument()
        })
      })

      describe('branch is not found', () => {
        it('displays no results found', async () => {
          const { user } = setup({})
          render(<BundleSelector />, {
            wrapper: wrapper(),
          })

          const select = await screen.findByRole('button', {
            name: 'bundle tab bundle selector',
          })
          await user.click(select)

          const input = await screen.findByRole('combobox')
          await user.type(input, 'searching for branch')

          const notFound = await screen.findByText('No results found')
          expect(notFound).toBeInTheDocument()
        })
      })

      describe('user clears search', () => {
        it('resets the select', async () => {
          const { user } = setup({})
          render(<BundleSelector />, {
            wrapper: wrapper(),
          })

          const select = await screen.findByRole('button', {
            name: 'bundle tab bundle selector',
          })
          await user.click(select)

          const input = await screen.findByRole('combobox')
          await user.type(input, 'test')

          const notFound = await screen.findByText('No results found')
          expect(notFound).toBeInTheDocument()

          await user.type(input, '{backspace}{backspace}{backspace}{backspace}')

          const bundles = await screen.findByText('bundle1')
          expect(bundles).toBeInTheDocument()
        })
      })
    })
  })
})
