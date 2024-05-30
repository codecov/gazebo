import PropTypes from 'prop-types'

import ComponentsMultiSelect from 'pages/RepoPage/CoverageTab/OverviewTab/subroute/ComponentsMultiSelect'
import { LINE_STATE } from 'shared/utils/fileviewer'

import Title, { TitleCoverage, TitleFlags, TitleHitCount } from './Title/Title'
function ToggleHeader({
  title,
  sticky = false,
  showHitCount = false,
  showFlagsSelect = false,
  showComponentsSelect = false,
}) {
  return (
    <div>
      <Title title={title} sticky={sticky}>
        <TitleCoverage coverage={LINE_STATE.UNCOVERED} />
        <TitleCoverage coverage={LINE_STATE.PARTIAL} />
        <TitleCoverage coverage={LINE_STATE.COVERED} />
        <TitleHitCount showHitCount={showHitCount} />
        {showFlagsSelect ? <TitleFlags /> : null}
        {showComponentsSelect ? <ComponentsMultiSelect /> : null}
      </Title>
    </div>
  )
}

ToggleHeader.propTypes = {
  flagNames: PropTypes.arrayOf(PropTypes.string),
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
  sticky: PropTypes.bool,
  showHitCount: PropTypes.bool,
  showFlagsSelect: PropTypes.bool,
  showComponentsSelect: PropTypes.bool,
}

export default ToggleHeader
