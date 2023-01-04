import RawFileviewer from 'shared/RawFileviewer'
import { useCommitTreePaths } from 'shared/treePaths'
import Breadcrumb from 'ui/Breadcrumb'

function FileViewer() {
  const { treePaths } = useCommitTreePaths()

  return (
    <RawFileviewer
      title={
        <div className="text-sm font-normal">
          <Breadcrumb paths={treePaths} />
        </div>
      }
      showTopBorder={false}
    />
  )
}

export default FileViewer
