import isNil from 'lodash/isNil'
import { Suspense } from 'react'

import ToggleHeader from 'ui/FileViewer/ToggleHeader'
import Spinner from 'ui/Spinner'

import ImpactedFiles from './ImpactedFiles'
import useImpactedFilesTable from './ImpactedFiles/hooks'

function hasImpactedFiles(impactedFiles) {
  return impactedFiles && impactedFiles?.length > 0
}

function hasReportWithoutChanges({
  pullHeadCoverage,
  pullBaseCoverage,
  pullPatchCoverage,
}) {
  return (
    !isNil(pullHeadCoverage) &&
    !isNil(pullBaseCoverage) &&
    !isNil(pullPatchCoverage)
  )
}

const Root = () => {
  const { data, isLoading } = useImpactedFilesTable()

  const Loader = (
    <div className="flex items-center justify-center py-16">
      <Spinner />
    </div>
  )

  return (
    !isLoading && (
      <div className="flex flex-col gap-4">
        <ToggleHeader title="Impacted Files" coverageIsLoading={false} />
        {hasImpactedFiles(data?.impactedFiles) ? (
          <Suspense fallback={Loader}>
            <ImpactedFiles />
          </Suspense>
        ) : // Coverage changes remain the same as before, but no impacted files = no change
        hasReportWithoutChanges({
            pullHeadCoverage: data?.pullHeadCoverage,
            pullBaseCoverage: data?.pullBaseCoverage,
            pullPatchCoverage: data?.pullPatchCoverage,
          }) ? (
          <>
            <p>
              Everything is accounted for! No changes detected that need to be
              reviewed.
            </p>
            <p className="font-medium">What changes does Codecov check for?</p>
            <ul className="list-disc ml-6">
              <li>
                Lines, not adjusted in diff, that have changed coverage data.
              </li>
              <li>Files that introduced coverage data that had none before.</li>
              <li>
                Files that have missing coverage data that once were tracked.
              </li>
            </ul>
          </>
        ) : (
          // No impacted files nor head, patch or change coverage
          <p>No Files covered by tests were changed</p>
        )}
      </div>
    )
  )
}

export default Root
