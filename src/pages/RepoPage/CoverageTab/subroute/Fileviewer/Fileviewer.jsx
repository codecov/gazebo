import { useParams } from 'react-router-dom'

import { useRepoSettingsTeam } from 'services/repo'
import { TierNames, useTier } from 'services/tier'
import RawFileviewer from 'shared/RawFileviewer'
import { useTreePaths } from 'shared/treePaths'
import Breadcrumb from 'ui/Breadcrumb'

import ComponentsSelectCoverage from '../ComponentsSelectCoverage'

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
      <div className="flex justify-end bg-ds-gray-primary p-2">
        <ComponentsSelectCoverage />
      </div>
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
      />
    </>
  )
}

export default FileView
