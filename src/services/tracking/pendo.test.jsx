import { renderHook } from '@testing-library/react'

import { firePendo, useUpdatePendoWithOwner } from './pendo'

const mocks = vi.hoisted(() => ({
  useParams: vi.fn(),
  useLocation: vi.fn(),
  useOwner: vi.fn(),
  useRef: vi.fn(),
}))

vi.mock('react', async () => {
  const original = await vi.importActual('react')
  return {
    ...original,
    useRef: mocks.useRef,
  }
})

vi.mock('services/user', async () => {
  const original = await vi.importActual('services/user')
  return {
    ...original,
    useOwner: mocks.useOwner,
  }
})

vi.mock('react-router-dom', async () => {
  // import and retain the original functionalities
  const original = await vi.importActual('react-router-dom')
  return {
    ...original,
    useParams: mocks.useParams,
    useLocation: mocks.useLocation,
  }
})

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

afterEach(() => {
  vi.clearAllMocks()
})

describe('initialize pendo', () => {
  function setup() {
    const mockInitialize = vi.fn()
    window.pendo = {
      initialize: mockInitialize,
    }

    return { mockInitialize }
  }

  it('fires pendo initialization with expected params', () => {
    const { mockInitialize } = setup()
    firePendo(curUser)

    expect(mockInitialize).toHaveBeenCalledTimes(1)
  })
})

describe('update pendo on owner change', () => {
  function setup() {
    const mockUpdateOptions = vi.fn()
    window.pendo = {
      updateOptions: mockUpdateOptions,
    }

    mocks.useRef.mockReturnValueOnce({
      current: { ...ownerData, ownerid: 456 },
    })
    mocks.useParams.mockReturnValue({ owner: 'codecov' })
    mocks.useOwner.mockReturnValue({ data: ownerData })

    return { mockUpdateOptions }
  }

  it('fires pendo update options when pathname is different', () => {
    const { mockUpdateOptions } = setup()
    renderHook(() => useUpdatePendoWithOwner(curUser))

    expect(mockUpdateOptions).toHaveBeenCalledTimes(1)
  })
})

describe('update pendo when owner is not changed', () => {
  function setup() {
    const mockUpdateOptions = vi.fn()
    window.pendo = {
      updateOptions: mockUpdateOptions,
    }

    mocks.useRef.mockReturnValueOnce({ current: 'codecov' })
    mocks.useParams.mockReturnValue({ owner: 'codecov' })
    mocks.useOwner.mockReturnValue({ data: ownerData })

    return { mockUpdateOptions }
  }

  it('does not fire pendo update', () => {
    const { mockUpdateOptions } = setup()
    renderHook(() => useUpdatePendoWithOwner(curUser))

    expect(mockUpdateOptions).toHaveBeenCalledTimes(0)
  })
})
