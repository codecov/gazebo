import Breadcrumb from 'ui/Breadcrumb'

import { useCrumbs } from './context'

function PlanBreadcrumb() {
  const crumbs = useCrumbs()

  return <Breadcrumb paths={crumbs} />
}

export default PlanBreadcrumb
