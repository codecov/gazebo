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
        },
      ]}
      component={<ToggleHeader coverageIsLoading={false} />}
    />
  )
}

export default PullRequestPageTabs
