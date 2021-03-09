import { useParams } from 'react-router-dom'

import { useUser } from 'services/user'
import { getOwnerImg, providerImage, providerToName } from 'shared/utils'

export function useMainNav() {
  const { provider, owner, repo } = useParams()

  return [
    provider && {
      label: providerToName(provider),
      to: `/${provider}`,
      imageUrl: providerImage(provider),
    },
    owner && {
      label: owner,
      to: `/${provider}/${owner}`,
      imageUrl: getOwnerImg(provider, owner),
    },
    repo && {
      label: repo,
      to: `/${provider}/${owner}/${repo}`,
      iconName: 'infoCircle',
    },
  ].filter(Boolean)
}

export function useSubNav() {
  const { provider } = useParams()
  const { data: user } = useUser({
    suspense: false,
  })

  if (!user) return []

  return [
    {
      label: 'Personal Settings',
      to: `/account/${provider}/${user.username}`,
      imageUrl: user.avatarUrl,
    },
    {
      label: 'Sign Out',
      href: '/sign-out',
      iconName: 'signOut',
    },
  ].filter(Boolean)
}
