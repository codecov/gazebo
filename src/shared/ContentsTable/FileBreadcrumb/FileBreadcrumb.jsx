import { useTreePaths } from 'shared/useTreePaths'
import Breadcrumb from 'ui/Breadcrumb'

function FileBreadcrumb() {
  const { treePaths } = useTreePaths()

  return <Breadcrumb paths={[...treePaths]} />
}

export default FileBreadcrumb
