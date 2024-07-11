import { useFlags } from 'shared/featureFlags'
import Breadcrumb from 'ui/Breadcrumb'

import { useCrumbs } from './context'

export default function RepoBreadcrumb() {
  const { breadcrumbs } = useCrumbs()

  const { newHeader } = useFlags({
    newHeader: false,
  })

  if (newHeader) {
    return null
  }

  return (
    <div className="sticky top-0 z-10 flex flex-row bg-white px-6 py-2 sm:px-0">
      <Breadcrumb paths={breadcrumbs} />
    </div>
  )
}
