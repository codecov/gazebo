import { useParams } from 'react-router-dom'

import { usePull } from 'services/pull'

export function useCompareDiff() {
  const { provider, owner, repo, pullId } = useParams()
  const { data: pull, ...rest } = usePull({ provider, owner, repo, pullId })

  const data = {
    files: pull?.pullComparison?.files,
    baseTotals: pull?.pullComparison?.baseTotals,
    headTotals: pull?.pullComparison?.headTotals,
  }
  return { data, ...rest }
}

const Root = () => {
  const { data: diff, isLoading } = useCompareDiff()

  return (
    !isLoading && (
      <>
        {diff?.files?.map((diff, i) => {
          return <FileDiff key={i} {...diff} />
        })}
      </>
    )
  )
}

const FileDiff = ({ headName, segments, ...props }) => {
  console.log(segments)
  return (
    <div {...props}>
      <p>{headName}</p>
      {segments.map((segment, i) => (
        <>
          <p key={i}>{segment.header}</p>
          {segment.lines.map((line) => (
            <p key={line.content}>{line.content}</p>
          ))}
        </>
      ))}
    </div>
  )
}

export default Root
