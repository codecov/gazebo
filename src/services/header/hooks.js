import { useParams } from 'react-router-dom'

import { useUser } from 'services/user'
import { useNavLinks, useStaticNavLinks } from 'services/navigation'
import { getOwnerImg, providerImage, providerToName } from 'shared/utils'

export function useMainNav() {
  const { provider, owner, repo } = useParams()
  const {
    provider: providerLink,
    owner: onwerLink,
    repo: repoLink,
  } = useNavLinks()

  return [
    provider && {
      label: providerToName(provider),
      to: providerLink.path(),
      imageUrl: providerImage(provider),
    },
    owner && {
      label: owner,
      to: onwerLink.path(),
      imageUrl: getOwnerImg(provider, owner), //TODO Does not support GitLab
    },
    repo && {
      label: repo,
      to: repoLink.path(),
      iconName: 'infoCircle',
    },
  ].filter(Boolean) // Any undefined's are not included in the final array
}

export function useSubNav() {
  const { data: user } = useUser({
    suspense: false,
  })
  const { account } = useNavLinks()
  const { signOut } = useStaticNavLinks()

  if (!user) return []

  return [
    {
      label: account.text,
      to: account.path({ owner: user?.username }),
      imageUrl: user.avatarUrl,
    },
    {
      label: signOut.text,
      to: signOut.path(),
      iconName: 'signOut',
    },
  ].filter(Boolean) // Any undefined's are not included in the final array
}
