import { useParams } from 'react-router-dom'

import RawFileviewer from 'shared/RawFileviewer'
import { useCommitTreePaths } from 'shared/treePaths'
import { unsupportedExtensionsMapper } from 'shared/utils/unsupportedExtensionsMapper'
import Breadcrumb from 'ui/Breadcrumb'
import UnsupportedView from 'ui/FileViewer/UnsupportedView'

function CommitDetailFileViewer() {
  const { treePaths } = useCommitTreePaths()
  const { commit } = useParams()

  const isUnsupportedFileType = unsupportedExtensionsMapper(treePaths)

  if (isUnsupportedFileType) {
    return <UnsupportedView treePaths={treePaths} />
  }

  return (
    <RawFileviewer
      title={
        <div className="text-sm font-normal">
          <Breadcrumb paths={treePaths} />
        </div>
      }
      commit={commit}
      withKey={false}
    />
  )
}

export default CommitDetailFileViewer
