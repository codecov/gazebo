import { useParams } from 'react-router-dom'

import { useAvailablePlans } from 'services/account/useAvailablePlans'
import { findSentryPlans } from 'shared/utils/billing'
import { RadioTileGroup } from 'ui/RadioTileGroup'

import { TimePeriods } from '../../../constants'

const BillingControls: React.FC = () => {
  const { provider, owner } = useParams<{ provider: string; owner: string }>()
  const { data: plans } = useAvailablePlans({ provider, owner })
  const { sentryPlanMonth } = findSentryPlans({ plans })

  return (
    <div className="flex w-fit flex-col gap-2">
      <h3 className="font-semibold">Step 2: Choose a billing cycle</h3>
      <div className="inline-flex items-center gap-2">
        <RadioTileGroup value={TimePeriods.MONTHLY}>
          <RadioTileGroup.Item
            value={TimePeriods.MONTHLY}
            className="w-32"
            data-testid="radio-monthly"
          >
            <RadioTileGroup.Label>{TimePeriods.MONTHLY}</RadioTileGroup.Label>
          </RadioTileGroup.Item>
        </RadioTileGroup>
        <p>
          <span className="font-semibold">
            ${sentryPlanMonth?.baseUnitPrice}
          </span>{' '}
          per seat/month, billed {sentryPlanMonth?.billingRate}
        </p>
      </div>
    </div>
  )
}

export default BillingControls
