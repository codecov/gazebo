import { useRouteMatch } from 'react-router-dom'

import { useCrumbs } from 'pages/RepoPage/context'
import Breadcrumb from 'ui/Breadcrumb'

import MyContextSwitcher from './MyContextSwitcher'

function Navigator() {
  const { path } = useRouteMatch()
  const { breadcrumbs } = useCrumbs()

  if (path.startsWith('/:provider/:owner/:repo')) {
    return <Breadcrumb paths={breadcrumbs} largeFont />
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

  return <MyContextSwitcher pageName={pageName} />
}

export default Navigator
