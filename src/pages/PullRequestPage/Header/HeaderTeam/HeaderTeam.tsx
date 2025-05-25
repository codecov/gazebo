import { useSuspenseQuery as useSuspenseQueryV5 } from '@tanstack/react-queryV5'
import capitalize from 'lodash/capitalize'
import { useParams } from 'react-router-dom'

import { Provider } from 'shared/api/helpers'
import { cn } from 'shared/utils/cn'
import { formatTimeToNow } from 'shared/utils/dates'
import { getProviderPullURL } from 'shared/utils/provider'
import A from 'ui/A'
import CIStatusLabel from 'ui/CIStatus'
import Icon from 'ui/Icon'
import TotalsNumber from 'ui/TotalsNumber'

import { PullHeadDataTeamQueryOpts } from './queries/PullHeadDataTeamQueryOpts'

import { pullStateToColor } from '../constants'

interface URLParams {
  provider: Provider
  owner: string
  repo: string
  pullId: string
}

function HeaderTeam() {
  const { provider, owner, repo, pullId } = useParams<URLParams>()
  const { data } = useSuspenseQueryV5(
    PullHeadDataTeamQueryOpts({ provider, owner, repo, pullId })
  )

  const pull = data?.pull
  let percentCovered = null
  if (pull?.compareWithBase?.__typename === 'Comparison') {
    percentCovered = pull?.compareWithBase?.patchTotals?.percentCovered
  }

  return (
    <div className="flex flex-col justify-between gap-2 border-b border-ds-gray-secondary pb-2 text-xs md:flex-row">
      <div className="flex flex-row flex-wrap items-center gap-6 divide-x divide-ds-gray-secondary">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-semibold">
            {pull?.title}
            {pull?.state ? (
              <span
                className={cn(
                  'rounded px-3 py-0.5 text-xs font-bold text-white',
                  pullStateToColor[pull?.state]
                )}
              >
                {capitalize(pull?.state)}
              </span>
            ) : null}
          </h1>
          <p className="flex flex-row items-center gap-2">
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
        <div className="flex flex-col justify-center gap-2 px-6">
          <h4 className="gap-2 font-mono text-xs text-ds-gray-quinary">
            Patch Coverage
          </h4>
          <TotalsNumber value={percentCovered} plain large />
        </div>
      </div>
    </div>
  )
}
export default HeaderTeam
