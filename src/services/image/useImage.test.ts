import { renderHook, waitFor } from '@testing-library/react'

import { useImage } from './useImage'

afterEach(() => {
  vi.resetAllMocks()
})

describe('useImage', () => {
  it('starts loading an image', async () => {
    const { result } = renderHook(() => useImage({ src: 'image.com' }))

    await waitFor(() => expect(result.current.isLoading).toBeTruthy())
  })

  describe('successful network request', () => {
    beforeAll(() => {
      ;(global as any).Image = class {
        constructor() {
          setTimeout(() => {
            ;(this as any).onload()
          }, 100)
        }

        decode() {
          return new Promise<void>((resolve) => resolve())
        }
      }
    })

    it('successfully loads an image', async () => {
      const { result } = renderHook(() =>
        useImage({ src: 'https://api.backend.dev/image.png' })
      )

      await waitFor(() => expect(result.current.isLoading).toBeTruthy())
      await waitFor(() => expect(result.current.isLoading).toBeFalsy())

      await waitFor(() =>
        expect(result.current.src).toEqual('https://api.backend.dev/image.png')
      )
    })
  })

  describe('unsuccessful network request', () => {
    beforeAll(() => {
      ;(global as any).Image = class {
        constructor() {
          setTimeout(() => {
            ;(this as any).onload()
          }, 100)
        }

        decode() {
          return new Promise((_reject, reject) => reject('error'))
        }
      }
    })

    it('cannot successful load an image', async () => {
      const { result } = renderHook(() =>
        useImage({ src: 'https://api.backend.dev/image2.png' })
      )

      await waitFor(() => expect(result.current.isLoading).toBeFalsy())
      await waitFor(() => expect(result.current.error).not.toBeNull())
    })
  })
})
