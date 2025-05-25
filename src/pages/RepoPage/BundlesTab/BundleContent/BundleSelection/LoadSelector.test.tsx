import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  QueryClientProvider as QueryClientProviderV5,
  QueryClient as QueryClientV5,
} from '@tanstack/react-queryV5'
import { render, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { graphql, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import qs from 'qs'
import { Suspense } from 'react'
import { MemoryRouter, Route, useLocation } from 'react-router-dom'

import { LoadSelector } from './LoadSelector'

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

const mockBranch = {
  branch: {
    name: 'main',
    head: {
      commitid: '321fdsa',
    },
  },
}

const mockBranches = {
  __typename: 'Repository',
  branches: {
    edges: [
      { node: { name: 'branch-1', head: { commitid: 'asdf123' } } },
      { node: { name: 'main', head: { commitid: '321fdsa' } } },
    ],
    pageInfo: {
      hasNextPage: false,
      endCursor: 'end-cursor',
    },
  },
}

const mockBranchBundles = (noBundles = false) => ({
  owner: {
    repository: {
      __typename: 'Repository',
      branch: {
        head: {
          bundleAnalysis: {
            bundleAnalysisReport: {
              __typename: 'BundleAnalysisReport',
              bundles: noBundles ? [] : [{ name: 'bundle1' }],
            },
          },
        },
      },
    },
  },
})

const server = setupServer()
const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false, suspense: true } },
})
const queryClientV5 = new QueryClientV5({
  defaultOptions: { queries: { retry: false } },
})

let testLocation: ReturnType<typeof useLocation>
const wrapper =
  (
    initialEntries = '/gh/codecov/test-repo/bundles/test-branch'
  ): React.FC<React.PropsWithChildren> =>
  ({ children }) => (
    <QueryClientProviderV5 client={queryClientV5}>
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[initialEntries]}>
          <Suspense fallback={<p>Loading</p>}>
            <Route
              path={[
                '/:provider/:owner/:repo/bundles/:branch/:bundle',
                '/:provider/:owner/:repo/bundles/:branch',
                '/:provider/:owner/:repo/bundles/',
              ]}
            >
              {children}
            </Route>
            <Route
              path="*"
              render={({ location }) => {
                testLocation = location
                return null
              }}
            />
          </Suspense>
        </MemoryRouter>
      </QueryClientProvider>
    </QueryClientProviderV5>
  )

beforeAll(() => {
  server.listen()
})

afterEach(() => {
  queryClient.clear()
  queryClientV5.clear()
  server.resetHandlers()
})

afterAll(() => {
  server.close()
})

interface SetupArgs {
  noBundles?: boolean
}

describe('LoadSelector', () => {
  function setup({ noBundles = false }: SetupArgs) {
    const user = userEvent.setup()

    server.use(
      graphql.query('GetRepoOverview', () => {
        return HttpResponse.json({
          data: {
            owner: {
              isCurrentUserActivated: true,
              repository: mockRepoOverview,
            },
          },
        })
      }),
      graphql.query('GetBranch', () => {
        return HttpResponse.json({
          data: {
            owner: {
              repository: { __typename: 'Repository', ...mockBranch },
            },
          },
        })
      }),
      graphql.query('GetBranches', () => {
        return HttpResponse.json({
          data: { owner: { repository: mockBranches } },
        })
      }),
      graphql.query('BranchBundlesNames', () => {
        return HttpResponse.json({ data: mockBranchBundles(noBundles) })
      })
    )

    return { user }
  }

  describe('there are bundles present', () => {
    it('does not disable the button', async () => {
      setup({ noBundles: false })
      render(<LoadSelector />, {
        wrapper: wrapper(),
      })

      const loadSelector = await screen.findByRole('button', {
        name: 'bundle tab loading selector',
      })
      expect(loadSelector).not.toBeDisabled()
    })

    describe('when a load type is selected', () => {
      it('sets the selected load type', async () => {
        const { user } = setup({ noBundles: false })
        render(<LoadSelector />, {
          wrapper: wrapper(),
        })

        const loadSelector = await screen.findByRole('button', {
          name: 'bundle tab loading selector',
        })
        await user.click(loadSelector)

        const loadType = await screen.findByRole('option', {
          name: 'Entry files',
        })
        await user.click(loadType)

        const updatedSelector = await screen.findByRole('button', {
          name: 'bundle tab loading selector',
        })
        await waitFor(() =>
          expect(updatedSelector).toHaveTextContent('1 load type selected')
        )
      })

      it('updates the search params', async () => {
        const { user } = setup({ noBundles: false })
        render(<LoadSelector />, {
          wrapper: wrapper(),
        })

        const loadSelector = await screen.findByRole('button', {
          name: 'bundle tab loading selector',
        })
        await user.click(loadSelector)

        const loadType = await screen.findByRole('option', {
          name: 'Initial files',
        })
        await user.click(loadType)

        await waitFor(() =>
          expect(testLocation.search).toStrictEqual(
            qs.stringify({ loading: ['INITIAL'] }, { addQueryPrefix: true })
          )
        )
      })
    })
  })

  describe('there are no bundles present', () => {
    it('disables the select', async () => {
      setup({ noBundles: true })
      render(<LoadSelector />, {
        wrapper: wrapper(),
      })

      const loadSelector = await screen.findByRole('button', {
        name: 'bundle tab loading selector',
      })
      expect(loadSelector).toBeDisabled()
    })
  })
})
