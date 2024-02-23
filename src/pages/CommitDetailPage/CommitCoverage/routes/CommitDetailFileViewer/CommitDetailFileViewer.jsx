import { useParams } from 'react-router-dom'

import RawFileviewer from 'shared/RawFileviewer'
import { useCommitTreePaths } from 'shared/treePaths'
import Breadcrumb from 'ui/Breadcrumb'

import ComponentsSelector from '../ComponentsSelector'

function CommitDetailFileViewer() {
  const { treePaths } = useCommitTreePaths()
  const { commit } = useParams()

  return (
    <>
      <div className="flex justify-end bg-ds-gray-primary p-2">
        <ComponentsSelector />
      </div>
      <RawFileviewer
        title={
          <div className="text-sm font-normal">
            <Breadcrumb paths={treePaths} />
          </div>
        }
        commit={commit}
        withKey={false}
        stickyPadding={450}
      />
    </>
  )
}

export default CommitDetailFileViewer
