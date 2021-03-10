import { useParams, useRouteMatch } from 'react-router-dom'
import { renderHook } from '@testing-library/react-hooks'

import { useUser } from 'services/user'

import { useMainNav, useSubNav } from './hooks'

jest.mock('services/user')
jest.mock('react-router-dom', () => ({
  useParams: jest.fn(),
  useRouteMatch: jest.fn(),
}))

describe('useMainNav', () => {
  let hookData

  function setup(params) {
    useParams.mockReturnValue(params)
    useRouteMatch.mockReturnValue({ params })
    hookData = renderHook(() => useMainNav())
  }

  describe('when called with no resources', () => {
    beforeEach(() => {
      setup({})
    })

    it('returns no links', () => {
      expect(hookData.result.current).toHaveLength(0)
    })
  })

  describe('when called with a provider', () => {
    beforeEach(() => {
      setup({
        provider: 'gh',
      })
    })

    it('returns the link to the provider', () => {
      expect(hookData.result.current).toEqual([
        {
          label: 'Github',
          to: '/gh',
          useRouter: false,
          imageUrl: 'github-icon.svg',
        },
      ])
    })
  })

  describe('when called with a provider and owner', () => {
    beforeEach(() => {
      setup({
        provider: 'gh',
        owner: 'codecov',
      })
    })

    it('returns the link to the provider and owner', () => {
      expect(hookData.result.current).toEqual([
        {
          label: 'Github',
          to: '/gh',
          useRouter: false,
          imageUrl: 'github-icon.svg',
        },
        {
          label: 'codecov',
          to: '/gh/codecov',
          useRouter: false,
          imageUrl: 'https://github.com/codecov.png?size=40',
        },
      ])
    })
  })

  describe('when called with a provider, owner and repo', () => {
    beforeEach(() => {
      setup({
        provider: 'gh',
        owner: 'codecov',
        repo: 'gazebo',
      })
    })

    it('returns the link to the provider and owner', () => {
      expect(hookData.result.current).toEqual([
        {
          label: 'Github',
          to: '/gh',
          useRouter: false,
          imageUrl: 'github-icon.svg',
        },
        {
          label: 'codecov',
          to: '/gh/codecov',
          useRouter: false,
          imageUrl: 'https://github.com/codecov.png?size=40',
        },
        {
          label: 'gazebo',
          to: '/gh/codecov/gazebo',
          useRouter: false,
          iconName: 'infoCircle',
        },
      ])
    })
  })
})

describe('useSubNav', () => {
  let hookData

  function setup(currentUser) {
    const params = {
      provider: 'gh',
      owner: 'codecov',
      repo: 'gazebo',
    }
    useRouteMatch.mockReturnValue({ params })
    useParams.mockReturnValue(params)
    useUser.mockReturnValue({ data: currentUser })
    hookData = renderHook(() => useSubNav())
  }

  describe('when called with no users', () => {
    beforeEach(() => {
      setup(null)
    })

    it('returns no links', () => {
      expect(hookData.result.current).toHaveLength(0)
    })
  })

  describe('when called with a user', () => {
    const user = {
      username: 'Shaggy',
      avatarUrl: '🚶‍♂️.jpeg',
    }

    beforeEach(() => {
      setup(user)
    })

    it('returns the link to the settings and sign out', () => {
      expect(hookData.result.current).toEqual([
        {
          label: 'Personal Settings',
          to: `/account/gh/${user.username}`,
          useRouter: true,
          imageUrl: user.avatarUrl,
        },
        {
          label: 'Sign Out',
          to: '/sign-out',
          useRouter: false,
          iconName: 'signOut',
        },
      ])
    })
  })
})
