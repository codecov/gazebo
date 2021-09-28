import { Suspense } from 'react'
import PropTypes from 'prop-types'
import { useParams } from 'react-router-dom'

import Spinner from 'ui/Spinner'

import CommitsTable from './CommitsTable'
import CommitFileView from './CommitFileView'

function ImpactedFiles({ data }) {
  const { commit, path } = useParams()
  const loadingStateFile = (
    <div className="w-full flex h-44 mt-8 justify-center">
      <Spinner size={60} />
    </div>
  )

  return !path ? (
    <>
      <span className="text-base mb-4 font-semibold">Impacted files</span>
      <CommitsTable
        commit={commit}
        loading={data?.state}
        data={data?.impactedFiles}
      />
    </>
  ) : (
    <Suspense fallback={loadingStateFile}>
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
