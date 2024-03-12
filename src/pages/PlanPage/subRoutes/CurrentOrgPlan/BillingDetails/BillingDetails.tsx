import { useParams } from 'react-router-dom'

import { useAccountDetails } from 'services/account'

import EmailAddress from './EmailAddress'
import PaymentCard from './PaymentCard'

interface URLParams {
  provider: string
  owner: string
}

function BillingDetails() {
  const { provider, owner } = useParams<URLParams>()
  const { data: accountDetails } = useAccountDetails({
    provider,
    owner,
  })
  const subscriptionDetail = accountDetails?.subscriptionDetail

  if (!subscriptionDetail) {
    return null
  }

  return (
    <div className="flex flex-col border">
      <h3 className="p-4 font-semibold">Billing details</h3>
      <EmailAddress />
      <PaymentCard
        // @ts-expect-error - TODO fix this once we update PaymentCard to TS
        subscriptionDetail={accountDetails?.subscriptionDetail}
        provider={provider}
        owner={owner}
      />
    </div>
  )
}

export default BillingDetails
