import { useParams } from 'react-router-dom'

import { useAccountDetails } from 'services/account'
import { Provider } from 'shared/api/helpers'

import AddressCard from './Address/AddressCard'
import EmailAddress from './EmailAddress'
import PaymentCard from './PaymentCard'

interface URLParams {
  provider: Provider
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
        subscriptionDetail={subscriptionDetail}
        provider={provider}
        owner={owner}
      />
      <AddressCard
        subscriptionDetail={subscriptionDetail}
        provider={provider}
        owner={owner}
      />
      {subscriptionDetail.taxIds.length > 0 ? (
        <div className="flex flex-col gap-2 p-4">
          <h4 className="font-semibold">Tax ID</h4>
          {subscriptionDetail.taxIds.map((val, index) => (
            <p key={index}>{val?.value}</p>
          ))}
        </div>
      ) : null}
    </div>
  )
}

export default BillingDetails
