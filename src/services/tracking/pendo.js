import { useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'

import { useOwner } from 'services/user'
import { snakeifyKeys } from 'shared/utils/snakeifyKeys'

import { getUserData } from './utils'

export function firePendo(currentUser) {
  window?.pendo?.initialize({
    visitor: getCurUserInfo(currentUser),
  })
}

export function useUpdatePendoWithOwner(user) {
  const { owner } = useParams()
  const { data: ownerData } = useOwner({
    username: owner,
    opts: {
      enabled: owner !== undefined,
      suspense: false,
    },
  })
  const currentUser = getUserData(user, pendoDefaultUser)
  const oldOwner = useRef()

  useEffect(() => {
    if (oldOwner.current?.ownerid !== owner?.ownerid) {
      window?.pendo?.updateOptions({
        visitor: getCurUserInfo(currentUser),
        account: snakeifyKeys({
          id: ownerData?.ownerid,
          name: ownerData?.username,
          isCurrentUserPartOfOrg: ownerData?.isCurrentUserPartOfOrg,
          isAdmin: ownerData?.isAdmin,
        }),
      })
    }

    if (ownerData) {
      oldOwner.current = owner
    } else {
      oldOwner.current = undefined
    }
  }, [oldOwner, owner, currentUser, ownerData])
}

export function getCurUserInfo(currentUser) {
  const profile = currentUser?.profile
  const defaultOrg = localStorage.getItem('gz-defaultOrganization')

  return snakeifyKeys({
    ...currentUser,
    id: currentUser?.ownerid, // Required
    fullName: currentUser?.username, // Recommended if using Pendo Feedback
    // You can add any additional visitor level key-values here as long as it's not one of the above reserved names.
    profileGoals: profile?.goals,
    profileTypeProjects: profile?.typeProjects,
    profileOtherGoal: profile?.otherGoal,
    profileCreatedAt: profile?.createdAt,
    defaultOrg: defaultOrg,
  })
}

export const pendoDefaultUser = {
  ownerid: null,
  email: null, // Recommended if using Pendo Feedback, or NPS Email
  staff: null,
  username: null,
  service: null,
  planUserCount: null,
  createdAt: null,
  profile: null,
  updatedAt: null,
  businessEmail: null,
  onboardingCompleted: null,
  plan: null,
  jsOrTsPresent: null,
}
