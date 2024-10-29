import { useParams, useRouteMatch } from 'react-router-dom'

import { useOwnerPageData } from 'pages/OwnerPage/hooks'
import { useCrumbs } from 'pages/RepoPage/context'
import { Me } from 'services/user'
import Breadcrumb from 'ui/Breadcrumb'
import Label from 'ui/Label'

import MyContextSwitcher from './MyContextSwitcher'

interface NavigatorProps {
  currentUser?: Me
}

function Navigator({ currentUser }: NavigatorProps) {
  const { owner } = useParams<{ owner: string }>()
  const { data: ownerData } = useOwnerPageData({ enabled: !!owner })
  const { path } = useRouteMatch()
  const { breadcrumbs } = useCrumbs()

  const isCurrentUserPartOfOrg = ownerData && ownerData.isCurrentUserPartOfOrg

  // Repo page
  if (path.startsWith('/:provider/:owner/:repo')) {
    return (
      <div className="flex items-center">
        <Breadcrumb paths={breadcrumbs} largeFont />{' '}
        {isCurrentUserPartOfOrg ? null : (
          <Label variant="plain" className="hidden sm:block">
            Viewing as visitor
          </Label>
        )}
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
      {isCurrentUserPartOfOrg ? null : (
        <Label variant="plain" className="hidden sm:block">
          Viewing as visitor
        </Label>
      )}
    </div>
  )
}

export default Navigator
