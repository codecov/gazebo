import PropTypes from 'prop-types'

import { LINE_STATE } from 'shared/utils/fileviewer'

import Title, { TitleCoverage, TitleFlags, TitleHitCount } from './Title/Title'

function ToggleHeader({
  title,
  flagNames,
  onFlagsChange,
  coverageIsLoading,
  sticky = false,
  showHitCount = false,
}) {
  /**
   * Header component that toggles covered, partial and uncovered lines for the File Viewer page.
   * This component can also filter coverage by flag name
   * @param {Object} flagData flag names and their respective state and setter
   * @param {Bool} coverageIsLoading loading boolean to conditioanlly render the flags component
   */

  return (
    <Title title={title} sticky={sticky}>
      <TitleCoverage coverage={LINE_STATE.UNCOVERED} />
      <TitleCoverage coverage={LINE_STATE.PARTIAL} />
      <TitleCoverage coverage={LINE_STATE.COVERED} />
      {flagNames && flagNames?.length > 1 && (
        <TitleFlags
          flags={flagNames}
          onFlagsChange={onFlagsChange}
          flagsIsLoading={coverageIsLoading}
        />
      )}
      <TitleHitCount showHitCount={showHitCount} />
    </Title>
  )
}

ToggleHeader.propTypes = {
  flagNames: PropTypes.arrayOf(PropTypes.string),
  coverageIsLoading: PropTypes.bool.isRequired,
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
  onFlagsChange: PropTypes.func,
  sticky: PropTypes.bool,
  showHitCount: PropTypes.bool,
}

export default ToggleHeader
