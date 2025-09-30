import PropTypes from 'prop-types'
import { useMemo, useState } from 'react'

import { accountDetailsPropType } from 'services/account/propTypes'
import { usePlanData } from 'services/account/usePlanData'
import {
  BillingRate,
  formatNumberToUSD,
  formatTimestampToCalendarDate,
} from 'shared/utils/billing'
import {
  calculatePriceProPlan,
  calculatePriceSentryPlan,
  calculatePriceTeamPlan,
} from 'shared/utils/upgradeForm'
import A from 'ui/A'
import Button from 'ui/Button'
import Icon from 'ui/Icon'

import BankInformation from './BankInformation'
import CardInformation from './CardInformation'
import PaymentMethodForm from './PaymentMethodForm'

import { MONTHS_PER_YEAR } from '../BillingDetails'
function PaymentCard({ accountDetails, provider, owner }) {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const { data: planData } = usePlanData({
    provider,
    owner,
  })
  const subscriptionDetail = accountDetails?.subscriptionDetail
  const card = subscriptionDetail?.defaultPaymentMethod?.card
  const usBankAccount = subscriptionDetail?.defaultPaymentMethod?.usBankAccount
  let nextBillingDisplayDate = null
  if (!subscriptionDetail?.cancelAtPeriodEnd) {
    nextBillingDisplayDate = formatTimestampToCalendarDate(
      subscriptionDetail?.currentPeriodEnd
    )
  }

  const nextBillPrice = useMemo(() => {
    const isPerYear = planData?.plan?.billingRate === BillingRate.ANNUALLY
    let seats =
      (planData?.plan?.planUserCount ?? 0) -
      (planData?.plan?.freeSeatCount ?? 0)
    seats = Math.max(seats, 0)
    const planBaseUnitPrice = planData?.plan?.baseUnitPrice ?? 0
    const billPrice = planData?.plan?.isProPlan
      ? calculatePriceProPlan({
          seats,
          baseUnitPrice: planBaseUnitPrice,
        })
      : planData?.plan?.isTeamPlan
        ? calculatePriceTeamPlan({
            seats,
            baseUnitPrice: planBaseUnitPrice,
          })
        : calculatePriceSentryPlan({
            seats,
            baseUnitPrice: planBaseUnitPrice,
          })

    return formatNumberToUSD(
      isPerYear ? billPrice * MONTHS_PER_YEAR : billPrice
    )
  }, [
    planData?.plan?.billingRate,
    planData?.plan?.baseUnitPrice,
    planData?.plan?.planUserCount,
    planData?.plan?.freeSeatCount,
    planData?.plan?.isProPlan,
    planData?.plan?.isTeamPlan,
  ])

  return (
    <div className="flex flex-col gap-3 border-t p-4">
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
          accountDetails={accountDetails}
        />
      ) : card ? (
        <CardInformation
          card={card}
          subscriptionDetail={subscriptionDetail}
          nextBillPrice={nextBillPrice}
        />
      ) : usBankAccount ? (
        <BankInformation
          usBankAccount={usBankAccount}
          nextBillingDisplayDate={nextBillingDisplayDate}
        />
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
              Set payment method
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

PaymentCard.propTypes = {
  accountDetails: accountDetailsPropType,
  provider: PropTypes.string.isRequired,
  owner: PropTypes.string.isRequired,
}

export default PaymentCard
