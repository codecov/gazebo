import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql, HttpResponse } from 'msw2'
import { setupServer } from 'msw2/node'

import { useUploadTokenRequired } from './useUploadTokenRequired'

const mockUploadTokenRequired = {
  owner: {
    orgUploadToken: 'cool-token-123',
    uploadTokenRequired: true,
    isAdmin: true,
  },
}

const mockNullOwner = {
  owner: null,
}

const mockUnsuccessfulParseError = {}

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
  isNullOwner?: boolean
  isUnsuccessfulParseError?: boolean
}

describe('useUploadTokenRequired', () => {
  function setup({
    isUnsuccessfulParseError = false,
    isNullOwner = false,
  }: SetupArgs) {
    server.use(
      graphql.query('GetUploadTokenRequired', () => {
        if (isUnsuccessfulParseError) {
          return HttpResponse.json({ data: mockUnsuccessfulParseError })
        } else if (isNullOwner) {
          return HttpResponse.json({ data: mockNullOwner })
        } else {
          return HttpResponse.json({ data: mockUploadTokenRequired })
        }
      })
    )
  }

  describe('when useUploadTokenRequired is called', () => {
    describe('api returns valid response', () => {
      describe('uploadTokenRequired field is resolved', () => {
        it('returns the upload token required status, org upload token, and isAdmin status', async () => {
          setup({})
          const { result } = renderHook(
            () =>
              useUploadTokenRequired({
                provider: 'gh',
                owner: 'codecov',
              }),
            { wrapper }
          )

          await waitFor(() => result.current.isSuccess)
          await waitFor(() =>
            expect(result.current.data).toEqual({
              orgUploadToken: 'cool-token-123',
              uploadTokenRequired: true,
              isAdmin: true,
            })
          )
        })
      })

      describe('parent field is resolved as null', () => {
        it('returns null value', async () => {
          setup({ isNullOwner: true })

          const { result } = renderHook(
            () =>
              useUploadTokenRequired({
                provider: 'gh',
                owner: 'codecov',
              }),
            { wrapper }
          )

          await waitFor(() => expect(result.current.data).toBeNull())
        })
      })
    })

    describe('unsuccessful parse of zod schema', () => {
      beforeEach(() => {
        vi.spyOn(console, 'error').mockImplementation(() => {})
      })

      afterEach(() => {
        vi.restoreAllMocks()
      })

      it('throws a 404', async () => {
        setup({ isUnsuccessfulParseError: true })
        const { result } = renderHook(
          () =>
            useUploadTokenRequired({
              provider: 'gh',
              owner: 'codecov',
            }),
          {
            wrapper,
          }
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
})
