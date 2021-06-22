import { useState } from 'react'
import PropTypes from 'prop-types'

import Card from 'old_ui/Card'
import Button from 'old_ui/Button'
import { subscriptionDetailType } from 'services/account'

import CreditCardForm from './CreditCardForm'
import CardInformation from './CardInformation'

const proPlans = [
  'users-pr-inappm',
  'users-pr-inappy',
  'users-inappm',
  'users-inappy',
]

function PaymentCard({ subscriptionDetail, provider, owner }) {
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
          <Button onClick={() => setIsFormOpen(true)}>Set card</Button>
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
