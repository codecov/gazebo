import { renderHook } from '@testing-library/react-hooks'

import { useImage } from './hooks'

describe('useImage', () => {
  let hookData

  it('starts loading an image', () => {
    hookData = renderHook(() => useImage({ src: 'image.com' }))

    expect(hookData.result.current.isLoading).toBeTruthy()
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
      const { result, waitForNextUpdate } = renderHook(() =>
        useImage({ src: 'https://api.backend.dev/image.png' })
      )

      await waitForNextUpdate()

      expect(result.current.isLoading).toBeFalsy()
      expect(result.current.src).toEqual('https://api.backend.dev/image.png')
    })
  })
  describe('unsuccessful network request', () => {
    beforeAll(() => {
      global.Image = class {
        constructor() {
          setTimeout(() => {
            this.onload()
          }, 100)
        }
        decode() {
          return new Promise((_resolve, reject) => reject())
        }
      }
    })
    it('cannot successful load an image', async () => {
      const { result, waitForNextUpdate } = renderHook(() =>
        useImage({ src: 'https://api.backend.dev/image.png' })
      )

      await waitForNextUpdate()

      expect(result.current.isLoading).toBeFalsy()
      expect(result.current.error).toBeTruthy()
    })
  })
})
