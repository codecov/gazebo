import { useParams } from 'react-router-dom'

import { usePull } from 'services/pull'

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

const Root = () => {
  const { data: diff, isLoading } = useCompareDiff()

  return (
    !isLoading && (
      <>
        {/* Todo get the covered/miss/partial selector/title in here, might move the service to the FileDiff component, thoughts? */}
        {diff?.files?.map((diff, i) => {
          return <FileDiff key={`impacted-file-${i}`} {...diff} />
        })}
      </>
    )
  )
}

export default Root
