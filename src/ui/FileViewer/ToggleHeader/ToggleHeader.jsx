import PropTypes from 'prop-types'

import { LINE_STATE } from 'shared/utils/fileviewer'

import Title, { TitleCoverage, TitleFlags, TitleHitCount } from './Title/Title'

function ToggleHeader({
  title,
  sticky = false,
  showHitCount = false,
  showFlagsSelect = false,
}) {
  return (
    <Title title={title} sticky={sticky}>
      <TitleCoverage coverage={LINE_STATE.UNCOVERED} />
      <TitleCoverage coverage={LINE_STATE.PARTIAL} />
      <TitleCoverage coverage={LINE_STATE.COVERED} />
      <TitleHitCount showHitCount={showHitCount} />
      {showFlagsSelect && <TitleFlags />}
    </Title>
  )
}

ToggleHeader.propTypes = {
  flagNames: PropTypes.arrayOf(PropTypes.string),
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
  sticky: PropTypes.bool,
  showHitCount: PropTypes.bool,
  showFlagsSelect: PropTypes.bool,
}

export default ToggleHeader
