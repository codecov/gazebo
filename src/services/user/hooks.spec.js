import { renderHook, act } from '@testing-library/react-hooks'

import { useUser } from './hooks'

const dummyUsername = 'TerrySmithDC'
const dummyAvatarUrl =
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'

describe('useUser', () => {
  let hookData

  function setup() {
    hookData = renderHook(() => useUser())
  }

  describe('default', () => {
    beforeEach(() => {
      setup()
    })

    it('has default values', () => {
      const [user] = hookData.result.current
      expect(user.avatarUrl).toBe(dummyAvatarUrl)
      expect(user.username).toBe(dummyUsername)
    })
  })

  describe.each`
    updated                                                            | numWarning | expected
    ${{ username: 'Link' }}                                            | ${0}       | ${{ username: 'Link', avatarUrl: dummyAvatarUrl }}
    ${{ avatarUrl: 'https://hyru.le/beachday.png' }}                   | ${0}       | ${{ username: dummyUsername, avatarUrl: 'https://hyru.le/beachday.png' }}
    ${{ username: 'Link', avatarUrl: 'https://hyru.le/beachday.png' }} | ${0}       | ${{ username: 'Link', avatarUrl: 'https://hyru.le/beachday.png' }}
    ${{ villain: 'Ganondorf' }}                                        | ${1}       | ${{ avatarUrl: dummyAvatarUrl, username: dummyUsername }}
    ${{ friend: 'Una', username: 'Link' }}                             | ${1}       | ${{ avatarUrl: dummyAvatarUrl, username: 'Link' }}
  `('Update user state to $updated', ({ updated, numWarning, expected }) => {
    let mockWarn
    beforeEach(() => {
      mockWarn = jest.fn()
      const spy = jest.spyOn(console, 'warn')
      spy.mockImplementation(mockWarn)

      setup()
    })

    it(`update to ${updated}`, () => {
      act(() => {
        const [, setUser] = hookData.result.current
        setUser(updated)
      })

      const [user] = hookData.result.current
      expect(user).toMatchObject(expected)
    })

    it(`will warn ${numWarning}`, () => {
      act(() => {
        const [, setUser] = hookData.result.current
        setUser(updated)
      })

      const [user] = hookData.result.current
      expect(user).toMatchObject(expected)
      expect(mockWarn).toHaveBeenCalledTimes(numWarning)
    })
  })
})
