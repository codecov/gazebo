import { useParams } from 'react-router-dom'

import { useRepoSettingsTeam } from 'services/repo'
import { TierNames, useTier } from 'services/tier'
import RawFileviewer from 'shared/RawFileviewer'
import { useTreePaths } from 'shared/treePaths'
import { STICKY_PADDING_SIZES } from 'shared/utils/fileviewer'
import Breadcrumb from 'ui/Breadcrumb'

function FileView() {
  const { treePaths } = useTreePaths()
  const { provider, owner, ref: commit } = useParams()
  const { data: repoData } = useRepoSettingsTeam()

  const { data: tierName } = useTier({ provider, owner })

  const showFlagSelector = !(
    tierName === TierNames.TEAM && repoData?.repository?.private
  )

  return (
    <>
      <RawFileviewer
        title={
          <div className="text-sm font-normal">
            <Breadcrumb paths={treePaths} />
          </div>
        }
        commit={commit}
        sticky
        stickyPadding={STICKY_PADDING_SIZES.REPO_PAGE_FILE_VIEWER}
        showFlagsSelect={showFlagSelector}
        showComponentsSelect
      />
    </>
  )
}

export default FileView
