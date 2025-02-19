import { z } from 'zod'

import bankLogo from 'assets/billing/bank.svg'
import { USBankAccountSchema } from 'services/account/useAccountDetails'

interface BankInformationProps {
  usBankAccount: z.infer<typeof USBankAccountSchema>
  nextBillingDisplayDate: string | null
}

function BankInformation({
  usBankAccount,
  nextBillingDisplayDate,
}: BankInformationProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2">
        <img src={bankLogo} alt="bank logo" />
        <div className="ml-1 flex flex-col self-center">
          <b>
            {usBankAccount?.bankName}
            &nbsp;••••&nbsp;
            {usBankAccount?.last4}
          </b>
        </div>
      </div>
      {nextBillingDisplayDate && (
        <p className="text-sm text-ds-gray-quinary">
          Your next billing date is{' '}
          <span className="text-ds-gray-octonary">
            {nextBillingDisplayDate}
          </span>
          .
        </p>
      )}
    </div>
  )
}

export default BankInformation
