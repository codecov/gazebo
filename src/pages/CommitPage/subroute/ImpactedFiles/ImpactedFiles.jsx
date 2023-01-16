import PropTypes from 'prop-types'
import { lazy, Suspense } from 'react'

import ToggleHeader from 'ui/FileViewer/ToggleHeader'
import Spinner from 'ui/Spinner'

const CommitsTable = lazy(() => import('./CommitsTable'))

const Loader = () => (
  <div className="flex-1 flex justify-center m-4">
    <Spinner size={60} />
  </div>
)

function ImpactedFiles({ commit, commitSHA }) {
  return (
    <>
      <ToggleHeader title="" coverageIsLoading={false} />
      <Suspense fallback={<Loader />}>
        <CommitsTable
          commit={commitSHA}
          state={commit?.state}
          data={commit?.compareWithParent?.impactedFiles}
        />
      </Suspense>
    </>
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
