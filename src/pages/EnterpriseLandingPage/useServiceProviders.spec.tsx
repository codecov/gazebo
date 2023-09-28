import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import {
  EnterpriseLoginProviders,
  useServiceProviders,
} from './useServiceProviders'

const server = setupServer()
const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})

const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <MemoryRouter initialEntries={['/']}>
      <Route path="/">{children}</Route>
    </MemoryRouter>
  </QueryClientProvider>
)

beforeAll(() => {
  server.listen()
})

beforeEach(() => {
  server.resetHandlers()
  queryClient.clear()
})

afterAll(() => {
  server.close()
})

interface SetupArgs {
  loginProviders?: Array<EnterpriseLoginProviders>
  hasParsingError?: boolean
}

describe('useServiceProviders', () => {
  function setup({ loginProviders, hasParsingError }: SetupArgs) {
    server.use(
      graphql.query('GetServiceProviders', (req, res, ctx) => {
        if (hasParsingError) {
          return res(ctx.status(200), ctx.data({ idk: true }))
        }

        return res(
          ctx.status(200),
          ctx.data({ config: { loginProviders: loginProviders } })
        )
      })
    )
  }

  describe('third party services are configured providers', () => {
    it('returns data', async () => {
      setup({
        loginProviders: ['GITHUB', 'GITLAB', 'BITBUCKET', 'OKTA'],
      })
      const { result } = renderHook(() => useServiceProviders(), { wrapper })

      await waitFor(() => result.current.isSuccess)

      await waitFor(() =>
        expect(result.current.data).toStrictEqual({
          providerList: ['GITHUB', 'GITLAB', 'BITBUCKET', 'OKTA'],
          github: true,
          gitlab: true,
          bitbucket: true,
          okta: true,
        })
      )
    })
  })

  describe('self hosted services are configured providers', () => {
    it('returns data', async () => {
      setup({
        loginProviders: [
          'GITHUB_ENTERPRISE',
          'GITLAB_ENTERPRISE',
          'BITBUCKET_SERVER',
        ],
      })
      const { result } = renderHook(() => useServiceProviders(), { wrapper })

      await waitFor(() => result.current.isSuccess)

      await waitFor(() =>
        expect(result.current.data).toStrictEqual({
          providerList: [
            'GITHUB_ENTERPRISE',
            'GITLAB_ENTERPRISE',
            'BITBUCKET_SERVER',
          ],
          github: true,
          gitlab: true,
          bitbucket: true,
          okta: false,
        })
      )
    })
  })

  describe('error parsing request', () => {
    beforeAll(() => {
      jest.spyOn(global.console, 'error')
    })

    afterAll(() => {
      jest.resetAllMocks()
    })

    it('throws an error', async () => {
      setup({
        hasParsingError: true,
      })

      const { result } = renderHook(() => useServiceProviders(), { wrapper })

      await waitFor(() => expect(result.current.isError).toBeTruthy())

      expect(result.current.error).toEqual(
        expect.objectContaining({ status: 404 })
      )
    })
  })
})
