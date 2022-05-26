import cs from 'classnames'
import capitalize from 'lodash/capitalize'
import { useParams } from 'react-router-dom'

import { usePull } from 'services/pull/hooks'
import { formatTimeToNow } from 'shared/utils/dates'
import { getProviderPullURL } from 'shared/utils/provider'
import A from 'ui/A'
import CIStatusLabel from 'ui/CIStatus'
import Icon from 'ui/Icon'

const pullStateToColor = {
  OPEN: 'bg-ds-primary-green',
  CLOSED: 'bg-ds-primary-red',
  MERGED: 'bg-ds-primary-purple',
}

function Header() {
  // TODO: When we update the cicd link and branch link to mobe this to a hook to match the rest of the page.
  const { provider, owner, repo, pullId } = useParams()
  const { data: pull } = usePull({ provider, owner, repo, pullId })

  return (
    <div className="border-b border-ds-gray-secondary pb-4 text-xs">
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
          <span className="bold">{pull?.author?.username}</span> authored{' '}
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
        <CIStatusLabel ciPassed={pull?.head?.ciPassed} />
        <span className="flex items-center">
          <Icon name="branch" variant="developer" size="sm" />
          {pull?.head?.branchName}
        </span>
      </p>
    </div>
  )
}

export default Header
