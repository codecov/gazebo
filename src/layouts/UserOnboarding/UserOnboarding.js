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

  if (!userSignupOnboardingQuestions || currentUser?.onboardingCompleted) {
    return null
  }

  return <UserOnboardingModal />
}

export default UserOnboarding
