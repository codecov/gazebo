import { useParams } from 'react-router-dom'

import ComponentsMultiSelect from 'pages/PullRequestPage/PullCoverage/routes/ComponentsSelector'
import { useRepoOverview } from 'services/repo'
import { TierNames, useTier } from 'services/tier'
import { useFlags } from 'shared/featureFlags'
import { LINE_STATE } from 'shared/utils/fileviewer'
import {
  TitleCoverage,
  TitleFlags,
  TitleHitCount,
} from 'ui/FileViewer/ToggleHeader/Title/Title'

interface URLParams {
  provider: string
  owner: string
  repo: string
}

function ToggleHeader({ showHitCount = false }) {
  const { provider, owner, repo } = useParams<URLParams>()

  const { data: overview } = useRepoOverview({ provider, owner, repo })
  const { multipleTiers } = useFlags({
    multipleTiers: false,
  })

  const { data: tierData } = useTier({ provider, owner })
  const isTeamPlan =
    multipleTiers && tierData === TierNames.TEAM && overview?.private

  return (
    <div
      className={
        'flex w-full flex-1 flex-wrap items-start gap-2 border-b border-ds-gray-tertiary bg-white pb-2 sm:flex-row sm:items-center md:mb-1 lg:w-auto lg:flex-none'
      }
    >
      <div className="flex gap-2 pt-2">
        <TitleCoverage coverage={LINE_STATE.UNCOVERED} />
        <TitleCoverage coverage={LINE_STATE.PARTIAL} />
        <TitleCoverage coverage={LINE_STATE.COVERED} />
        <TitleHitCount showHitCount={showHitCount} />
      </div>
      <div className="ml-auto flex w-full flex-wrap items-center justify-between gap-2 md:mt-2 md:w-auto">
        {!isTeamPlan ? <TitleFlags /> : null}
        {!isTeamPlan ? <ComponentsMultiSelect /> : null}
      </div>
    </div>
  )
}

export default ToggleHeader
