import React from 'react'
import omitBy from 'lodash/omitBy'
import isNull from 'lodash/isNull'
import { useUser } from 'services/user'

import { useLocation } from 'react-router-dom'

let Analytics = require('analytics-node')
let analytics = new Analytics('Btz43oSB3eMmIs4AjqAnCNt5dEjyiRoL')

function getUserData(ownerid, avatarUrl, serviceId) {
  return {
    /* eslint-disable camelcase */
    ownerid,
    avatar: avatarUrl,
    service_id: serviceId,
  }
}

function setSegmentUser(user) {
  const userWithoutNulls = omitBy(user, isNull)
  return user
    ? getUserData(
        userWithoutNulls.ownerid,
        userWithoutNulls.avatarUrl,
        userWithoutNulls.serviceId
      )
    : { guest: true }
}

export function useSegmentUser() {
  let location = useLocation()
  const { data: user } = useUser({
    onSuccess: (user) => setSegmentUser(user),
    onError: (data) => setSegmentUser(null),
    suspense: false,
  })
  console.log(user)
  React.useEffect(() => {
    user &&
      //   analytics.identify({
      //     // ownerid: user.ownerid,
      // //     email,
      // //     username,
      // //     name,
      // //     service,
      // //     service_id,
      // //     plan,
      // //     guest,
      // //     staff,
      // // //     "ownerid": "{{Codecov - User - Owner ID}}",
      // // // "email": "{{Codecov - User - Email}}",
      // // // "username": "{{Codecov - User - Username}}",
      // // // "name": "{{Codecov - User - Name}}",
      // // // "service": "{{Codecov - User - Service}}",
      // // // "service_id": "{{Codecov - User - Service ID}}",
      // // // "plan": "{{Codecov - User - Plan}}",
      // // // "guest": {{Codecov - User - Guest}},
      // // // "staff": {{Codecov - User - Staff}},
      //     userId: "Adam Gibbons",
      //     email: "peter@example.com",
      //     plan: "premium",
      //     logins: 5
      //   })
      analytics.identify({
        userId: '37980cfea0067',
        traits: {
          // owner_id:
          email: user.email,
          username: user.user?.username,
          name: user.user?.name,
          service: user.trackingMetadata?.service,
          service_id: user.trackingMetadata?.serviceId,
          plan: user.trackingMetadata?.plan,
          staff: user.trackingMetadata?.staff,
          // guest:
        },
        // TODO
        // integrations: {
        //   Salesforce: true,
        //   Marketo: false
        // },
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
  }, [location.pathname, user])
}
