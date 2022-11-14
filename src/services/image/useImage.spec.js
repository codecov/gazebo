import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook } from '@testing-library/react-hooks'

import { useImage } from './useImage'

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
  logger: {
    error: () => {},
  },
})

const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
)

afterEach(() => queryClient.clear())

describe('useImage', () => {
  let hookData

  it('starts loading an image', () => {
    hookData = renderHook(() => useImage({ src: 'image.com' }), { wrapper })

    expect(hookData.result.current.isFetching).toBeTruthy()
  })

  describe('successful network request', () => {
    beforeAll(() => {
      global.Image = class {
        constructor() {
          setTimeout(() => {
            this.onload()
          }, 100)
        }

        decode() {
          return new Promise((resolve) => resolve())
        }
      }
    })

    it('successfully loads an image', async () => {
      const { result, waitFor } = renderHook(
        () => useImage({ src: 'https://api.backend.dev/image.png' }),
        { wrapper }
      )

      await waitFor(() => expect(result.current.isFetching).toBeTruthy())
      await waitFor(() => expect(!result.current.isFetching).toBeTruthy())

      expect(result.current.isFetching).toBeFalsy()
      expect(result.current.src).toEqual('https://api.backend.dev/image.png')
    })
  })

  describe('unsuccessful network request', () => {
    beforeAll(() => {
      global.Image = class {
        constructor() {
          setTimeout(() => {
            this.onload()
          }, 1)
        }

        decode() {
          return Promise.reject(new Error('Oh no!'))
        }
      }
    })

    it('cannot successful load an image', async () => {
      const { result, waitForNextUpdate } = renderHook(
        () => useImage({ src: 'https://api.backend.dev/image.png' }),
        { wrapper }
      )

      await waitForNextUpdate()

      expect(result.current.isError).toBeTruthy()
    })
  })
})
