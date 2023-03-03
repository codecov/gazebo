import { useLocation, useParams } from 'react-router-dom'

import {
  pullFileviewString,
  pullTreeviewString,
} from 'pages/PullRequestPage/utils'
import ToggleHeader from 'ui/FileViewer/ToggleHeader'
import TabNavigation from 'ui/TabNavigation'

import { useTabsCounts } from './hooks'

function PullRequestPageTabs() {
  const {
    flagsCount,
    indirectChangesCount,
    directChangedFilesCount,
    commitsCount,
  } = useTabsCounts()

  const { pathname } = useLocation()
  const { provider, owner, repo, pullId } = useParams()

  const blobPath = pathname.includes(
    `/${provider}/${pullFileviewString({ owner, repo, pullId })}`
  )

  const filePath = pathname.includes(
    `/${provider}/${pullTreeviewString({ owner, repo, pullId })}`
  )

  let customLocation = undefined
  if (blobPath || filePath) {
    customLocation = {
      pathname: `/${provider}/${owner}/${repo}/pull/${pullId}/tree`,
    }
  }

  return (
    <TabNavigation
      tabs={[
        {
          pageName: 'pullDetail',
          children: (
            <>
              Files changed
              <sup className="text-xs">{directChangedFilesCount}</sup>
            </>
          ),
          exact: true,
        },
        {
          pageName: 'pullIndirectChanges',
          children: (
            <>
              Indirect changes
              <sup className="text-xs">{indirectChangesCount}</sup>
            </>
          ),
        },
        {
          pageName: 'pullCommits',
          children: (
            <>
              Commits
              <sup className="text-xs">{commitsCount}</sup>
            </>
          ),
        },
        {
          pageName: 'pullFlags',
          children: (
            <>
              Flags
              <sup className="text-xs">{flagsCount}</sup>
            </>
          ),
        },
        {
          pageName: 'pullTreeView',
          children: 'File explorer',
          options: { pullId },
          location: customLocation,
        },
      ]}
      component={<ToggleHeader coverageIsLoading={false} />}
    />
  )
}

export default PullRequestPageTabs
