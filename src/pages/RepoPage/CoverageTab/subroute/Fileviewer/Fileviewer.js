import { useParams } from 'react-router-dom'

import RawFileviewer from 'shared/RawFileviewer'
import { getFilenameFromFilePath } from 'shared/utils/url'

function FileView() {
  const { path } = useParams()
  const title = getFilenameFromFilePath(path)

  return <RawFileviewer title={title} />
}

export default FileView
