import Breadcrumb from 'ui/Breadcrumb'
import { useCrumbs } from './context'

export default function RepoBreadcrumb() {
  const crumbs = useCrumbs()

  return (
    <div className="text-xl ml-6 md:ml-0 font-semibold flex flex-row">
      <Breadcrumb paths={crumbs} />
    </div>
  )
}
