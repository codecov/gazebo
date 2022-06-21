import Breadcrumb from 'ui/Breadcrumb'

import { useTreePaths } from './hooks'

function FileBreadcrumb() {
  const { treePaths } = useTreePaths()

  return <Breadcrumb paths={[...treePaths]} />
}

export default FileBreadcrumb
