import omitBy from 'lodash/omitBy'
import isNull from 'lodash/isNull'
import defaults from 'lodash/defaults'
import mapKeys from 'lodash/mapKeys'
import snakeCase from 'lodash/snakeCase'
import pick from 'lodash/pick'
import { useUser } from 'services/user'

const defaultData = {
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

function getUserData(userData) {
  // only limiting the keys from the defaults data
  const keysWeNeed = Object.keys(defaultData)

  // fields we need are in different place in userData
  // so we need to build a flat object
  const flatObject = {
    ...pick(userData.trackingMetadata, keysWeNeed),
    ...pick(userData.user, keysWeNeed),
    ...pick(userData, keysWeNeed),
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
