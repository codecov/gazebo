import cs from 'classnames'
import capitalize from 'lodash/capitalize'
import { useParams } from 'react-router-dom'

import { usePullQuery } from 'generated'
import { formatTimeToNow } from 'shared/utils/dates'
import { getProviderPullURL } from 'shared/utils/provider'
import A from 'ui/A'

const pullStateToColor = {
  OPEN: 'bg-ds-primary-green',
  CLOSED: 'bg-ds-primary-red',
  MERGED: 'bg-ds-primary-purple',
}

function Header() {
  // TODO: When we update the cicd link and branch link to mobe this to a hook to match the rest of the page.
  const { provider, owner, repo, pullId } = useParams()
  const { data } = usePullQuery({
    provider,
    owner,
    repo,
    pullId: parseInt(pullId, 10),
  })

  const pull = data.owner?.repository?.pull

  return (
    <div className="border-b border-ds-gray-secondary pb-4">
      <h1 className="flex items-center gap-2 text-lg font-semibold">
        {pull?.title}
        <span
          className={cs(
            'text-white font-bold px-3 py-0.5 text-xs rounded',
            pullStateToColor[pull?.state]
          )}
        >
          {capitalize(pull?.state)}
        </span>
      </h1>
      <p className="flex items-center gap-2">
        <span>
          {pull?.updatestamp && formatTimeToNow(pull.updatestamp)}{' '}
          <A
            to={{
              pageName: 'owner',
              options: { owner: pull?.author?.username },
            }}
          >
            {pull?.author?.username}
          </A>{' '}
          authored{' '}
          {pull?.pullId && (
            <A
              href={getProviderPullURL({
                provider,
                owner,
                repo,
                pullId: pull?.pullId,
              })}
              hook="provider-pr-link"
              isExternal={true}
            >
              #{pull?.pullId}
            </A>
          )}
        </span>
      </p>
    </div>
  )
}

export default Header
