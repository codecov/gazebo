import isNil from 'lodash/isNil'
import { useParams } from 'react-router-dom'

import { usePull } from 'services/pull'
import ToggleHeader from 'ui/FileViewer/ToggleHeader'

import FileDiff from './FileDiff'

export function useCompareDiff() {
  const { provider, owner, repo, pullId } = useParams()
  const { data: pull, ...rest } = usePull({ provider, owner, repo, pullId })
  const data = {
    baseTotals: pull?.compareWithBase?.baseTotals,
    files: pull?.compareWithBase?.fileComparisons,
    headTotals: pull?.compareWithBase?.headTotals,
    patchTotals: pull?.compareWithBase?.patchTotals,
  }
  return { data, ...rest }
}
const hasReport = ({ headTotals, patchTotals, baseTotals }) =>
  !isNil(headTotals) && !isNil(patchTotals) && !isNil(baseTotals)
const hasNoImpactedFiles = (files) => !files || files?.length === 0

const Root = () => {
  const { data: diff, isLoading } = useCompareDiff()

  return (
    !isLoading && (
      <div className="flex flex-col gap-4">
        <div className="border-b border-ds-gray-secondary pb-4">
          <ToggleHeader
            flagData={null}
            title="Impacted Files"
            coverageIsLoading={isLoading}
          />
        </div>
        {diff?.files?.map((file, i) => (
          <FileDiff key={`impacted-file-${i}`} {...file} />
        ))}
        {hasNoImpactedFiles(diff?.files) &&
          hasReport({
            headTotals: diff?.headTotals,
            patchTotals: diff?.patchTotals,
            baseTotals: diff?.baseTotals,
          }) && (
            <>
              <p className="m-2">
                Everything is accounted for! No changes detected that need to be
                reviewed.
              </p>
              <p className="mx-2 font-medium">
                What changes does Codecov check for?
              </p>
              <ul className="list-disc mx-2 ml-6">
                <li>
                  Lines, not adjusted in diff, that have changed coverage data.
                </li>
                <li>
                  Files that introduced coverage data that had none before.
                </li>
                <li>
                  Files that have missing coverage data that once were tracked.
                </li>
              </ul>
            </>
          )}
      </div>
    )
  )
}

export default Root
