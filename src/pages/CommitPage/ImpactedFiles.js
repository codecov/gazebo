import CommitsTable from './CommitsTable'
import CommitFileView from './CommitFileView'
import PropTypes from 'prop-types'

function ImpactedFiles({ path, impactedFiles, commit }) {
  return !path ? (
    <>
      <span className="text-base mb-4 font-semibold">Impacted files</span>
      <CommitsTable commit={commit} data={impactedFiles} />
    </>
  ) : (
    <CommitFileView diff={impactedFiles.find((file) => file.path === path)} />
  )
}

ImpactedFiles.propTypes = {
  path: PropTypes.string,
  impactedFiles: PropTypes.arrayOf(
    PropTypes.shape({
      path: PropTypes.string,
      baseTotals: PropTypes.shape({
        coverage: PropTypes.number,
      }),
      compareTotals: PropTypes.shape({
        coverage: PropTypes.number,
      }),
    })
  ),
  commit: PropTypes.string,
}

export default ImpactedFiles
