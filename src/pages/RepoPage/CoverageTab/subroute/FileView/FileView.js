import { useParams } from 'react-router-dom'

import DefaultCodeRenderer from 'pages/FileView/DefaultCodeRenderer'
import { getFilenameFromFilePath } from 'shared/utils/url'

function FileView() {
  const { path } = useParams()
  const title = getFilenameFromFilePath(path)

  return <DefaultCodeRenderer title={title} />
}

export default FileView
