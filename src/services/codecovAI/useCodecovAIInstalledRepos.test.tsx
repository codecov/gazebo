import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import { useCodecovAIInstalledRepos } from './useCodecovAIInstalledRepos'

const mockAiInstalledRepos = {
  owner: {
    aiEnabledRepos: ['repo-1', 'repo-2'],
  },
}

const mockUnsuccessfulParseError = {
  owner: {
    wrong: 'schema',
  },
}

const server = setupServer()
const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})

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
  isUnsuccessfulParseError?: boolean
}

describe('useCodecovAIInstalledRepos', () => {
  function setup({ isUnsuccessfulParseError = false }: SetupArgs) {
    server.use(
      graphql.query('GetCodecovAIInstalledRepos', () => {
        if (isUnsuccessfulParseError) {
          return HttpResponse.json({ data: mockUnsuccessfulParseError })
        }
        return HttpResponse.json({ data: mockAiInstalledRepos })
      })
    )
  }

  describe('there is valid data', () => {
    it('fetches the correct list of repos', async () => {
      setup({})
      const { result } = renderHook(
        () =>
          useCodecovAIInstalledRepos({
            owner: 'codecov',
            provider: 'gh',
          }),
        { wrapper }
      )

      await waitFor(() =>
        expect(result.current.data).toStrictEqual({
          aiEnabledRepos: ['repo-1', 'repo-2'],
        })
      )
    })
  })

  describe('unsuccessful parse of zod schema', () => {
    const oldConsoleError = console.error

    beforeEach(() => {
      console.error = () => null
    })

    afterEach(() => {
      console.error = oldConsoleError
    })

    it('throws a 404', async () => {
      setup({ isUnsuccessfulParseError: true })
      const { result } = renderHook(
        () =>
          useCodecovAIInstalledRepos({
            owner: 'codecov',
            provider: 'gh',
          }),
        { wrapper }
      )

      await waitFor(() => expect(result.current.isError).toBeTruthy())
      await waitFor(() =>
        expect(result.current.error).toEqual(
          expect.objectContaining({
            status: 404,
          })
        )
      )
    })
  })
})
