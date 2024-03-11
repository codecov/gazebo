import { useParams } from 'react-router-dom'

import RawFileviewer from 'shared/RawFileviewer'
import { usePullTreePaths } from 'shared/treePaths'
import Breadcrumb from 'ui/Breadcrumb'

import { usePullPageData } from '../../../hooks'

function FileViewer() {
  const { treePaths } = usePullTreePaths()
  const { owner, repo, pullId, provider } = useParams()
  const { data } = usePullPageData({ provider, owner, repo, pullId })

  return (
    <>
      <RawFileviewer
        title={
          <div className="text-sm font-normal">
            <Breadcrumb paths={treePaths} />
          </div>
        }
        commit={data?.pull?.head?.commitid}
        withKey={false}
        stickyPadding={410}
        showComponentsSelect
      />
    </>
  )
}

export default FileViewer
