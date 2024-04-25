import { useLayoutEffect } from 'react'
import { useParams } from 'react-router-dom'

import Card from 'old_ui/Card'
import { useAccountDetails } from 'services/account'
import Icon from 'ui/Icon'

import CancelButton from './CancelButton'

import { useSetCrumbs } from '../../../../context'

function DowngradePlan() {
  const { provider, owner } = useParams()
  const { data: accountDetails } = useAccountDetails({ provider, owner })
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
    <div className="flex w-8/12 gap-8">
      <Card variant="cancel">
        <div className="flex flex-col gap-4 text-ds-gray-quinary">
          <h2 className="bold text-2xl text-codecov-red">
            Downgrading to basic
          </h2>
          <hr />
          <p>
            Note that, when downgrading to basic the following features will
            become unavailable:
          </p>
          <ul>
            <li className="flex items-center gap-1">
              <span className="stroke-codecov-red">
                <Icon variant="solid" size="sm" name="no-symbol" />
              </span>
              Configurable # of users
            </li>
            <li className="flex items-center gap-1 pt-3">
              <span className="stroke-codecov-red">
                <Icon variant="solid" size="sm" name="no-symbol" />
              </span>
              Technical support
            </li>
            <li className="flex items-center gap-1 pt-3">
              <span className="stroke-codecov-red">
                <Icon variant="solid" size="sm" name="no-symbol" />
              </span>
              Carry-forward flags
            </li>
            <li className="flex items-center gap-1 pt-3">
              <span className="stroke-codecov-red">
                <Icon variant="solid" size="sm" name="no-symbol" />
              </span>
              Unlimited private uploads
            </li>
          </ul>
          <hr />
          <p>
            You currently have {accountDetails?.activatedUserCount} active
            users. On downgrade, all users will be automatically deactivated.
            You will need to manually reactivate up to five users or ensure auto
            activate is enabled in your plan settings.
          </p>
          {/* This is a weird component that is both a button and a modal, hence why it's imported this way. Defs not a good practice but I feel the overhaul of this component will be for another time */}
          <CancelButton
            customerId={accountDetails?.subscriptionDetail?.customer?.id}
            planCost={accountDetails?.plan?.value}
            upComingCancelation={
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
