import { useParams } from 'react-router-dom'

import { useUser } from 'services/user'
import { useFlags } from 'shared/featureFlags'

export function useShouldRenderBillingTabs() {
  const { gazeboPlanTab } = useFlags({
    gazeboPlanTab: false,
  })

  const { owner } = useParams()
  const { data: currentUser } = useUser()
  const useIsPersonalAccount =
    currentUser?.user?.username?.toLowerCase() === owner?.toLowerCase()

  return gazeboPlanTab && !useIsPersonalAccount
}
