import { useParams } from 'react-router-dom'

import FileBreadcrumb from 'shared/ContentsTable/FileBreadcrumb'
import RawFileviewer from 'shared/RawFileviewer'
import { useTreePaths } from 'shared/treePaths'
import { unsupportedExtensionsMapper } from 'shared/utils/unsupportedExtensionsMapper'
import UnsupportedView from 'ui/FileViewer/UnsupportedView'

function FileView() {
  const { treePaths } = useTreePaths()
  const { ref: commit } = useParams()
  const isUnsupportedFileType = unsupportedExtensionsMapper(treePaths)

  if (isUnsupportedFileType) {
    return <UnsupportedView treePaths={treePaths} />
  }

  return (
    <RawFileviewer
      title={
        <div className="text-sm font-normal">
          <FileBreadcrumb />
        </div>
      }
      commit={commit}
      sticky
      stickyPadding={215}
    />
  )
}

export default FileView
