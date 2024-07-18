import ComponentsMultiSelect from 'pages/RepoPage/CoverageTab/OverviewTab/subroute/ComponentsMultiSelect'
import { LINE_STATE } from 'shared/utils/fileviewer'

import Title, { TitleCoverage, TitleFlags, TitleHitCount } from './Title/Title'

interface ToggleHeaderProps {
  title?: React.ReactNode
  sticky?: boolean
  showHitCount?: boolean
  showFlagsSelect?: boolean
  showComponentsSelect?: boolean
}

function ToggleHeader({
  title,
  sticky = false,
  showHitCount = false,
  showFlagsSelect = false,
  showComponentsSelect = false,
}: ToggleHeaderProps) {
  return (
    <div>
      <Title title={title} sticky={sticky}>
        <TitleHitCount showHitCount={showHitCount} />
        <TitleCoverage coverage={LINE_STATE.UNCOVERED} />
        <TitleCoverage coverage={LINE_STATE.PARTIAL} />
        <TitleCoverage coverage={LINE_STATE.COVERED} />
        {showFlagsSelect ? <TitleFlags /> : null}
        {showComponentsSelect ? <ComponentsMultiSelect /> : null}
      </Title>
    </div>
  )
}

export default ToggleHeader
