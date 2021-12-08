import { Suspense } from 'react'
import PropTypes from 'prop-types'
import { useParams } from 'react-router-dom'

import Spinner from 'ui/Spinner'

import CommitsTable from './CommitsTable'
import CommitFileView from './CommitFileView'

const LoadingState = () => (
  <div className="flex-1 flex justify-center">
    <Spinner size={60} />
  </div>
)
// TODO: This !path logic can be simplified by using the router.
function ImpactedFiles({ data }) {
  const { commit, path } = useParams()

  return !path ? (
    <>
      <h2 className="text-base font-semibold">Impacted files</h2>
      <CommitsTable
        commit={commit}
        loading={data?.state}
        data={data?.impactedFiles}
      />
    </>
  ) : (
    <Suspense fallback={LoadingState}>
      <CommitFileView
        diff={data?.impactedFiles?.find((file) => file.headName === path)}
      />
    </Suspense>
  )
}

ImpactedFiles.propTypes = {
  path: PropTypes.string,
  data: PropTypes.shape({
    state: PropTypes.string,
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
  }),
  commit: PropTypes.string,
}

export default ImpactedFiles
