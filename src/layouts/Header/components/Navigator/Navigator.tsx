import { useRouteMatch } from 'react-router-dom'

import { useCrumbs } from 'pages/RepoPage/context'
import { useUser } from 'services/user'
import Breadcrumb from 'ui/Breadcrumb'

import MyContextSwitcher from './MyContextSwitcher'

interface NavigatorProps {
  currentUser: ReturnType<typeof useUser>
}

function Navigator({ currentUser }: NavigatorProps) {
  const { path } = useRouteMatch()
  const { breadcrumbs } = useCrumbs()

  // Repo page
  if (path.startsWith('/:provider/:owner/:repo')) {
    return <Breadcrumb paths={breadcrumbs} largeFont />
  }

  // Selfhosted admin settings
  if (path.startsWith('/admin/:provider')) {
    const defaultOrg =
      currentUser.data?.owner?.defaultOrgUsername ??
      currentUser.data?.user?.username
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
