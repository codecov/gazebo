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
    <div className="flex flex-col justify-between gap-2 border-b border-ds-gray-secondary pb-2 text-xs md:flex-row">
      <div>
        <h1 className="flex items-center gap-2 text-lg font-semibold">
          {data?.pull?.title}
          <span
            className={cs(
              'text-white font-bold px-3 py-0.5 text-xs rounded',
              pullStateToColor[data?.pull?.state]
            )}
          >
            {capitalize(data?.pull?.state)}
          </span>
        </h1>
        <p className="flex items-center gap-2">
          <span>
            {data?.pull?.updatestamp &&
              formatTimeToNow(data?.pull?.updatestamp)}{' '}
            <span className="bold">{data?.pull?.author?.username}</span>{' '}
            authored{' '}
            {data?.pull?.pullId && (
              <A
                href={getProviderPullURL({
                  provider,
                  owner,
                  repo,
                  pullId: data?.pull?.pullId,
                })}
                hook="provider-pr-link"
                isExternal={true}
              >
                #{data?.pull?.pullId}
              </A>
            )}
          </span>
          <CIStatusLabel ciPassed={data?.pull?.head?.ciPassed} />
          <span className="flex items-center">
            <Icon name="branch" variant="developer" size="sm" />
            {data?.pull?.head?.branchName}
          </span>
        </p>
      </div>
      <PendoLink />
    </div>
  )
}

export default Header
