import { useMemo } from 'react'

import { cn } from 'shared/utils/cn'

interface CommitInfoProps {
  commitSha: string
  author: string
  message: string
  timestamp: number
  branch: string
  ciPassed?: boolean
}

export function CommitInfo({
  commitSha,
  author,
  message,
  timestamp,
  branch,
  ciPassed,
}: CommitInfoProps) {
  const shortSha = useMemo(() => commitSha.slice(0, 7), [commitSha])

  const authorDisplay = useMemo(
    () => `${author} on ${branch}`,
    [author, branch]
  )

  const formattedDate = useMemo(() => {
    return new Date(timestamp).toLocaleDateString()
  }, [timestamp])

  const statusText = useMemo(() => {
    return ciPassed ? 'Passed' : 'Failed'
  }, [ciPassed])

  const statusClassName = useMemo(
    () =>
      cn(
        'rounded px-2 py-1 text-xs font-semibold',
        ciPassed
          ? 'bg-ds-primary-green text-white'
          : 'bg-ds-primary-red text-white'
      ),
    [ciPassed]
  )

  const truncatedMessage = useMemo(() => {
    return message.length > 50 ? message.slice(0, 50) + '...' : message
  }, [message])

  return (
    <div className="rounded-lg border border-ds-gray-tertiary bg-white p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <code className="rounded bg-ds-gray-primary px-2 py-1 font-mono text-sm">
            {shortSha}
          </code>
          {ciPassed !== undefined && (
            <span className={statusClassName}>{statusText}</span>
          )}
        </div>
        <span className="text-xs text-ds-gray-senary">{formattedDate}</span>
      </div>

      <div className="mt-3">
        <p className="text-sm font-medium">{truncatedMessage}</p>
        <p className="mt-1 text-xs text-ds-gray-senary">{authorDisplay}</p>
      </div>
    </div>
  )
}

export default CommitInfo
