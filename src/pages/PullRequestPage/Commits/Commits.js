import A from 'ui/A'

import { useCompareCommits } from './hooks'

import Card from '../Card'

function Commits() {
  const { data: commits } = useCompareCommits()
  return (
    <Card title="Commits">
      {commits.map(({ message, commitid, author }) => (
        <div
          key={commitid}
          className="py-4 first:pt-0 last:pb-0 text-ds-gray-octonary text-sm"
        >
          <A
            to={{ pageName: 'commit', options: { commit: commitid } }}
            variant="cardLink"
          >
            {message}
          </A>
          <p>
            <span className="text-ds-gray-quaternary">by</span> {author}
          </p>
        </div>
      ))}
      {commits?.length === 0 && (
        <p className="text-ds-gray-quaternary">no commits</p>
      )}
    </Card>
  )
}

export default Commits
