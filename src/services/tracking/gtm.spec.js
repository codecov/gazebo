import { setDataLayer } from './gtm'

describe('setDataLayer', () => {
  function setup(user) {
    setDataLayer(user)
  }

  describe('when user has all the data', () => {
    const user = {
      owner_id: 1,
      has_yaml: true,
      service_id: '123',
      plan: 'plan',
      staff: true,
      bot: true,
      delinquent: true,
      did_trial: true,
      plan_provider: 'provider',
      plan_user_count: 1000,
      service: 'github',
      created_at: new Date('2017-01-01 12:00:00').toISOString(),
      updated_at: new Date('2018-01-01 12:00:00').toISOString(),
      avatar: 'avatar',
      name: 'Eugene Onegin',
      username: 'eugene_onegin',
      student: true,
      student_created_at: new Date('2019-01-01 12:00:00').toISOString(),
      student_updated_at: new Date('2020-01-01 12:00:00').toISOString(),
      private_access: true,
      email: 'fake@test.com',
    }

    beforeEach(() => {
      setup(user)
    })

    it('should set full data in the dataLayer', () => {
      expect(window.dataLayer[0]).toEqual({
        codecov: {
          app: {
            version: 'react-app',
          },
          user: {
            owner_id: 1,
            has_yaml: true,
            avatar: 'avatar',
            service_id: '123',
            plan: 'plan',
            staff: true,
            email: 'fake@test.com',
            name: 'Eugene Onegin',
            username: 'eugene_onegin',
            student: true,
            bot: true,
            delinquent: true,
            did_trial: true,
            private_access: true,
            plan_provider: 'provider',
            plan_user_count: 1000,
            service: 'github',
            created_at: new Date('2017-01-01 12:00:00').toISOString(),
            updated_at: new Date('2018-01-01 12:00:00').toISOString(),
            student_created_at: new Date('2019-01-01 12:00:00').toISOString(),
            student_updated_at: new Date('2020-01-01 12:00:00').toISOString(),
          },
        },
      })
    })
  })

  describe('when user is anonymous', () => {
    beforeEach(() => {
      setup({ guest: true })
    })

    it('should make an identify call as a guest', () => {
      expect(window.dataLayer[0]).toEqual({
        codecov: {
          app: {
            version: 'react-app',
          },
          user: {
            guest: true,
          },
        },
      })
    })
  })
})
