import cs from 'classnames'
import capitalize from 'lodash/capitalize'
import { useParams } from 'react-router-dom'

import { formatTimeToNow } from 'shared/utils/dates'
import { getProviderPullURL } from 'shared/utils/provider'
import A from 'ui/A'
import CIStatusLabel from 'ui/CIStatus'
import Icon from 'ui/Icon'

import { usePullHeadData } from './hooks'
import PendoLink from './PendoLink'

const pullStateToColor = {
  OPEN: 'bg-ds-primary-green',
  CLOSED: 'bg-ds-primary-red',
  MERGED: 'bg-ds-primary-purple',
}

function Header() {
  const { provider, owner, repo, pullId } = useParams()
  const { data } = usePullHeadData({ provider, owner, repo, pullId })

  return (
    <div className="flex justify-between border-b border-ds-gray-secondary pb-2 text-xs">
      <div>
        <h1 className="flex items-center gap-2 text-lg font-semibold">
          {data?.title}
          <span
            className={cs(
              'text-white font-bold px-3 py-0.5 text-xs rounded',
              pullStateToColor[data?.state]
            )}
          >
            {capitalize(data?.state)}
          </span>
        </h1>
        <p className="flex items-center gap-2">
          <span>
            {data?.updatestamp && formatTimeToNow(data?.updatestamp)}{' '}
            <span className="bold">{data?.author?.username}</span> authored{' '}
            {data?.pullId && (
              <A
                href={getProviderPullURL({
                  provider,
                  owner,
                  repo,
                  pullId: data?.pullId,
                })}
                hook="provider-pr-link"
                isExternal={true}
              >
                #{data?.pullId}
              </A>
            )}
          </span>
          <CIStatusLabel ciPassed={data?.head?.ciPassed} />
          <span className="flex items-center">
            <Icon name="branch" variant="developer" size="sm" />
            {data?.head?.branchName}
          </span>
        </p>
      </div>
      <PendoLink />
    </div>
  )
}

export default Header
