import React from 'react'
import omitBy from 'lodash/omitBy'
import isNull from 'lodash/isNull'
import pick from 'lodash/pick'
import mapKeys from 'lodash/mapKeys'
import snakeCase from 'lodash/snakeCase'
import defaults from 'lodash/defaults'
import { useUser } from 'services/user'

import { useLocation } from 'react-router-dom'

let Analytics = require('analytics-node')
let analytics = new Analytics('Btz43oSB3eMmIs4AjqAnCNt5dEjyiRoL')

// function getUserData(ownerid, avatarUrl, serviceId) {
//   return {
//     /* eslint-disable camelcase */
//     ownerid,
//     avatar: avatarUrl,
//     service_id: serviceId,
//   }
// }

// function setSegmentUser(user) {
//   const userWithoutNulls = omitBy(user, isNull)
//   return user
//     ? getUserData(
//         userWithoutNulls.ownerid,
//         userWithoutNulls.avatarUrl,
//         userWithoutNulls.serviceId
//       )
//     : { guest: true }
// }

const defaultUser = {
  ownerid: null,
  email: 'unknown@codecov.io',
  name: 'unknown',
  username: 'unknown',
  service: null,
  plan: null,
  staff: null,
  serviceId: null,
  // guest
}

function mapUserData(userData) {
  // only limiting the keys from the defaults data
  const segmentUser = Object.keys(defaultUser)

  // fields we need are in different place in userData
  // so we need to build a flat object
  const flatObject = {
    ...pick(userData.trackingMetadata, segmentUser),
    ...pick(userData.user, segmentUser),
    ...pick(userData, segmentUser),
    guest: false,
  }

  // remove all the key that has a null value
  // Ask if I want this to behave this way
  const userWithoutNull = omitBy(flatObject, isNull)

  // apply the default values
  const userWithDefault = defaults(userWithoutNull, defaultUser)

  // convert camelCase keys to snake_case
  return mapKeys(userWithDefault, (_, key) => snakeCase(key))
}

export function useSegmentUser() {
  const location = useLocation()
  const { data: user } = useUser({
    suspense: false,
  })
  let segmentUser

  if (user) {
    segmentUser = mapUserData(user)
  }

  console.log('segmentUser')
  console.log(segmentUser)
  React.useEffect(() => {
    segmentUser &&
      analytics.identify({
        userId: segmentUser.ownerid,
        traits: {
          ...segmentUser,
        },
        // TODO
        integrations: {
          Salesforce: true,
          Marketo: false,
        },
        // externalIds: {
        //   id: user.trackingMetadata?.serviceId,
        //   // type: user.trackingMetadata?.serviceId,
        //   collection: "users",
        // }
        //   "externalIds": [{
        //     "id": "{{Codecov - User - Service ID}}",
        //     "type": "{{Codecov - User - Service}}_id",
        //     "collection": "users",
        //     "encoding": "none"
        // }]
      })
  }, [location.pathname, segmentUser])
}
