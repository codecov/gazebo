import CommitsTable from './CommitsTable'
import CommitFileView from './CommitFileView'
import PropTypes from 'prop-types'
import { useImpactedFiles } from 'services/commit'
import { useParams } from 'react-router-dom'

function ImpactedFiles() {
  const { provider, owner, repo, commit, path } = useParams()

  const { impactedFiles, loading } = useImpactedFiles({
    provider: provider,
    owner,
    repo,
    commitid: commit,
  })

  return !path ? (
    <>
      <span className="text-base mb-4 font-semibold">Impacted files</span>
      <CommitsTable commit={commit} loading={loading} data={impactedFiles} />
    </>
  ) : (
    <CommitFileView diff={impactedFiles?.find((file) => file.path === path)} />
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
