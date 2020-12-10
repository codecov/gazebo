import { Link } from 'react-router-dom'

import { useUser } from 'services/user'
import { useCurrentResource } from 'services/currentResource'

function getOwnerImg(provider, owner) {
  return (
    {
      gh: `https://github.com/${owner}.png?size=40`,
      bb: `https://bitbucket.org/account/${owner}/avatar/40`,
    }[provider] ?? null
  )
}

export function useMainNav() {
  const providerToLabel = {
    gh: 'Github',
    bb: 'BitBucket',
    gl: 'Gitlab',
  }

  const { provider, owner, repo } = useCurrentResource()

  return [
    provider && {
      label: providerToLabel[provider],
      to: `/${provider}`,
      iconName: 'infoCircle',
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
  const { provider } = useCurrentResource()
  const { data: user } = useUser({
    suspense: false,
  })

  if (!user) return []

  return [
    {
      label: 'Personal Settings',
      to: `/account/${provider}/${user.username}`,
      imageUrl: user.avatarUrl,
      LinkComponent: Link,
    },
    {
      label: 'Sign Out',
      href: '/sign-out',
      iconName: 'signOut',
    },
  ].filter(Boolean)
}
