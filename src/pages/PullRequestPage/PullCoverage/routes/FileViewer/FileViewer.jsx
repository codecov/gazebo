import { useSuspenseQuery as useSuspenseQueryV5 } from '@tanstack/react-queryV5'
import { useParams } from 'react-router-dom'

import ToggleHeader from 'pages/PullRequestPage/Header/ToggleHeader/ToggleHeader'
import RawFileViewer from 'shared/RawFileViewer'
import { usePullTreePaths } from 'shared/treePaths'
import { STICKY_PADDING_SIZES } from 'shared/utils/fileviewer'
import Breadcrumb from 'ui/Breadcrumb'

import { PullPageDataQueryOpts } from '../../../queries/PullPageDataQueryOpts'

function FileViewer() {
  const { treePaths } = usePullTreePaths()
  const { owner, repo, pullId, provider } = useParams()
  const { data } = useSuspenseQueryV5(
    PullPageDataQueryOpts({ provider, owner, repo, pullId })
  )

  return (
    <>
      <ToggleHeader />
      <RawFileViewer
        title={
          <div className="text-sm font-normal">
            <Breadcrumb paths={treePaths} />
          </div>
        }
        commit={data?.pull?.head?.commitid}
        withKey={false}
        stickyPadding={STICKY_PADDING_SIZES.PULL_PAGE_FILE_VIEWER}
      />
    </>
  )
}

export default FileViewer
