import { Link, useParams } from 'react-router-dom'

import { useUser } from 'services/user'
import { getOwnerImg } from 'shared/utils'
import { appLinks } from 'shared/router'

export function useMainNav() {
  const providerToLabel = {
    gh: 'Github',
    bb: 'BitBucket',
    gl: 'Gitlab',
  }

  const { provider, owner, repo } = useParams()

  return [
    provider && {
      label: providerToLabel[provider],
      to: appLinks.provider.createPath({ provider }),
      external: appLinks.provider.isExternalLink,
      iconName: 'infoCircle',
    },
    owner && {
      label: owner,
      to: appLinks.owner.createPath({ provider, owner }),
      external: appLinks.owner.isExternalLink,
      imageUrl: getOwnerImg(provider, owner), //TODO Does not support GitLab
    },
    repo && {
      label: repo,
      to: appLinks.repo.createPath({ provider, owner, repo }),
      external: appLinks.owner.isExternalLink,
      iconName: 'infoCircle',
    },
  ].filter(Boolean) // Any undefined's are not included in the final array
}

export function useSubNav() {
  const { provider } = useParams()
  const { data: user } = useUser({
    suspense: false,
  })

  if (!user) return []

  return [
    {
      label: appLinks.account.text,
      to: appLinks.account.createPath({ provider, owner: user.username }),
      external: appLinks.account.isExternalLink,
      imageUrl: user.avatarUrl,
      LinkComponent: Link,
    },
    {
      label: appLinks.signOut.text,
      to: appLinks.signOut.path,
      external: appLinks.signOut.isExternalLink,
      iconName: 'signOut',
    },
  ].filter(Boolean) // Any undefined's are not included in the final array
}
