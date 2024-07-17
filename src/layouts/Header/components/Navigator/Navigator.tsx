import { useRouteMatch } from 'react-router-dom'

import { useCrumbs } from 'pages/RepoPage/context'
import { Me } from 'services/user'
import Breadcrumb from 'ui/Breadcrumb'

import MyContextSwitcher from './MyContextSwitcher'

interface NavigatorProps {
  currentUser: Me
}

function Navigator({ currentUser }: NavigatorProps) {
  const { path } = useRouteMatch()
  const { breadcrumbs } = useCrumbs()

  // Repo page
  if (path.startsWith('/:provider/:owner/:repo')) {
    return <Breadcrumb paths={breadcrumbs} largeFont />
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

  // Everything else uses MyContextSwitcher
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

  return <MyContextSwitcher pageName={pageName} />
}

export default Navigator
