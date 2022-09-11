import RawFileviewer from 'shared/RawFileviewer'

import FileBreadcrumb from '../../FileBreadcrumb'
import { useTreePaths } from '../../FileBreadcrumb/hooks'

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
