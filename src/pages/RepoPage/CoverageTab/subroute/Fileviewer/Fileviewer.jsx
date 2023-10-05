import { useParams } from 'react-router-dom'

import RawFileviewer from 'shared/RawFileviewer'
import { useTreePaths } from 'shared/treePaths'
import Breadcrumb from 'ui/Breadcrumb'

function FileView() {
  const { treePaths } = useTreePaths()
  const { ref: commit } = useParams()

  return (
    <RawFileviewer
      title={
        <div className="text-sm font-normal">
          <Breadcrumb paths={treePaths} />
        </div>
      }
      commit={commit}
      sticky
      stickyPadding={215}
      showFlagsSelect={true}
    />
  )
}

export default FileView
