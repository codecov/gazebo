import { useOwner } from './useOwner'

export function useIsCurrentUserAnAdmin({ owner }: { owner: string }) {
  const { data: ownerData } = useOwner({ username: owner })

  return !!ownerData?.isAdmin
}
