import { useParams } from 'react-router-dom'
import { useOwner } from 'services/user'
import dropRight from 'lodash/dropRight'
import indexOf from 'lodash/indexOf'

import NotFound from 'pages/NotFound'

import Breadcrumb from 'ui/Breadcrumb'

function getTreeLocation(paths, location) {
  return dropRight(paths, paths.length - indexOf(paths, location) - 1).join('/')
}

function FileView() {
  const { owner, repo, ...path } = useParams()
  const { data: ownerData } = useOwner({ username: owner })
  const paths = path[0].split('/')
  const treePaths = paths.map((location) => ({
    pageName: 'treeView',
    text: location,
    options: { tree: getTreeLocation(paths, location) },
  }))

  if (!ownerData) {
    return <NotFound />
  }

  return (
    <>
      <Breadcrumb
        paths={[
          { pageName: 'owner', text: owner },
          { pageName: 'repo', text: repo },
          ...treePaths,
        ]}
      />
      <div className="border-t border-solid border-ds-gray-tertiary mt-4 py-6">
        file view
      </div>
    </>
  )
}

export default FileView
