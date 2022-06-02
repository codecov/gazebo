import { useState } from 'react'
import { useParams } from 'react-router-dom'

import { usePull } from 'services/pull'
import ToggleHeader from 'ui/FileViewer/ToggleHeader'

import FileDiff from './FileDiff'

function useCoverageAndFlagsStates() {
  const [covered, setCovered] = useState(true)
  const [uncovered, setUncovered] = useState(true)
  const [partial, setPartial] = useState(true)

  return {
    lineCoverageStatesAndSetters: {
      covered,
      setCovered,
      uncovered,
      setUncovered,
      partial,
      setPartial,
    },
  }
}

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

const Root = () => {
  const { data: diff, isLoading } = useCompareDiff()

  // *********** This is temporary code that will be here in the meantime *********** //
  const { lineCoverageStatesAndSetters } = useCoverageAndFlagsStates()
  // *********** This is temporary code that will be here in the meantime *********** //

  return (
    !isLoading && (
      <div className="flex flex-col gap-4">
        <div className="border-b border-ds-gray-secondary pb-4">
          <ToggleHeader
            flagData={null}
            title="Impacted Files"
            coverageIsLoading={isLoading}
            lineCoverageStatesAndSetters={lineCoverageStatesAndSetters}
          />
        </div>
        {diff?.files?.map((file, i) => (
          <FileDiff
            key={`impacted-file-${i}`}
            {...file}
            lineCoverageStatesAndSetters={lineCoverageStatesAndSetters}
          />
        ))}
        {(!diff?.files || diff?.files?.length === 0) && (
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
              <li>Files that introduced coverage data that had none before.</li>
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
