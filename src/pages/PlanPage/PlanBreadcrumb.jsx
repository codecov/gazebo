import Breadcrumb from 'ui/Breadcrumb'

import { useCrumbs } from './context'

function PlanBreadcrumb() {
  const crumbs = useCrumbs()

  return (
    <div className="mx-6 flex flex-row text-lg md:mx-0">
      <Breadcrumb paths={crumbs} />
    </div>
  )
}

export default PlanBreadcrumb
