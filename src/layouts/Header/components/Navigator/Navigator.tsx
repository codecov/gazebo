import { useRouteMatch } from 'react-router-dom'

import { useCrumbs } from 'pages/RepoPage/context'
import Breadcrumb from 'ui/Breadcrumb'

function Navigator() {
  const { path } = useRouteMatch()
  const { breadcrumbs } = useCrumbs()

  if (path.startsWith('/:provider/:owner/:repo')) {
    return <Breadcrumb paths={breadcrumbs} />
  }

  return <p>MyContextSwitcher</p>
}

export default Navigator
