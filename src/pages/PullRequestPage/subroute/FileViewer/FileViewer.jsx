import { useParams } from 'react-router-dom'

import RawFileviewer from 'shared/RawFileviewer'
import { usePullTreePaths } from 'shared/treePaths'
import { unsupportedExtensionsMapper } from 'shared/utils/unsupportedExtensionsMapper'
import Breadcrumb from 'ui/Breadcrumb'
import UnsupportedView from 'ui/FileViewer/UnsupportedView'

import { usePullPageData } from '../../hooks'

function FileViewer() {
  const { treePaths } = usePullTreePaths()
  const { owner, repo, pullId, provider } = useParams()
  const { data } = usePullPageData({ provider, owner, repo, pullId })

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
      commit={data?.pull?.head?.commitid}
      withKey={false}
    />
  )
}

export default FileViewer
