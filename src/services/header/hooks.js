import { useParams } from 'react-router-dom'

import { useUser } from 'services/user'
import { useNavLinks } from 'services/navigation'
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
      useRouter: !providerLink.isExternalLink,
      imageUrl: providerImage(provider),
    },
    owner && {
      label: owner,
      to: onwerLink.path(),
      useRouter: !onwerLink.isExternalLink,
      imageUrl: getOwnerImg(provider, owner), //TODO Does not support GitLab
    },
    repo && {
      label: repo,
      to: repoLink.path(),
      useRouter: !repoLink.isExternalLink,
      iconName: 'infoCircle',
    },
  ].filter(Boolean) // Any undefined's are not included in the final array
}

export function useSubNav() {
  const { data: user } = useUser({
    suspense: false,
  })
  const { account, signOut } = useNavLinks()

  if (!user) return []

  return [
    {
      label: account.text,
      to: account.path({ owner: user?.username }),
      useRouter: !account.isExternalLink,
      imageUrl: user.avatarUrl,
      hideAvatar: true,
    },
    {
      label: signOut.text,
      to: signOut.path(),
      useRouter: !signOut.isExternalLink,
      iconName: 'signOut',
      hideAvatar: true,
    },
  ].filter(Boolean) // Any undefined's are not included in the final array
}
