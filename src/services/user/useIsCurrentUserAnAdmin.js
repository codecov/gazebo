import { useOwner } from './useOwner'

export function useIsCurrentUserAnAdmin({ owner }) {
  const { data: ownerData } = useOwner({ username: owner })

  return !!ownerData?.isAdmin
}
