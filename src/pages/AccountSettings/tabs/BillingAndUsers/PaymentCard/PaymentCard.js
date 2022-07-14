import PropTypes from 'prop-types'
import { useState } from 'react'

import { subscriptionDetailType } from 'services/account'
import Button from 'ui/Button'
import Card from 'ui/Card'

import CardInformation from './CardInformation'
import CreditCardForm from './CreditCardForm'
import { useEnterpriseCloudPlanSupport } from './hooks'

const defaultProPlans = [
  'users-pr-inappm',
  'users-pr-inappy',
  'users-inappm',
  'users-inappy',
]
function PaymentCard({ subscriptionDetail, provider, owner }) {
  const { plans: proPlans } = useEnterpriseCloudPlanSupport({
    plans: defaultProPlans,
  })
  const isPayingCustomer = proPlans.includes(subscriptionDetail?.plan?.value)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const card = subscriptionDetail?.defaultPaymentMethod?.card

  if (!card && !isPayingCustomer) return null

  return (
    <Card header="Method of payment">
      {isFormOpen ? (
        <CreditCardForm
          provider={provider}
          owner={owner}
          closeForm={() => setIsFormOpen(false)}
        />
      ) : card ? (
        <CardInformation
          card={card}
          subscriptionDetail={subscriptionDetail}
          openForm={() => setIsFormOpen(true)}
        />
      ) : (
        <div className="text-ds-gray-quinary flex flex-col gap-4">
          <p>
            No credit card set. Please contact support if you think it’s an
            error or set it yourself.
          </p>
          <div className="flex self-start">
            <Button
              hook="open-modal"
              variant="primary"
              onClick={() => setIsFormOpen(true)}
            >
              Set card
            </Button>
          </div>
        </div>
      )}
    </Card>
  )
}

PaymentCard.propTypes = {
  subscriptionDetail: subscriptionDetailType,
  provider: PropTypes.string.isRequired,
  owner: PropTypes.string.isRequired,
}

export default PaymentCard
