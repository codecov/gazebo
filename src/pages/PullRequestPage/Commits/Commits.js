import { usePullCommits } from './hooks'

import Card from '../Card'

function Commits() {
  const { data: commits } = usePullCommits()
  return (
    <Card title="Commits">
      {commits.map(({ message, commitid, author }) => (
        <div
          key={commitid}
          className="py-4 first:pt-0 last:pb-0 text-ds-gray-octonary text-sm"
        >
          <p className="font-semibold truncate">{message}</p>
          <p>
            <span className="text-ds-gray-quaternary">by</span> {author}
          </p>
        </div>
      ))}
      {(commits?.length === 0 || !commits) && (
        <p className="text-ds-gray-quaternary">no commits</p>
      )}
    </Card>
  )
}

export default Commits
