import isNil from 'lodash/isNil'

import { CommitStateEnum } from 'shared/utils/commit'
import { ComparisonReturnType } from 'shared/utils/comparison'
import A from 'ui/A'
import Spinner from 'ui/Spinner'

import { useImpactedFilesTable } from './hooks'
import Table from './Table'

const Loader = () => (
  <div className="flex items-center justify-center py-16">
    <Spinner />
  </div>
)

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

function FilesChangedTab() {
  const { data, isLoading } = useImpactedFilesTable()
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
      <div className="flex flex-col gap-2">
        <p>
          Cannot display changed files because most recent commit is in an error
          state.
        </p>
      </div>
    )
  }

  if (
    data?.impactedFilesType === 'ImpactedFiles' &&
    data?.impactedFiles.length > 0
  ) {
    return (
      <div className="flex flex-col gap-2">
        <Table />
      </div>
    )
  }

  if (data?.impactedFilesType === 'UnknownFlags') {
    return (
      <div className="flex flex-col gap-2">
        <p className="mt-4">
          {data?.impactedFiles?.message}. One possible solution is to look into{' '}
          <A href="https://docs.codecov.com/docs/carryforward-flags">
            Carryforward Flags
          </A>
          .
        </p>
      </div>
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
      <div className="flex flex-col gap-2">
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
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="mt-4">No Files covered by tests were changed</p>
    </div>
  )
}

export default FilesChangedTab
