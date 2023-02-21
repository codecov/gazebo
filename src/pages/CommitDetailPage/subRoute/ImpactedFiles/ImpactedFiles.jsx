import PropTypes from 'prop-types'
import { lazy, Suspense } from 'react'

import Spinner from 'ui/Spinner'

const CommitsTable = lazy(() => import('./CommitsTable'))

const Loader = () => (
  <div className="m-4 flex flex-1 justify-center">
    <Spinner size={60} />
  </div>
)

function ImpactedFiles({ commit, commitSHA }) {
  return (
    <Suspense fallback={<Loader />}>
      <CommitsTable
        commit={commitSHA}
        state={commit?.state}
        data={commit?.compareWithParent?.impactedFiles}
      />
    </Suspense>
  )
}

ImpactedFiles.propTypes = {
  commit: PropTypes.shape({
    uploads: PropTypes.array,
    state: PropTypes.string,
    compareWithParent: PropTypes.shape({
      impactedFiles: PropTypes.array,
    }),
  }),
  commitSHA: PropTypes.string,
}

export default ImpactedFiles
