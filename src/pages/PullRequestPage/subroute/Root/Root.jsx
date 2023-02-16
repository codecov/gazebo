import isNil from 'lodash/isNil'

import { CommitStateEnum } from 'shared/utils/commit'
import Spinner from 'ui/Spinner'

import ImpactedFiles from './FilesChanged'
import { useImpactedFilesTable } from './FilesChanged/hooks'

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

const Loader = () => (
  <div className="flex items-center justify-center py-16">
    <Spinner />
  </div>
)

const Root = () => {
  const { data, isLoading } = useImpactedFilesTable()

  if (isLoading) {
    return <Loader />
  }

  return (
    <div className="flex flex-col gap-2">
      {data?.headState === CommitStateEnum.ERROR ? (
        <p>
          Cannot display changed files because most recent commit is in an error
          state.
        </p>
      ) : hasImpactedFiles(data?.impactedFiles) ? (
        <ImpactedFiles />
      ) : // Coverage changes remain the same as before, but no changed files = no change
      hasReportWithoutChanges({
          pullHeadCoverage: data?.pullHeadCoverage,
          pullBaseCoverage: data?.pullBaseCoverage,
          pullPatchCoverage: data?.pullPatchCoverage,
        }) ? (
        <div className="mt-4 flex flex-col gap-3">
          <p>
            Everything is accounted for! No changes detected that need to be
            reviewed.
          </p>
          <p className="font-medium">What changes does Codecov check for?</p>
          <ul className="ml-6 list-disc">
            <li>
              Lines, not adjusted in diff, that have changed coverage data.
            </li>
            <li>Files that introduced coverage data that had none before.</li>
            <li>
              Files that have missing coverage data that once were tracked.
            </li>
          </ul>
        </div>
      ) : (
        // No changed files nor head, patch or change coverage
        <p className="mt-4">No Files covered by tests were changed</p>
      )}
    </div>
  )
}

export default Root
