import { z } from 'zod'

import bankLogo from 'assets/billing/bank.svg'
import { USBankAccountSchema } from 'services/account'

interface BankInformationProps {
  usBankAccount: z.infer<typeof USBankAccountSchema>
}

function BankInformation({ usBankAccount }: BankInformationProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-1">
        <img src={bankLogo} alt="bank logo" />
        <div className="ml-1 flex flex-col self-center">
          <b>
            {usBankAccount?.bankName}
            &nbsp;••••&nbsp;
            {usBankAccount?.last4}
          </b>
        </div>
      </div>
    </div>
  )
}

export default BankInformation
