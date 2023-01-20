import Breadcrumb from 'ui/Breadcrumb'

import { useCrumbs } from './context'

export default function RepoBreadcrumb() {
  const crumbs = useCrumbs()

  return (
    <div className="sticky top-0 z-20 bg-white px-6 sm:px-0 py-2 flex flex-row">
      <Breadcrumb paths={crumbs} />
    </div>
  )
}
