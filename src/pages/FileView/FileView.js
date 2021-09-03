import { useParams } from 'react-router-dom'
import { useOwner } from 'services/user'
import dropRight from 'lodash/dropRight'
import indexOf from 'lodash/indexOf'

import NotFound from 'pages/NotFound'

import Breadcrumb from 'ui/Breadcrumb'
import FileViewer from 'shared/FileViewer'
import { useFileWithMainCoverage } from 'services/file/hooks'

function getTreeLocation(paths, location) {
  return dropRight(paths, paths.length - indexOf(paths, location) - 1).join('/')
}

function FileView() {
  const { owner, repo, provider, ref, ...path } = useParams()
  const { data: ownerData } = useOwner({ username: owner })
  const paths = path[0].split('/')

  const { data } = useFileWithMainCoverage({
    provider,
    owner,
    repo,
    ref,
    path: path[0],
  })

  const treePaths = paths.map((location) => ({
    pageName: 'treeView',
    text: location,
    options: { tree: getTreeLocation(paths, location), ref: ref },
  }))

  if (!ownerData || !data) {
    return <NotFound />
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="px-3 sm:px-0">
        <Breadcrumb
          paths={[
            { pageName: 'owner', text: owner },
            { pageName: 'repo', text: repo },
            treePaths[treePaths.length - 1],
          ]}
        />
      </div>
      <div className="border-t border-solid border-ds-gray-tertiary pt-6">
        <FileViewer
          flagNames={data.flagNames}
          coverage={data.coverage}
          content={data.content}
          totals={data.totals?.coverage}
          treePaths={treePaths}
          title={treePaths[treePaths.length - 1].text}
        />
      </div>
    </div>
  )
}

export default FileView
