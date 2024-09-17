import { getUserData } from './utils'

describe('getUserData', () => {
  let result

  const defaultUser = {
    ownerid: null,
    email: 'unknown@codecov.io',
    name: 'unknown',
    username: 'unknown',
    service: null,
    plan: null,
    staff: null,
    serviceId: null,
  }

  function setup(user) {
    result = getUserData(user, defaultUser)
  }

  describe('when user has all the data', () => {
    const user = {
      trackingMetadata: {
        ownerid: 1,
        serviceId: '123',
        plan: 'plan',
        staff: true,
        service: 'github',
      },
      user: {
        name: 'Test User',
        username: 'test_user',
      },
      email: 'tedlasso@test.com',
    }

    beforeEach(() => {
      setup(user)
    })

    it('should map the user data appropriately', () => {
      expect(result).toEqual({
        email: 'tedlasso@test.com',
        guest: false,
        name: 'Test User',
        ownerid: 1,
        plan: 'plan',
        service: 'github',
        service_id: '123',
        staff: true,
        username: 'test_user',
      })
    })
  })

  describe('when user has some missing data', () => {
    const user = {
      trackingMetadata: {
        ownerid: 1,
        serviceId: null,
        plan: null,
        staff: true,
        service: 'github',
      },
      user: {
        name: 'Test User2',
        username: null,
      },
      email: null,
    }

    beforeEach(() => {
      setup(user)
    })

    it('should map the user data appropriately', () => {
      expect(result).toEqual({
        email: 'unknown@codecov.io',
        guest: false,
        name: 'Test User2',
        ownerid: 1,
        plan: null,
        service: 'github',
        service_id: null,
        staff: true,
        username: 'unknown',
      })
    })
  })
})
