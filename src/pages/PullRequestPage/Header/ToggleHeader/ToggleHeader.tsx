import { useParams } from 'react-router-dom'

import ComponentsMultiSelect from 'pages/PullRequestPage/PullCoverage/routes/ComponentsSelector'
import { useRepoOverview } from 'services/repo'
import { TierNames, useTier } from 'services/tier'
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

function ToggleHeader({ showHitCount = false, noBottomBorder = false }) {
  const { provider, owner, repo } = useParams<URLParams>()
  const noBottomBorderStyle = noBottomBorder
    ? 'border-b-0 pb-1'
    : 'border-b pb-2'

  const { data: overview } = useRepoOverview({ provider, owner, repo })

  const { data: tierData } = useTier({ provider, owner })
  const isTeamPlan = tierData === TierNames.TEAM && overview?.private

  return (
    <div
      className={`flex w-full flex-1 flex-wrap items-start gap-2 bg-ds-container sm:flex-row sm:items-center md:mb-1 lg:w-auto lg:flex-none ${noBottomBorderStyle} border-ds-gray-tertiary`}
    >
      <div className="flex gap-2 pt-2">
        <TitleHitCount showHitCount={showHitCount} />
        <TitleCoverage coverage={LINE_STATE.UNCOVERED} />
        <TitleCoverage coverage={LINE_STATE.PARTIAL} />
        <TitleCoverage coverage={LINE_STATE.COVERED} />
      </div>
      <div className="ml-auto flex w-full flex-wrap items-center justify-between gap-2 md:mt-2 md:w-auto">
        {!isTeamPlan ? <TitleFlags /> : null}
        {!isTeamPlan ? <ComponentsMultiSelect /> : null}
      </div>
    </div>
  )
}

export default ToggleHeader
