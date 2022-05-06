import PropTypes from 'prop-types'

import { LINE_STATE } from './Title/lineStates'
import Title, { TitleCoverage, TitleFlags } from './Title/Title'

function ToggleHeader({
  title,
  flagData,
  coverageIsLoading,
  lineCoverageStatesAndSetters,
}) {
  /**
   * Header component that toggles covered, partial and uncovered lines for the File Viewer page.
   * This component can also filter coverage by flag name
   * @param {Object} lineCoverageStatesAndSetters state variables and setters to control displayed line coverage
   * @param {Object} flagData flag names and their respective state and setter
   * @param {Bool} coverageIsLoading loading boolean to conditioanlly render the flags component
   */
  const { covered, setCovered, uncovered, setUncovered, partial, setPartial } =
    lineCoverageStatesAndSetters
  const { flagNames, selectedFlags, setSelectedFlags } = flagData

  return (
    <Title
      title={title}
      Flags={() => (
        <TitleFlags
          list={flagNames}
          current={selectedFlags}
          onChange={setSelectedFlags}
          flagsIsLoading={coverageIsLoading}
        />
      )}
    >
      <TitleCoverage
        onChange={() => setCovered((covered) => !covered)}
        checked={covered}
        coverage={LINE_STATE.COVERED}
      />
      <TitleCoverage
        onChange={() => setPartial((partial) => !partial)}
        checked={partial}
        coverage={LINE_STATE.PARTIAL}
      />
      <TitleCoverage
        onChange={() => setUncovered((uncovered) => !uncovered)}
        checked={uncovered}
        coverage={LINE_STATE.UNCOVERED}
      />
    </Title>
  )
}

ToggleHeader.propTypes = {
  flagData: PropTypes.object,
  coverageIsLoading: PropTypes.bool.isRequired,
  lineCoverageStatesAndSetters: PropTypes.object,
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
}

export default ToggleHeader
