import { useParams } from 'react-router-dom'

import { useUser } from 'services/user'

//once we are done with this feature flag, we should call this useIsPersonalAccount, watch out for this change's ripple effect
export function useShouldRenderBillingTabs() {
  const { owner } = useParams()
  const { data: currentUser } = useUser()
  const isPersonalAccount =
    currentUser?.user?.username?.toLowerCase() === owner?.toLowerCase()

  return !isPersonalAccount
}
