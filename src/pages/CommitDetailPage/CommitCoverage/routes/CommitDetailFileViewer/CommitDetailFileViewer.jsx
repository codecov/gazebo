import { useParams } from 'react-router-dom'

import ToggleHeader from 'pages/CommitDetailPage/Header/ToggleHeader/ToggleHeader'
import RawFileViewer from 'shared/RawFileViewer'
import { useCommitTreePaths } from 'shared/treePaths'
import { STICKY_PADDING_SIZES } from 'shared/utils/fileviewer'
import Breadcrumb from 'ui/Breadcrumb'

function CommitDetailFileViewer() {
  const { treePaths } = useCommitTreePaths()
  const { commit } = useParams()

  return (
    <>
      <ToggleHeader />
      <RawFileViewer
        title={
          <div className="text-sm font-normal">
            <Breadcrumb paths={treePaths} />
          </div>
        }
        commit={commit}
        withKey={false}
        stickyPadding={STICKY_PADDING_SIZES.COMMIT_PAGE_FILE_VIEWER}
      />
    </>
  )
}

export default CommitDetailFileViewer
