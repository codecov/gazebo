import PropTypes from 'prop-types'
import { useParams } from 'react-router-dom'

import { LINE_STATE } from 'shared/FileViewer/lineStates'
import Title, { TitleCoverage, TitleFlags } from 'shared/FileViewer/Title'
import Breadcrumb from 'ui/Breadcrumb'

function FileviewerToggleHeader({
  lineCoverageStatesAndSetters,
  flagData,
  coverageIsLoading,
}) {
  /**
   * Header component that toggles covered, partial and uncovered lines for the File Viewer page.
   * This component can also filter coverage by flag name
   * @param {Object} lineCoverageStatesAndSetters state variables and setters to control displayed line coverage
   * @param {Object} flagData flag names and their respective state and setter
   * @param {Bool} coverageIsLoading loading boolean to conditioanlly render the flags component
   */
  const { commit, path } = useParams()
  const { covered, setCovered, uncovered, setUncovered, partial, setPartial } =
    lineCoverageStatesAndSetters
  const { flagNames, selectedFlags, setSelectedFlags } = flagData

  const title = (
    <Breadcrumb
      paths={[
        {
          pageName: 'commit',
          text: 'Impacted files',
          options: { commit: commit },
        },
        { pageName: 'path', text: path.split('/').pop() },
      ]}
    />
  )

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

FileviewerToggleHeader.propTypes = {
  lineCoverageStatesAndSetters: PropTypes.object,
  flagData: PropTypes.object,
  coverageIsLoading: PropTypes.bool.isRequired,
}

export default FileviewerToggleHeader
