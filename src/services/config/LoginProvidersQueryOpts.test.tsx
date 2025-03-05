import {
  QueryClientProvider as QueryClientProviderV5,
  QueryClient as QueryClientV5,
  useQuery as useQueryV5,
} from '@tanstack/react-queryV5'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import {
  EnterpriseLoginProviders,
  LoginProvidersQueryOpts,
} from './LoginProvidersQueryOpts'

const server = setupServer()
const queryClientV5 = new QueryClientV5({
  defaultOptions: { queries: { retry: false } },
})

const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
  <QueryClientProviderV5 client={queryClientV5}>
    <MemoryRouter initialEntries={['/']}>
      <Route path="/">{children}</Route>
    </MemoryRouter>
  </QueryClientProviderV5>
)

beforeAll(() => {
  server.listen()
})

afterEach(() => {
  server.resetHandlers()
  queryClientV5.clear()
})

afterAll(() => {
  server.close()
})

interface SetupArgs {
  loginProviders?: Array<EnterpriseLoginProviders>
  hasParsingError?: boolean
}

describe('useLoginProviders', () => {
  function setup({ loginProviders, hasParsingError }: SetupArgs) {
    server.use(
      graphql.query('GetLoginProviders', () => {
        if (hasParsingError) {
          return HttpResponse.json({ data: { idk: true } })
        }

        return HttpResponse.json({
          data: { config: { loginProviders: loginProviders } },
        })
      })
    )
  }

  describe('third party services are configured providers', () => {
    it('returns data', async () => {
      setup({
        loginProviders: ['GITHUB', 'GITLAB', 'BITBUCKET', 'OKTA'],
      })
      const { result } = renderHook(
        () => useQueryV5(LoginProvidersQueryOpts()),
        { wrapper }
      )

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
      const { result } = renderHook(
        () => useQueryV5(LoginProvidersQueryOpts()),
        { wrapper }
      )

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
      vi.spyOn(global.console, 'error').mockImplementation(() => {})
    })

    afterAll(() => {
      vi.restoreAllMocks()
    })

    it('throws a 400', async () => {
      setup({
        hasParsingError: true,
      })

      const { result } = renderHook(
        () => useQueryV5(LoginProvidersQueryOpts()),
        { wrapper }
      )

      await waitFor(() => expect(result.current.isError).toBeTruthy())

      expect(result.current.error).toEqual(
        expect.objectContaining({
          dev: 'LoginProvidersQueryOpts - Parsing Error',
          status: 400,
        })
      )
    })
  })
})
