import { renderHook } from '@testing-library/react-hooks'
import { useParams } from 'react-router-dom'

import { useOwner, useUser } from 'services/user'

import { firePendo, useUpdatePendoWithOwner } from './pendo'

jest.mock('services/user')
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'), // import and retain the original functionalities
  useParams: jest.fn(() => {}),
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
  isCurrentUserPartOfOrg: true,
}

const expectedInitialization = {
  visitor: {
    businessEmail: 'userbzemail@gmail.com',
    createstamp: undefined,
    defaultOrg: null,
    email: 'user@gmail.com',
    fullName: 'random',
    id: 1999,
    onboardingCompleted: true,
    plan: 'users-free',
    planUserCount: undefined,
    profileGoals: undefined,
    profileTypeProjects: undefined,
    profileCreatedAt: undefined,
    profileOtherGoal: undefined,
    service: 'github',
    staff: false,
    updatestamp: undefined,
  },
}

const accountUpdate = {
  account: {
    id: 'hash ownerid',
    isAdmin: undefined,
    isCurrentUserPartOfOrg: true,
  },
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
    expect(window.pendo.initialize).toHaveBeenCalledWith(expectedInitialization)
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
    renderHook(() => useUpdatePendoWithOwner())
  }

  beforeEach(() => {
    setup()
  })

  it('fires pendo update options with expected params', () => {
    expect(window.pendo.updateOptions).toHaveBeenCalledTimes(1)
    expect(window.pendo.updateOptions).toHaveBeenCalledWith({
      ...expectedInitialization,
      ...accountUpdate,
    })
  })
})
