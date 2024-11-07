import cs from 'classnames'
import capitalize from 'lodash/capitalize'
import { useParams } from 'react-router-dom'

import { Provider } from 'shared/api/helpers'
import { formatTimeToNow } from 'shared/utils/dates'
import { getProviderPullURL } from 'shared/utils/provider'
import A from 'ui/A'
import CIStatusLabel from 'ui/CIStatus'
import Icon from 'ui/Icon'

import { usePullHeadData } from './hooks'

import { pullStateToColor } from '../constants'

interface URLParams {
  provider: Provider
  owner: string
  repo: string
  pullId: string
}

function HeaderDefault() {
  const { provider, owner, repo, pullId } = useParams<URLParams>()
  const { data } = usePullHeadData({ provider, owner, repo, pullId })

  const pull = data?.pull

  return (
    <div className="flex flex-col justify-between gap-2 border-b border-ds-gray-secondary pb-2 text-xs md:flex-row">
      <div>
        <h1 className="flex items-center gap-2 text-xl font-semibold">
          {pull?.title}
          {pull?.state ? (
            <span
              className={cs(
                'text-white font-bold px-3 py-0.5 text-xs rounded',
                pullStateToColor[pull?.state]
              )}
            >
              {capitalize(pull?.state)}
            </span>
          ) : null}
        </h1>
        <p className="flex items-center gap-2">
          <span>
            {pull?.updatestamp && formatTimeToNow(pull?.updatestamp)}{' '}
            <span className="bold">{pull?.author?.username}</span> authored{' '}
            {pull?.pullId && (
              // @ts-expect-error - A needs to be updated to TS
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
          <CIStatusLabel ciPassed={pull?.head?.ciPassed} />
          <span className="flex items-center">
            <Icon name="branch" variant="developer" size="sm" />
            {pull?.head?.branchName}
          </span>
        </p>
      </div>
    </div>
  )
}
export default HeaderDefault
