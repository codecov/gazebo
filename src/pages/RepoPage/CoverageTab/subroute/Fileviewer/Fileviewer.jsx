import { useParams } from 'react-router-dom'

import FileBreadcrumb from 'shared/ContentsTable/FileBreadcrumb'
import RawFileviewer from 'shared/RawFileviewer'
import { useTreePaths } from 'shared/treePaths'

function FileView() {
  const { treePaths } = useTreePaths()
  const { ref: commit } = useParams()

  return (
    <RawFileviewer
      title={
        <div className="text-sm font-normal">
          <FileBreadcrumb paths={[...treePaths]} />
        </div>
      }
      commit={commit}
      sticky
      stickyPadding={215}
    />
  )
}

export default FileView
