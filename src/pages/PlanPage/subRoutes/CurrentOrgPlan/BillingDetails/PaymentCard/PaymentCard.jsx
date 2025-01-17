import PropTypes from 'prop-types'
import { useState } from 'react'

import { subscriptionDetailType } from 'services/account'
import A from 'ui/A'
import Button from 'ui/Button'
import Icon from 'ui/Icon'

import BankInformation from './BankInformation'
import CardInformation from './CardInformation'
import PaymentMethodForm from './PaymentMethodForm'
function PaymentCard({ subscriptionDetail, provider, owner }) {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const card = subscriptionDetail?.defaultPaymentMethod?.card
  const usBankAccount = subscriptionDetail?.defaultPaymentMethod?.usBankAccount

  return (
    <div className="flex flex-col gap-2 border-t p-4">
      <div className="flex justify-between">
        <h4 className="font-semibold">Payment method</h4>
        {!isFormOpen && (
          <A
            variant="semibold"
            onClick={() => setIsFormOpen(true)}
            hook="edit-payment-method"
          >
            Edit <Icon name="chevronRight" size="sm" variant="solid" />
          </A>
        )}
      </div>
      {isFormOpen ? (
        <PaymentMethodForm
          provider={provider}
          owner={owner}
          closeForm={() => setIsFormOpen(false)}
          subscriptionDetail={subscriptionDetail}
        />
      ) : card ? (
        <CardInformation card={card} subscriptionDetail={subscriptionDetail} />
      ) : usBankAccount ? (
        <BankInformation subscriptionDetail={subscriptionDetail} />
      ) : (
        <div className="flex flex-col gap-4 text-ds-gray-quinary">
          <p className="mt-4">
            No payment method set. Please contact support if you think it&apos;s
            an error or set it yourself.
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
    </div>
  )
}

PaymentCard.propTypes = {
  subscriptionDetail: PropTypes.oneOf([subscriptionDetailType, null]),
  provider: PropTypes.string.isRequired,
  owner: PropTypes.string.isRequired,
}

export default PaymentCard
