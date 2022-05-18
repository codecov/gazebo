import Cookie from 'js-cookie'

import { useIdentifyUser } from 'shared/featureFlags'

import { getUserData } from './utils'

const getUsernameCookie = () =>
  Cookie.get('github-username') ||
  Cookie.get('bitbucket-username') ||
  Cookie.get('gitlab-username')
const getStaffCookie = () => Cookie.get('staff_user')

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
 * Set a unique user key if cookie does not match me query
 *
 * @param {String} name
 * @param {String} ownerid
 * @returns {{username: String, key: String}} returns username and unique identifier
 */
function setUniqueKeyAndUsername(name, ownerid) {
  const cookieUsername = getUsernameCookie()
  const username = cookieUsername ?? name
  const key = setUniqueKey(name, ownerid)

  return { username, key }
}

/**
 *
 * @param {String} name
 * @param {String} username
 * @param {String} ownerid
 * @param {String|undefined} cookieUsername
 * @returns {string}
 */
function setUniqueKey(name, ownerid) {
  const cookieUsername = getUsernameCookie()
  const staff = getStaffCookie()
  const key =
    cookieUsername !== name && cookieUsername && staff !== cookieUsername
      ? `${ownerid}-${cookieUsername}`
      : ownerid

  return key
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

  const { username, key } = setUniqueKeyAndUsername(
    user.user.username,
    user.trackingMetadata.ownerid
  )
  const { custom: defaultCustom, ...defaultTopLevel } = defaultUser
  const topLevelUser = Object.assign({}, defaultTopLevel, {
    key,
    name: user.user.name,
    email: user.email,
    avatar: user.user.avatarUrl,
  })
  return {
    ...topLevelUser,
    custom: getUserData({ ...user, username }, defaultCustom),
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
