import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useIsCurrentUserAnAdmin } from 'services/user'
import { useRedirect } from 'shared/useRedirect'

export function useRedirectToBilling() {
  const { provider, owner } = useParams()
  const href = `/account/${provider}/${owner}/billing`

  const isAdmin = useIsCurrentUserAnAdmin({ owner })
  const { hardRedirect } = useRedirect({ href })

  useEffect(() => {
    if (!isAdmin) {
      hardRedirect()
    }
  }, [hardRedirect, isAdmin])
}
