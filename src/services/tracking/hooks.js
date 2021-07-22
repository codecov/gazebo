import omitBy from 'lodash/omitBy'
import isNull from 'lodash/isNull'
import defaults from 'lodash/defaults'
import mapKeys from 'lodash/mapKeys'
import snakeCase from 'lodash/snakeCase'
import { useUser } from 'services/user'

const defaultData = {
  ownerid: null,
  avatarUrl: null,
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
  createstamp: new Date('2014-01-01 12:00:00').toISOString(),
  updatestamp: new Date('2014-01-01 12:00:00').toISOString(),
  studentCreatedAt: new Date('2014-01-01 12:00:00').toISOString(),
  studentUpdatedAt: new Date('2014-01-01 12:00:00').toISOString(),
}

function getUserData(userData) {
  // fields we need are in different place in userData
  // so we need to build a flat object
  const flatObject = {
    ...userData.trackingMetadata,
    ...userData.user,
    privateAccess: userData.privateAccess,
    email: userData.email,
    guest: false,
  }

  // remove all the key that has a null value
  const userWithoutNull = omitBy(flatObject, isNull)

  // apply the default values
  const userWithDefault = defaults(userWithoutNull, defaultData)

  // convert camelCase keys to snake_case
  return mapKeys(userWithDefault, (_, key) => snakeCase(key))
}

function setDataLayer(user) {
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

export function useTracking() {
  return useUser({
    onSuccess: (user) => setDataLayer(getUserData(user)),
    onError: (data) => setDataLayer({ guest: true }),
    suspense: false,
  })
}
