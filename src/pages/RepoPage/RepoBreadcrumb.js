import Breadcrumb from 'ui/Breadcrumb'
import { useCrumbs } from './context'

export default function RepoBreadcrumb() {
  const crumbs = useCrumbs()

  return (
    <div className="text-xl mx-6 md:mx-0 font-semibold flex flex-row">
      <Breadcrumb paths={crumbs} />
    </div>
  )
}
