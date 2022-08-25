import { renderHook } from '@testing-library/react-hooks'
import { useLocation, useParams } from 'react-router-dom'

import { useOwner, useUser } from 'services/user'

import { firePendo, useUpdatePendoWithOwner } from './pendo'

jest.mock('services/user')
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'), // import and retain the original functionalities
  useParams: jest.fn(() => {}),
  useLocation: jest.fn(() => {}),
}))

const curUser = {
  businessEmail: 'userbzemail@gmail.com',
  email: 'user@gmail.com',
  onboardingCompleted: true,
  user: {
    username: 'random',
  },
  trackingMetadata: {
    ownerid: 1999,
    plan: 'users-free',
    service: 'github',
    staff: false,
  },
}

const ownerData = {
  hashOwnerid: 'hash ownerid',
  username: 'codecov',
  isCurrentUserPartOfOrg: true,
}

describe('initialize pendo', () => {
  function setup() {
    window.pendo = {
      initialize: jest.fn(),
    }
    firePendo(curUser)
  }

  beforeEach(() => {
    setup()
  })

  it('fires pendo initialization with expected params', () => {
    expect(window.pendo.initialize).toHaveBeenCalledTimes(1)
  })
})

describe('update pendo', () => {
  function setup() {
    window.pendo = {
      updateOptions: jest.fn(),
    }
    useUser.mockReturnValue({ data: curUser })
    useParams.mockReturnValue({ owner: 'codecov' })
    useOwner.mockReturnValue({ data: ownerData })
    useLocation.mockReturnValue({ pathname: '/gh/codecov' })
    renderHook(() => useUpdatePendoWithOwner(curUser))
  }

  beforeEach(() => {
    setup()
  })

  it('does not fire pendo update options when pathname is the same', () => {
    expect(window.pendo.updateOptions).toHaveBeenCalledTimes(0)
  })
})
