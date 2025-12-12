import pluralize from 'pluralize'
import { useLayoutEffect } from 'react'
import { useParams } from 'react-router-dom'

import Card from 'old_ui/Card'
import { useAccountDetails } from 'services/account/useAccountDetails'
import { usePlanData } from 'services/account/usePlanData'
import Icon from 'ui/Icon'

import CancelButton from './CancelButton'

import { useSetCrumbs } from '../../../../context'

function DowngradePlan() {
  const { provider, owner } = useParams()
  const { data: accountDetails } = useAccountDetails({ provider, owner })
  const { data: planData } = usePlanData({ provider, owner })
  const setCrumbs = useSetCrumbs()

  useLayoutEffect(() => {
    setCrumbs([
      {
        pageName: 'cancelOrgPlan',
        text: 'Cancel plan',
      },
    ])
  }, [setCrumbs])

  return (
    <div className="flex w-8/12 max-w-[596px] gap-8">
      {/* not using p shorthand as we need the specificity to override */}
      {/* eslint-disable-next-line */}
      <Card className="px-6 py-6" variant="cancel">
        <div className="flex flex-col gap-4 text-ds-gray-octonary">
          <h2 className="text-xl font-semibold">Plan cancellation</h2>
          <hr />
          <p>
            Canceling your paid plan means
            <span className="font-bold"> rolling into the Developer plan</span>.
            This will impact the following features, making them unavailable:
          </p>
          <ul>
            <li className="flex items-center gap-1">
              <span className="stroke-ds-primary-red">
                <Icon variant="solid" size="sm" name="no-symbol" />
              </span>
              Configurable number of users
            </li>
            <li className="flex items-center gap-1 pt-3">
              <span className="stroke-ds-primary-red">
                <Icon variant="solid" size="sm" name="no-symbol" />
              </span>
              Technical support
            </li>
            <li className="flex items-center gap-1 pt-3">
              <span className="stroke-ds-primary-red">
                <Icon variant="solid" size="sm" name="no-symbol" />
              </span>
              Unlimited private repo uploads
            </li>
          </ul>
          <hr />
          <p>
            You currently have <b>{accountDetails?.activatedUserCount}</b>{' '}
            active {pluralize('user', accountDetails?.activatedUserCount)}. On
            downgrade, <b>all users will be automatically deactivated</b>. You
            will need to reactivate one user or ensure auto activate is enabled
            in your plan settings.
          </p>
          {/* This is a weird component that is both a button and a modal, hence why it's imported this way. Defs not a good practice but I feel the overhaul of this component will be for another time */}
          <CancelButton
            isFreePlan={planData?.plan?.isFreePlan}
            upComingCancellation={
              accountDetails?.subscriptionDetail?.cancelAtPeriodEnd
            }
            currentPeriodEnd={
              accountDetails?.subscriptionDetail?.currentPeriodEnd
            }
          />
        </div>
      </Card>
    </div>
  )
}

export default DowngradePlan
