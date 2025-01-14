import { z } from 'zod'

import { SubscriptionDetailSchema } from 'services/account'
import { cn } from 'shared/utils/cn'
import Button from 'ui/Button'

import BankInformation from './BankInformation'
import CardInformation from './CardInformation'

function PaymentMethod({
  setEditMode,
  subscriptionDetail,
  className,
}: {
  setEditMode: (isEditMode: boolean) => void
  subscriptionDetail: z.infer<typeof SubscriptionDetailSchema>
  provider: string
  owner: string
  className?: string
}) {
  const isCardSet = !!subscriptionDetail?.defaultPaymentMethod?.card
  const isBankSet = !!subscriptionDetail?.defaultPaymentMethod?.usBankAccount

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <div className="flex justify-between">
        <h4 className="font-semibold">Payment method</h4>
      </div>
      {isCardSet ? (
        <CardInformation subscriptionDetail={subscriptionDetail} />
      ) : isBankSet ? (
        <BankInformation subscriptionDetail={subscriptionDetail} />
      ) : (
        <div className="flex flex-col gap-4 text-ds-gray-quinary">
          <p className="mt-4">
            No payment method set. Please contact support if you think it’s an
            error or set it yourself.
          </p>
          <div className="flex self-start">
            <Button
              hook="open-edit-mode"
              data-testid="open-edit-mode"
              variant="primary"
              onClick={() => setEditMode(true)}
            >
              Set payment method
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export default PaymentMethod
