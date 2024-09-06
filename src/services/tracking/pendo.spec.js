import { renderHook } from '@testing-library/react'
import React from 'react'
import { useParams } from 'react-router-dom'

import { useOwner } from 'services/user'

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
  ownerid: 123,
  username: 'codecov',
  isCurrentUserPartOfOrg: true,
}

describe('initialize pendo', () => {
  function setup() {
    window.pendo = {
      initialize: jest.fn(),
    }
  }

  it('fires pendo initialization with expected params', () => {
    setup()
    firePendo(curUser)

    expect(window.pendo.initialize).toHaveBeenCalledTimes(1)
  })
})

describe('update pendo on owner change', () => {
  function setup() {
    window.pendo = {
      updateOptions: jest.fn(),
    }
    jest
      .spyOn(React, 'useRef')
      .mockReturnValueOnce({ current: { ...ownerData, ownerid: 456 } })

    useParams.mockReturnValue({ owner: 'codecov' })
    useOwner.mockReturnValue({ data: ownerData })
  }

  it('fires pendo update options when pathname is different', () => {
    setup()

    renderHook(() => useUpdatePendoWithOwner(curUser))

    expect(window.pendo.updateOptions).toHaveBeenCalledTimes(1)
  })
})

describe('update pendo when owner is not changed', () => {
  function setup() {
    window.pendo = {
      updateOptions: jest.fn(),
    }
    jest.spyOn(React, 'useRef').mockReturnValueOnce({ current: 'codecov' })

    useParams.mockReturnValue({ owner: 'codecov' })
    useOwner.mockReturnValue({ data: ownerData })
  }

  it('does not fire pendo update', () => {
    setup()

    renderHook(() => useUpdatePendoWithOwner(curUser))

    expect(window.pendo.updateOptions).toHaveBeenCalledTimes(0)
  })
})
