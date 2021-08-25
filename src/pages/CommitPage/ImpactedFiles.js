import CommitsTable from './CommitsTable'
import CommitFileView from './CommitFileView'
import PropTypes from 'prop-types'

function ImpactedFiles({ showTable, impactedFiles, commit }) {
  // const filesPatchChanges = impactedFiles.map(d => ({d.path}))

  return showTable ? (
    <>
      <span className="text-base mb-4 font-semibold">Impacted files</span>
      <CommitsTable commit={commit} data={impactedFiles} />
    </>
  ) : (
    <CommitFileView />
  )
}

ImpactedFiles.propTypes = {
  showTable: PropTypes.string,
  impactedFiles: PropTypes.string,
  commit: PropTypes.string,
}

export default ImpactedFiles
