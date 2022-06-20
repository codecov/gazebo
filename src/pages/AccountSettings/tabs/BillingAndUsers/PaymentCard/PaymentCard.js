import PropTypes from 'prop-types'
import { useState } from 'react'

import Button from 'old_ui/Button'
import Card from 'old_ui/Card'
import { subscriptionDetailType } from 'services/account'

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
    <Card className="p-6 mb-4">
      <h2 className="text-lg">Creditcard information</h2>
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
        <>
          <p className="my-4 text-gray-500">
            No credit card set. Please contact support if you think it’s an
            error or set it yourself.
          </p>
          <Button hook="open-modal" onClick={() => setIsFormOpen(true)}>
            Set card
          </Button>
        </>
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
