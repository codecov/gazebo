import { useParams } from 'react-router-dom'

import { useOwner, useUser } from 'services/user'

export function firePendo(currentUser) {
  window?.pendo?.initialize({
    visitor: getCurUserInfo(currentUser),
  })
}

export function useUpdatePendoWithOwner() {
  const { owner } = useParams()
  const { data: currentUser } = useUser()
  const { data: ownerData } = useOwner({ username: owner })

  window?.pendo?.updateOptions({
    visitor: getCurUserInfo(currentUser),
    account: {
      id: ownerData?.username, //TBD ownerid
      isCurrentUserPartOfOrg: ownerData?.isCurrentUserPartOfOrg,
      isAdmin: ownerData?.isAdmin,
    },
  })
}

function getCurUserInfo(currentUser) {
  const trackingMetadata = currentUser?.trackingMetadata
  const profile = trackingMetadata?.profile
  const defaultOrg = localStorage.getItem('gz-defaultOrganization')

  return {
    id: trackingMetadata?.ownerid, // Required
    email: currentUser?.email, // Recommended if using Pendo Feedback, or NPS Email
    fullName: currentUser.user?.username, // Recommended if using Pendo Feedback
    // You can add any additional visitor level key-values here as long as it's not one of the above reserved names.
    staff: trackingMetadata?.staff,
    service: trackingMetadata?.service,
    planUserCount: trackingMetadata?.planUserCount,
    createstamp: trackingMetadata?.createdAt,
    profileOtherGoal: profile?.otherGoal,
    profileCreatedAt: profile?.createdAt,
    updatestamp: trackingMetadata?.updatedAt,
    businessEmail: currentUser?.businessEmail,
    onboardingCompleted: currentUser?.onboardingCompleted,
    plan: trackingMetadata?.plan,
    defaultOrg: defaultOrg,
  }
}
