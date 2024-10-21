import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { graphql, HttpResponse } from 'msw'
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
  testAnalyticsEnabled: true,
}

const mockBundles = {
  owner: {
    repository: {
      __typename: 'Repository',
      branch: {
        head: {
          bundleAnalysis: {
            bundleAnalysisReport: {
              __typename: 'BundleAnalysisReport',
              bundles: [{ name: 'bundle1' }, { name: 'bundle2' }],
            },
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
          bundleAnalysis: {
            bundleAnalysisReport: {
              __typename: 'MissingHeadReport',
              message: 'missing head report',
            },
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
  ({ children }) => (
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
    const mockFilterReset = vi.fn()

    server.use(
      graphql.query('GetRepoOverview', (info) => {
        if (nullOverview) {
          return HttpResponse.json({ data: { owner: null } })
        }

        return HttpResponse.json({
          data: {
            owner: {
              isCurrentUserActivated: true,
              repository: mockRepoOverview,
            },
          },
        })
      }),
      graphql.query('BranchBundlesNames', (info) => {
        if (missingHeadReport) {
          return HttpResponse.json({ data: mockBadBundles })
        }

        return HttpResponse.json({ data: mockBundles })
      })
    )

    return { user, mockFilterReset }
  }

  describe('when there are no bundles', () => {
    it('disables the select', async () => {
      const { mockFilterReset } = setup({ missingHeadReport: true })
      render(<BundleSelector resetFilterSelects={mockFilterReset} />, {
        wrapper: wrapper(),
      })

      const select = await screen.findByRole('button', {
        name: 'bundle tab bundle selector',
      })
      expect(select).toBeInTheDocument()
      expect(select).toBeDisabled()
    })
  })

  describe('when there is bundle data', () => {
    it('enables the select', async () => {
      const { mockFilterReset } = setup({})
      render(<BundleSelector resetFilterSelects={mockFilterReset} />, {
        wrapper: wrapper(),
      })

      const select = await screen.findByRole('button', {
        name: 'bundle tab bundle selector',
      })
      expect(select).toBeInTheDocument()
      expect(select).not.toBeDisabled()
    })

    describe('selector loads first bundle', () => {
      it('renders selected bundle in button', async () => {
        const { mockFilterReset } = setup({})
        render(<BundleSelector resetFilterSelects={mockFilterReset} />, {
          wrapper: wrapper(),
        })

        const select = await screen.findByRole('button', {
          name: 'bundle tab bundle selector',
        })
        expect(select).toBeInTheDocument()
        expect(select).toHaveTextContent('bundle1')
      })

      it('puts the bundle in the url', async () => {
        const { mockFilterReset } = setup({})
        render(<BundleSelector resetFilterSelects={mockFilterReset} />, {
          wrapper: wrapper(),
        })

        await waitFor(() => {
          expect(testLocation.pathname).toBe(
            '/gh/codecov/test-repo/bundles/test-branch/bundle1'
          )
        })
      })
    })

    describe('bundle is set in the url', () => {
      it('sets the button to that bundle', async () => {
        const { mockFilterReset } = setup({})
        render(<BundleSelector resetFilterSelects={mockFilterReset} />, {
          wrapper: wrapper('/gh/codecov/test-repo/bundles/test-branch/bundle2'),
        })

        const select = await screen.findByRole('button', {
          name: 'bundle tab bundle selector',
        })
        expect(select).toBeInTheDocument()
        expect(select).not.toBeDisabled()
        expect(select).toHaveTextContent(/bundle2/)
      })
    })

    describe('navigating to a different bundle', () => {
      describe('user selects a bundle', () => {
        it('navigates to the selected bundle', async () => {
          const { user, mockFilterReset } = setup({})
          render(<BundleSelector resetFilterSelects={mockFilterReset} />, {
            wrapper: wrapper(),
          })

          const select = await screen.findByRole('button', {
            name: 'bundle tab bundle selector',
          })
          await user.click(select)

          const bundle = await screen.findByText('bundle2')
          await user.click(bundle)

          await waitFor(() => {
            expect(testLocation.pathname).toBe(
              '/gh/codecov/test-repo/bundles/test-branch/bundle2'
            )
          })
        })

        it('calls to reset the filter selects', async () => {
          const { user, mockFilterReset } = setup({})
          render(<BundleSelector resetFilterSelects={mockFilterReset} />, {
            wrapper: wrapper(),
          })

          const select = await screen.findByRole('button', {
            name: 'bundle tab bundle selector',
          })
          await user.click(select)

          const bundle = await screen.findByText('bundle2')
          await user.click(bundle)

          await waitFor(() => expect(mockFilterReset).toHaveBeenCalled())
        })
      })
    })

    describe('user searches for bundle', () => {
      describe('bundle is found', () => {
        it('renders the found bundle', async () => {
          const { user, mockFilterReset } = setup({})
          render(<BundleSelector resetFilterSelects={mockFilterReset} />, {
            wrapper: wrapper(),
          })

          const select = await screen.findByRole('button', {
            name: 'bundle tab bundle selector',
          })
          await user.click(select)

          const input = await screen.findByRole('combobox')
          await user.type(input, 'bundle2')

          const foundBundle = await screen.findByText('bundle2')
          expect(foundBundle).toBeInTheDocument()
        })
      })

      describe('bundle is not found', () => {
        it('displays no results found', async () => {
          const { user, mockFilterReset } = setup({})
          render(<BundleSelector resetFilterSelects={mockFilterReset} />, {
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
          const { user, mockFilterReset } = setup({})
          render(<BundleSelector resetFilterSelects={mockFilterReset} />, {
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

          await user.clear(input)
          await waitFor(() => expect(input).toHaveValue(''))

          const bundles = await screen.findByText('bundle1')
          expect(bundles).toBeInTheDocument()
        })
      })
    })
  })
})
