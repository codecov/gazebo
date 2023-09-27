import isNil from 'lodash/isNil'

import { CommitStateEnum } from 'shared/utils/commit'
import { ComparisonReturnType } from 'shared/utils/comparison'
import Spinner from 'ui/Spinner'

import ImpactedFiles from './IndirectChangedFiles'
import { useIndirectChangedFilesTable } from './IndirectChangedFiles/hooks'
import IndirectChangesInfo from './IndirectChangesInfo'

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

function IndirectChangesTab() {
  const { data, isLoading } = useIndirectChangedFilesTable()
  const isFirstPull =
    data?.compareWithBaseType === ComparisonReturnType.FIRST_PULL_REQUEST

  if (isLoading) {
    return <Loader />
  }

  if (isFirstPull) {
    return (
      <p className="mt-4">
        No comparison made since it&apos;s your first commit with Codecov.
      </p>
    )
  }

  if (data?.headState === CommitStateEnum.ERROR) {
    return (
      <>
        <IndirectChangesInfo />
        <p>
          Cannot display Impacted Files because most recent commit is in an
          error state.
        </p>
      </>
    )
  }

  if (hasImpactedFiles(data?.impactedFiles)) {
    return (
      <>
        <IndirectChangesInfo />
        <ImpactedFiles />
      </>
    )
  }

  if (
    hasReportWithoutChanges({
      pullHeadCoverage: data?.pullHeadCoverage,
      pullBaseCoverage: data?.pullBaseCoverage,
      pullPatchCoverage: data?.pullPatchCoverage,
    })
  ) {
    return (
      <>
        <IndirectChangesInfo />
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
      </>
    )
  }

  return (
    <>
      <IndirectChangesInfo />
      <p className="mt-4">No Files covered by tests were changed</p>
    </>
  )
}

export default IndirectChangesTab
