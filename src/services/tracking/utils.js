import omitBy from 'lodash/omitBy'
import isNull from 'lodash/isNull'
import defaults from 'lodash/defaults'
import mapKeys from 'lodash/mapKeys'
import snakeCase from 'lodash/snakeCase'
import pick from 'lodash/pick'

export function getUserData(userData, defaultData) {
  // only limiting the keys from the defaults data
  const keysWeNeed = Object.keys(defaultData)

  // fields we need are in different place in userData
  // so we need to build a flat object
  const flatObject = {
    ...pick(userData?.trackingMetadata, keysWeNeed),
    ...pick(userData?.user, keysWeNeed),
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
