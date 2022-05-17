import { renderHook } from '@testing-library/react-hooks'
import { rest } from 'msw'
import { setupServer } from 'msw/node'

import * as fs from 'fs'
import * as path from 'path'

import { useImage } from './hooks'

const server = setupServer(
  rest.get('https://api.backend.dev/image.png', (_, res, ctx) => {
    const imgBuff = fs.readFileSync(
      path.resolve(__dirname, '../../assets/githublogo.png')
    )

    return res(
      ctx.set('Content-Length', imgBuff.byteLength.toString()),
      ctx.set('Content-Type', 'image/png'),
      ctx.body(imgBuff)
    )
  })
)

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

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
