import {
  QueryClientProvider as QueryClientProviderV5,
  QueryClient as QueryClientV5,
  useQuery as useQueryV5,
} from '@tanstack/react-queryV5'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import { RepoConfigurationStatusQueryOpts } from './RepoConfigurationStatusQueryOpts'

const mockRepoNotFound = {
  owner: {
    plan: null,
    repository: {
      __typename: 'NotFoundError',
      message: 'not found error',
    },
  },
}

const mockOwnerNotActivated = {
  owner: {
    plan: null,
    repository: {
      __typename: 'OwnerNotActivatedError',
      message: 'owner not activated error',
    },
  },
}

const mockNullOwner = {
  owner: null,
}

const mockGoodResponse = {
  owner: {
    plan: {
      tierName: 'pro',
    },
    repository: {
      __typename: 'Repository',
      coverageEnabled: true,
      bundleAnalysisEnabled: true,
      testAnalyticsEnabled: true,
      yaml: 'yaml',
      languages: ['typescript'],
      coverageAnalytics: {
        flagsCount: 2,
        componentsCount: 3,
      },
    },
  },
}

const queryClientV5 = new QueryClientV5({
  defaultOptions: { queries: { retry: false } },
})
const server = setupServer()

const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
  <QueryClientProviderV5 client={queryClientV5}>
    {children}
  </QueryClientProviderV5>
)

beforeAll(() => {
  server.listen()
})
afterEach(() => {
  queryClientV5.clear()
  server.resetHandlers()
})
afterAll(() => {
  server.close()
})

interface SetupArgs {
  badResponse?: boolean
  repoNotFound?: boolean
  ownerNotActivated?: boolean
  nullOwner?: boolean
}

describe('useRepoConfigurationStatus', () => {
  function setup({
    badResponse = false,
    repoNotFound = false,
    ownerNotActivated = false,
    nullOwner: nullResponse = false,
  }: SetupArgs) {
    server.use(
      graphql.query('GetRepoConfigurationStatus', () => {
        if (badResponse) {
          return HttpResponse.json({})
        } else if (repoNotFound) {
          return HttpResponse.json({ data: mockRepoNotFound })
        } else if (ownerNotActivated) {
          return HttpResponse.json({ data: mockOwnerNotActivated })
        } else if (nullResponse) {
          return HttpResponse.json({ data: mockNullOwner })
        }
        return HttpResponse.json({ data: mockGoodResponse })
      })
    )
  }

  it('returns 404 on bad response', async () => {
    setup({ badResponse: true })
    console.error = () => {}
    const { result } = renderHook(
      () =>
        useQueryV5(
          RepoConfigurationStatusQueryOpts({
            provider: 'gh',
            owner: 'codecov',
            repo: 'cool-repo',
          })
        ),
      { wrapper }
    )

    await waitFor(() => expect(result.current.status).toBe('error'))

    await waitFor(() =>
      expect(result.current.failureReason).toMatchObject({
        status: 404,
        data: {},
        dev: 'useRepoConfigurationStatus - 404 Failed to parse data',
      })
    )
  })

  it('returns 404 on repo not found', async () => {
    setup({ repoNotFound: true })
    console.error = () => {}
    const { result } = renderHook(
      () =>
        useQueryV5(
          RepoConfigurationStatusQueryOpts({
            provider: 'gh',
            owner: 'codecov',
            repo: 'cool-repo',
          })
        ),
      { wrapper }
    )

    await waitFor(() => expect(result.current.status).toBe('error'))

    await waitFor(() =>
      expect(result.current.failureReason).toMatchObject({
        status: 404,
        data: {},
        dev: 'useRepoConfigurationStatus - 404 Not found error',
      })
    )
  })

  it('returns 403 on owner not activated', async () => {
    setup({ ownerNotActivated: true })
    console.error = () => {}
    const { result } = renderHook(
      () =>
        useQueryV5(
          RepoConfigurationStatusQueryOpts({
            provider: 'gh',
            owner: 'codecov',
            repo: 'cool-repo',
          })
        ),
      { wrapper }
    )

    await waitFor(() => expect(result.current.status).toBe('error'))

    await waitFor(() =>
      expect(result.current.failureReason).toMatchObject({
        status: 403,
        data: {},
        dev: 'useRepoConfigurationStatus - 403 Owner not activated error',
      })
    )
  })

  it('returns nulls on null owner', async () => {
    setup({ nullOwner: true })
    const { result } = renderHook(
      () =>
        useQueryV5(
          RepoConfigurationStatusQueryOpts({
            provider: 'gh',
            owner: 'codecov',
            repo: 'cool-repo',
          })
        ),
      { wrapper }
    )

    await waitFor(() => expect(result.current.status).toBe('success'))

    await waitFor(() =>
      expect(result.current.data).toMatchObject({
        plan: null,
        repository: null,
      })
    )
  })

  it('returns data on good response', async () => {
    setup({})
    const { result } = renderHook(
      () =>
        useQueryV5(
          RepoConfigurationStatusQueryOpts({
            provider: 'gh',
            owner: 'codecov',
            repo: 'cool-repo',
          })
        ),
      { wrapper }
    )

    await waitFor(() => expect(result.current.status).toBe('success'))

    await waitFor(() =>
      expect(result.current.data).toMatchObject({
        plan: {
          tierName: 'pro',
        },
        repository: {
          __typename: 'Repository',
          coverageEnabled: true,
          bundleAnalysisEnabled: true,
          testAnalyticsEnabled: true,
          yaml: 'yaml',
          languages: ['typescript'],
          coverageAnalytics: {
            flagsCount: 2,
            componentsCount: 3,
          },
        },
      })
    )
  })
})
