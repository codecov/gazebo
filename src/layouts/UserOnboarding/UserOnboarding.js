import Cookie from 'js-cookie'

import { useUser } from 'services/user'
import { useFlags } from 'shared/featureFlags'

import UserOnboardingModal from './UserOnboardingModal'

function UserOnboarding() {
  const { data: currentUser } = useUser({
    suspense: false,
  })
  const { userSignupOnboardingQuestions } = useFlags({
    userSignupOnboardingQuestions: false,
  })

  const staffCookie = Cookie.get('staff_user')

  // render the onboarding flow if
  const shouldRender = [
    userSignupOnboardingQuestions, // feature flag is true
    Boolean(currentUser), // user is authenticated
    !Boolean(currentUser?.onboardingCompleted), // user hasnt done onboarding
    !staffCookie, // user is not a staff member
  ].every(Boolean)

  if (!shouldRender) return null

  return <UserOnboardingModal currentUser={currentUser} />
}

export default UserOnboarding
