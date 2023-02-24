import PropTypes from 'prop-types'
import { useLocation, useParams } from 'react-router-dom'

import {
  commitFileviewString,
  commitTreeviewString,
} from 'pages/RepoPage/utils'
import ToggleHeader from 'ui/FileViewer/ToggleHeader'
import TabNavigation from 'ui/TabNavigation'

function CommitDetailPageTabs({
  commitSHA,
  indirectChangedFilesCount,
  directChangedFilesCount,
}) {
  const { pathname } = useLocation()
  const { provider, owner, repo } = useParams()

  const blobPath = pathname.includes(
    `/${provider}/${commitFileviewString({ owner, repo, commitSHA })}`
  )

  const filePath = pathname.includes(
    `/${provider}/${commitTreeviewString({ owner, repo, commitSHA })}`
  )

  let customLocation = undefined
  if (blobPath || filePath) {
    customLocation = {
      pathname: `/${provider}/${owner}/${repo}/commit/${commitSHA}/tree`,
    }
  }

  return (
    <TabNavigation
      tabs={[
        {
          pageName: 'commit',
          children: (
            <>
              Files changed
              <sup className="text-xs">{directChangedFilesCount}</sup>
            </>
          ),
          options: { commit: commitSHA },
          exact: true,
        },
        {
          pageName: 'commitIndirectChanges',
          options: { commit: commitSHA },
          children: (
            <>
              Indirect changes
              <sup className="text-xs">{indirectChangedFilesCount}</sup>
            </>
          ),
        },
        {
          pageName: 'commitTreeView',
          children: 'Files',
          options: { commit: commitSHA },
          location: customLocation,
        },
      ]}
      component={<ToggleHeader coverageIsLoading={false} />}
    />
  )
}

CommitDetailPageTabs.propTypes = {
  commitSHA: PropTypes.string,
  indirectChangedFilesCount: PropTypes.number,
  directChangedFilesCount: PropTypes.number,
}

export default CommitDetailPageTabs
