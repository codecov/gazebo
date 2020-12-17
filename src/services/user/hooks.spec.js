import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { renderHook } from '@testing-library/react-hooks'
import { MemoryRouter } from 'react-router-dom'

import { useUser } from './hooks'

const user = {
  username: 'TerrySmithDC',
  avatarUrl: 'photo',
}

const server = setupServer()

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('useUser', () => {
  let hookData

  function setup() {
    server.use(
      rest.get(`/internal/profile`, (req, res, ctx) => {
        return res(ctx.status(200), ctx.json(user))
      })
    )
    hookData = renderHook(() => useUser(), {
      wrapper: MemoryRouter,
    })
  }

  describe('when called', () => {
    beforeEach(() => {
      setup()
    })

    it('returns isLoading', () => {
      expect(hookData.result.current.isLoading).toBeTruthy()
    })
  })

  describe('when data is loaded', () => {
    beforeEach(() => {
      setup()
      return hookData.waitFor(() => hookData.result.current.isSuccess)
    })

    it('returns the user', () => {
      expect(hookData.result.current.data).toEqual(user)
    })
  })
})
