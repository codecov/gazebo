import cs from 'classnames'
import formatDistanceToNow from 'date-fns/formatDistanceToNow'
import capitalize from 'lodash/capitalize'
import { useParams } from 'react-router-dom'

import { usePull } from 'services/pull/hooks'
import { getProviderPullURL } from 'shared/utils/provider'
import A from 'ui/A'
import CopyClipboard from 'ui/CopyClipboard'

const pullStateToColor = {
  OPEN: 'bg-ds-primary-green',
  CLOSED: 'bg-ds-primary-red',
  MERGED: 'bg-ds-primary-purple',
}

function Header() {
  const { provider, owner, repo, pullId } = useParams()
  const { data: pull } = usePull({ provider, owner, repo, pullId })

  return (
    <div className="border-t border-b border-ds-gray-secondary py-4">
      <h1 className="flex items-center text-lg font-semibold leading-10">
        {pull?.title} #{pull?.pullId}{' '}
        {pull?.pullId && (
          <CopyClipboard
            string={getProviderPullURL({
              provider,
              owner,
              repo,
              pullId: pull?.pullId,
            })}
          />
        )}
      </h1>
      <p className="flex items-center gap-2">
        <span
          className={cs(
            'text-white font-bold px-3 py-0.5 text-xs rounded',
            pullStateToColor[pull?.state]
          )}
        >
          {capitalize(pull?.state)}
        </span>
        <span>
          Authored by{' '}
          <A
            to={{
              pageName: 'owner',
              options: { owner: pull?.author?.username },
            }}
          >
            {pull?.author?.username}
          </A>{' '}
          &bull;{' '}
          {pull?.updatestamp &&
            formatDistanceToNow(new Date(pull?.updatestamp), {
              addSuffix: true,
            })}
        </span>
      </p>
    </div>
  )
}

export default Header
