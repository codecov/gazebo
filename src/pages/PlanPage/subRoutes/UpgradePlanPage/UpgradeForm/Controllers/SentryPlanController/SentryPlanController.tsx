import { UseFormRegister } from 'react-hook-form'

import { MIN_SENTRY_SEATS } from 'shared/utils/upgradeForm'
import { Card } from 'ui/Card'
import TextInput from 'ui/TextInput'

import BillingOptions from './BillingOptions'
import PriceCallout from './PriceCallout'
import UserCount from './UserCount'

import { UpgradeFormFields } from '../../UpgradeForm'

interface SentryPlanControllerProps {
  seats: number
  register: UseFormRegister<UpgradeFormFields>
  errors?: {
    seats?: {
      message?: string
    }
  }
}

const SentryPlanController: React.FC<SentryPlanControllerProps> = ({
  seats,
  register,
  errors,
}) => {
  return (
    <>
      <Card.Content>
        <div className="flex flex-col gap-2">
          <BillingOptions />
        </div>
      </Card.Content>
      <hr />
      <Card.Content>
        <div className="flex flex-col gap-2 xl:w-5/12">
          <label htmlFor="nb-seats" className="font-semibold">
            Step 3: Enter seat count
          </label>
          <div className="w-1/4">
            <TextInput
              data-cy="seats"
              dataMarketing="plan-pricing-seats"
              {...register('seats')}
              id="nb-seats"
              size={20}
              type="number"
              min={MIN_SENTRY_SEATS}
            />
          </div>
          <UserCount />
        </div>
      </Card.Content>
      <Card.Content>
        <PriceCallout seats={seats} />
        {errors?.seats && (
          <p className="rounded-md bg-ds-error-quinary p-3 text-ds-error-nonary">
            {errors?.seats?.message}
          </p>
        )}
      </Card.Content>
    </>
  )
}

export default SentryPlanController
