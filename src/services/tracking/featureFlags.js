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

function createUser(user) {
  if (!user) return
  const username =
    Cookie.get('github-username') ||
    Cookie.get('bitbucket-username') ||
    Cookie.get('gitlab-username') ||
    user.user.username

  const { custom: defaultCustom, ...defaultTopLevel } = defaultUser
  const topLevelUser = Object.assign({}, defaultTopLevel, {
    key: user.trackingMetadata.ownerid,
    name: user.user.name,
    email: user.email,
    avatar: user.user.avatarUrl,
  })
  return {
    ...topLevelUser,
    custom: getUserData({ ...user, username }, defaultCustom),
  }
}

export function useTrackFeatureFlags(user) {
  useIdentifyUser(createUser(user))
}
