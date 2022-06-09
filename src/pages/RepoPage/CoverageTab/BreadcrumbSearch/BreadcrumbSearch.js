import Breadcrumb from 'ui/Breadcrumb'

import { useTreePaths } from './hooks'

function BreadcrumbSearch() {
  const { treePaths } = useTreePaths()
  return (
    <div className="flex justify-between border-b border-ds-gray-tertiary py-6">
      <Breadcrumb paths={[...treePaths]} />
      <p>Search Goes Here</p>
    </div>
  )
}

export default BreadcrumbSearch
