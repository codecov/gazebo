// import { useParams } from 'react-router-dom'

import RawFileviewer from 'shared/RawFileviewer'
// import { getFilenameFromFilePath } from 'shared/utils/url'
import Breadcrumb from 'ui/Breadcrumb'

import { useTreePaths } from '../../BreadcrumbSearch/hooks'

function FileView() {
  // const { path } = useParams()
  // const title = getFilenameFromFilePath(path)
  const { treePaths } = useTreePaths()

  return (
    <RawFileviewer
      title={
        <div className="text-sm font-normal">
          <Breadcrumb paths={[...treePaths]} />
        </div>
      }
    />
  )
}

export default FileView
