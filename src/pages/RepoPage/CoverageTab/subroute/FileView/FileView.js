import { useParams } from 'react-router-dom'

import DefaultCodeRenderer from 'pages/FileView/DefaultCodeRenderer'

function FileView() {
  const { 0: filePath } = useParams()
  const title = filePath.split('/').pop()

  return <DefaultCodeRenderer title={title} />
}

export default FileView
