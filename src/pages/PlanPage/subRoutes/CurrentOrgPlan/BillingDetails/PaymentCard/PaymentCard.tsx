import PropTypes from 'prop-types'
import { useState } from 'react'
import { z } from 'zod'

import {
  SubscriptionDetailSchema,
  subscriptionDetailType,
} from 'services/account'
import A from 'ui/A'
import Button from 'ui/Button'
import Icon from 'ui/Icon'

import CardInformation from './CardInformation'
import CreditCardForm from './CreditCardForm'
import { cn } from 'shared/utils/cn'

function PaymentCard({
  isEditMode,
  setEditMode,
  subscriptionDetail,
  provider,
  owner,
  className,
}: {
  isEditMode: boolean
  setEditMode: (isEditMode: boolean) => void
  subscriptionDetail: z.infer<typeof SubscriptionDetailSchema>
  provider: string
  owner: string
  className?: string
}) {
  const card = subscriptionDetail?.defaultPaymentMethod?.card

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="flex justify-between">
        <h4 className="font-semibold">Payment method</h4>
      </div>
      {isEditMode ? (
        <CreditCardForm
          provider={provider}
          owner={owner}
          closeForm={() => setEditMode(false)}
        />
      ) : card ? (
        <CardInformation card={card} subscriptionDetail={subscriptionDetail} />
      ) : (
        <div className="flex flex-col gap-4 text-ds-gray-quinary">
          <p className="mt-4">
            No credit card set. Please contact support if you think it’s an
            error or set it yourself.
          </p>
          <div className="flex self-start">
            <Button
              hook="open-modal"
              variant="primary"
              onClick={() => setEditMode(true)}
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
