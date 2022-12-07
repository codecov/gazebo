import RawFileviewer from 'shared/RawFileviewer'
import { useTreePaths } from 'shared/useTreePaths'

import FileBreadcrumb from '../../FileBreadcrumb'

function FileView() {
  const { treePaths } = useTreePaths()

  return (
    <RawFileviewer
      title={
        <div className="text-sm font-normal">
          <FileBreadcrumb paths={[...treePaths]} />
        </div>
      }
    />
  )
}

export default FileView
