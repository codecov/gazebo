import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import { useCodecovAIInstallation } from './useCodecovAIInstallation'

const mockAiFeaturesEnabled = {
  owner: {
    aiFeaturesEnabled: true,
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

describe('useCodecovAIInstallation', () => {
  function setup({ isUnsuccessfulParseError = false }: SetupArgs) {
    server.use(
      graphql.query('GetCodecovAIAppInstallInfo', () => {
        if (isUnsuccessfulParseError) {
          return HttpResponse.json({ data: mockUnsuccessfulParseError })
        }
        return HttpResponse.json({ data: mockAiFeaturesEnabled })
      })
    )
  }

  describe('there is valid data', () => {
    it('fetches the owner app installation info', async () => {
      setup({})
      const { result } = renderHook(
        () =>
          useCodecovAIInstallation({
            owner: 'codecov',
            provider: 'gh',
          }),
        { wrapper }
      )

      await waitFor(() =>
        expect(result.current.data).toStrictEqual({
          aiFeaturesEnabled: true,
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

    it('throws a 400', async () => {
      setup({ isUnsuccessfulParseError: true })
      const { result } = renderHook(
        () =>
          useCodecovAIInstallation({
            owner: 'codecov',
            provider: 'gh',
          }),
        { wrapper }
      )

      await waitFor(() => expect(result.current.isError).toBeTruthy())
      await waitFor(() =>
        expect(result.current.error).toEqual(
          expect.objectContaining({
            dev: 'useCodecovAIInstallation - Parsing Error',
            status: 400,
          })
        )
      )
    })
  })
})
