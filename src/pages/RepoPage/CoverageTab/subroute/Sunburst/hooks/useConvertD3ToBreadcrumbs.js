import { useParams } from 'react-router-dom'

import { useTreePaths } from 'shared/treePaths'

function useConvertD3ToBreadcrumbs({ path, type } = { path: '' }) {
  const { repo } = useParams()
  const { treePaths } = useTreePaths(path)

  if (path.length === 0) {
    return [{ pageName: 'repo', text: repo }]
  }

  // Reversed for the left truncating trick
  const flipPaths = treePaths.reverse()

  if (type === 'file') {
    flipPaths[0].pageName = 'fileViewer'
  }

  return flipPaths
}

export default useConvertD3ToBreadcrumbs
