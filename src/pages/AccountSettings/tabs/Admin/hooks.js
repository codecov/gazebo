import { useCallback, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useIsCurrentUserAnAdmin } from 'services/user'

function useRedirect({ provider, owner }) {
  return {
    hardRedirect: useCallback(() => {
      window.location.replace(`/account/${provider}/${owner}/billing`)
    }, [provider, owner]),
  }
}

export function useRedirectToBilling() {
  const { provider, owner } = useParams()
  const isAdmin = useIsCurrentUserAnAdmin({ owner })
  const { hardRedirect } = useRedirect({ provider, owner })

  useEffect(() => {
    if (!isAdmin) {
      hardRedirect()
    }
  }, [hardRedirect, isAdmin])
}
