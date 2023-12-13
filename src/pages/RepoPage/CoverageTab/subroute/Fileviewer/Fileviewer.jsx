import { useParams } from 'react-router-dom'

import { useRepoSettingsTeam } from 'services/repo'
import { TierNames, useTier } from 'services/tier'
import { useFlags } from 'shared/featureFlags'
import RawFileviewer from 'shared/RawFileviewer'
import { useTreePaths } from 'shared/treePaths'
import Breadcrumb from 'ui/Breadcrumb'

function FileView() {
  const { treePaths } = useTreePaths()
  const { provider, owner, ref: commit } = useParams()
  const { data: repoData } = useRepoSettingsTeam()

  const { data: tierName } = useTier({ provider, owner })

  const showFlagSelector = !(
    tierName === TierNames.TEAM && repoData?.repository?.private
  )

  const { componentsSelect } = useFlags({
    componentsSelect: false,
  })

  return (
    <RawFileviewer
      title={
        <div className="text-sm font-normal">
          <Breadcrumb paths={treePaths} />
        </div>
      }
      commit={commit}
      sticky
      stickyPadding={215}
      showFlagsSelect={showFlagSelector}
      showComponentsSelect={componentsSelect}
    />
  )
}

export default FileView
