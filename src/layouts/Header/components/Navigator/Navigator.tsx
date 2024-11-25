import { useParams, useRouteMatch } from 'react-router-dom'

import { useOwnerPageData } from 'pages/OwnerPage/hooks'
import { useCrumbs } from 'pages/RepoPage/context'
import { Me } from 'services/user'
import Avatar from 'ui/Avatar'
import Breadcrumb from 'ui/Breadcrumb'
import Label from 'ui/Label'

import MyContextSwitcher from './MyContextSwitcher'

interface NavigatorProps {
  currentUser?: Me
  hasRepoAccess?: boolean
}

function Navigator({ currentUser, hasRepoAccess }: NavigatorProps) {
  const { owner } = useParams<{ owner: string }>()
  const { data: ownerData } = useOwnerPageData({ enabled: !!owner })
  const { path } = useRouteMatch()
  const { breadcrumbs } = useCrumbs()

  const isCurrentUserPartOfOrg = ownerData?.isCurrentUserPartOfOrg

  // Repo page
  // slightly annoyed that we have to have a nested if here but i couldn't
  // think of a better way to do this and be this clear of what's happening
  if (path.startsWith('/:provider/:owner/:repo')) {
    if (hasRepoAccess === false) {
      return null
    }

    return (
      <div className="flex items-center">
        <span className="inline-block">
          <Breadcrumb paths={breadcrumbs} largeFont />{' '}
        </span>
        {isCurrentUserPartOfOrg === false ? (
          <Label variant="plain" className="ml-2 hidden sm:block">
            Viewing as visitor
          </Label>
        ) : null}
      </div>
    )
  }

  // Self-hosted admin settings
  if (path.startsWith('/admin/:provider')) {
    const defaultOrg =
      currentUser?.owner?.defaultOrgUsername ?? currentUser?.user?.username

    return (
      <Breadcrumb
        paths={[
          {
            pageName: 'owner',
            text: defaultOrg,
            options: { owner: defaultOrg },
          },
          { pageName: '', readOnly: true, text: 'Admin' },
        ]}
        largeFont
      />
    )
  }

  // Fallback instead of MyContextSwitcher if not logged in
  // If the owner doesn't exist, don't show anything
  if (!currentUser && ownerData) {
    return (
      <div className="flex items-center">
        <Avatar user={ownerData} />
        <h2 className="mx-2 text-xl font-semibold">{ownerData?.username}</h2>
        {isCurrentUserPartOfOrg === false ? (
          <Label variant="plain" className="ml-2 hidden sm:block">
            Viewing as visitor
          </Label>
        ) : null}
      </div>
    )
  }

  let pageName = 'owner'
  if (path.startsWith('/analytics/:provider/:owner')) {
    pageName = 'analytics'
  } else if (path.startsWith('/members/:provider/:owner')) {
    pageName = 'membersTab'
  } else if (path.startsWith('/plan/:provider/:owner')) {
    pageName = 'planTab'
  } else if (path.startsWith('/account/:provider/:owner')) {
    pageName = 'accountAdmin'
  }

  return (
    <div className="flex items-center">
      <MyContextSwitcher pageName={pageName} />
      {isCurrentUserPartOfOrg === false ? (
        <Label variant="plain" className="ml-2 hidden sm:block">
          Viewing as visitor
        </Label>
      ) : null}
    </div>
  )
}

export default Navigator
