export const gtmUser = {
  ownerid: null,
  avatar: null,
  serviceId: null,
  plan: null,
  staff: null,
  hasYaml: null,
  service: null,
  email: 'unknown@codecov.io',
  name: 'unknown',
  username: 'unknown',
  student: false,
  bot: false,
  delinquent: false,
  didTrial: false,
  privateAccess: false,
  planProvider: '',
  planUserCount: 5,
  createdAt: '2014-01-01T12:00:00.000Z',
  updatedAt: '2014-01-01T12:00:00.000Z',
  studentCreatedAt: '2014-01-01T12:00:00.000Z',
  studentUpdatedAt: '2014-01-01T12:00:00.000Z',
}

export function setDataLayer(user) {
  window.dataLayer = [
    {
      codecov: {
        app: {
          version: 'react-app',
        },
        user,
      },
    },
  ]
}
