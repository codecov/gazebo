import Cookie from 'js-cookie'

import { useIdentifyUser } from 'shared/featureFlags'

import { getUserData } from './utils'

const defaultUser = {
  name: null,
  email: null,
  key: null,
  avatar: null,
  custom: {
    student: false,
    username: null,
    service: null,
    ownerid: null,
    serviceId: null,
    plan: null,
    staff: true,
    hasYaml: false,
    bot: null,
    delinquent: null,
    didTrial: null,
    planProvider: null,
    planUserCount: null,
    createdAt: null,
    updatedAt: null,
  },
}

/**
 * Takes the user object from the me query extends a default user shape and extends the object with the passed user object.
 * If there is no user (not logged in) dont identify user.
 *
 * @param {*} user
 * @returns
 */
function createUser(user) {
  if (!user) return

  const staff = Cookie.get('staff_user')
  const key = staff ? `impersonated` : user.trackingMetadata.ownerid
  const { custom: defaultCustom, ...defaultTopLevel } = defaultUser
  const topLevelUser = Object.assign({}, defaultTopLevel, {
    key,
    name: user.user.name,
    email: user.email,
    avatar: user.user.avatarUrl,
  })

  return {
    ...topLevelUser,
    custom: getUserData({ ...user }, defaultCustom),
  }
}

/**
 * Optional user object from me query is passed into a function to create our custom user object shape
 * and passed on to the flag service.if no user is provided use is considered anonymous.
 * @param {*} user
 */
export function useTrackFeatureFlags(user) {
  useIdentifyUser(createUser(user))
}
