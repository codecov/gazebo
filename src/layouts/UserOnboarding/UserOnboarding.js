import { useUser } from 'services/user'
import { useFlags } from 'shared/featureFlags'

function UserOnboarding() {
  const { data: currentUser } = useUser({
    suspense: false,
  })
  const { userSignupOnboardingQuestions } = useFlags({
    userSignupOnboardingQuestions: 'test',
  })

  if (!userSignupOnboardingQuestions || currentUser?.onboardingCompleted) {
    return null
  }

  return 'UserOnboarding'
}

export default UserOnboarding
