import PropTypes from 'prop-types'

import ComponentsMultiSelect from 'pages/RepoPage/CoverageTab/subroute/ComponentsMultiSelect'
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
    <Title title={title} sticky={sticky}>
      <div className="flex flex-col items-start space-x-0 lg:flex-row lg:items-center lg:space-x-2">
        <div className="flex flex-row items-center space-x-2">
          <TitleCoverage coverage={LINE_STATE.UNCOVERED} />
          <TitleCoverage coverage={LINE_STATE.PARTIAL} />
          <TitleCoverage coverage={LINE_STATE.COVERED} />
          <TitleHitCount showHitCount={showHitCount} />
        </div>
        <div className="mt-2 flex flex-col items-center space-y-2 lg:mt-0 lg:flex-row lg:space-x-2 lg:space-y-0">
          {showFlagsSelect ? <TitleFlags /> : null}
          {showComponentsSelect ? <ComponentsMultiSelect /> : null}
        </div>
      </div>
    </Title>
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
