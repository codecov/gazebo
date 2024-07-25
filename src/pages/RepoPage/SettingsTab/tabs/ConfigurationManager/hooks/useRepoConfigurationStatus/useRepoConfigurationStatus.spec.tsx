import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'

import { useRepoConfigurationStatus } from './useRepoConfigurationStatus'

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
      flagsCount: 2,
      componentsCount: 3,
      coverageEnabled: true,
      bundleAnalysisEnabled: true,
      testAnalyticsEnabled: true,
      yaml: 'yaml',
    },
  },
}

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})
const server = setupServer()

const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
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
      graphql.query('GetRepoConfigurationStatus', (req, res, ctx) => {
        if (badResponse) {
          return res(ctx.status(200), ctx.data({}))
        } else if (repoNotFound) {
          return res(ctx.status(200), ctx.data(mockRepoNotFound))
        } else if (ownerNotActivated) {
          return res(ctx.status(200), ctx.data(mockOwnerNotActivated))
        } else if (nullResponse) {
          return res(ctx.status(200), ctx.data(mockNullOwner))
        }
        return res(ctx.status(200), ctx.data(mockGoodResponse))
      })
    )
  }

  it('returns 404 on bad response', async () => {
    setup({ badResponse: true })
    console.error = () => {}
    const { result } = renderHook(
      () =>
        useRepoConfigurationStatus({
          provider: 'gh',
          owner: 'codecov',
          repo: 'cool-repo',
        }),
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
        useRepoConfigurationStatus({
          provider: 'gh',
          owner: 'codecov',
          repo: 'cool-repo',
        }),
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
        useRepoConfigurationStatus({
          provider: 'gh',
          owner: 'codecov',
          repo: 'cool-repo',
        }),
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
        useRepoConfigurationStatus({
          provider: 'gh',
          owner: 'codecov',
          repo: 'cool-repo',
        }),
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
        useRepoConfigurationStatus({
          provider: 'gh',
          owner: 'codecov',
          repo: 'cool-repo',
        }),
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
          flagsCount: 2,
          componentsCount: 3,
          coverageEnabled: true,
          bundleAnalysisEnabled: true,
          testAnalyticsEnabled: true,
          yaml: 'yaml',
        },
      })
    )
  })
})
