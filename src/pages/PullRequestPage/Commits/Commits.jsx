import { CommitStateEnum } from 'shared/utils/commit'
import A from 'ui/A'
import Icon from 'ui/Icon'

import { useCompareCommits } from './useCompareCommits'

import Card from '../Card'

function Commits() {
  const { data: commits } = useCompareCommits()
  return (
    <Card title="Commits">
      {commits?.map(({ message, commitid, author, state }) => (
        <div
          key={commitid}
          className="py-4 first:pt-0 last:pb-0 text-ds-gray-octonary text-sm flex flex-col"
        >
          <A
            to={{ pageName: 'commit', options: { commit: commitid } }}
            variant="cardLink"
          >
            {message ? message : 'Commit Title Unknown'}
          </A>
          {author ? (
            <p>
              <span className="text-ds-gray-quaternary">by</span> {author}
            </p>
          ) : (
            <span className="text-ds-gray-quaternary">Author Unknown</span>
          )}
          {state === CommitStateEnum.ERROR && (
            <span className="text-ds-primary-red flex items-end pt-1">
              <Icon name="exclamation" size="flex" variant="solid" /> processing
              failed
            </span>
          )}
        </div>
      ))}
      {commits?.length === 0 && (
        <p className="text-ds-gray-quaternary">no commits</p>
      )}
    </Card>
  )
}

export default Commits
