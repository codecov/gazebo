import { useParams } from 'react-router-dom'

import { useAccountDetails } from 'services/account'
import A from 'ui/A'
import Banner from 'ui/Banner'

import { transformData } from './transformData'

const TrialPeriodEnd = () => {
  const { provider, owner } = useParams()
  const { data, isFetching } = useAccountDetails({
    owner: owner,
    provider,
    opts: {
      enabled: !!owner,
      select: (res) => transformData(res?.subscriptionDetail),
    },
  })

  if (data?.shouldHideBanner || isFetching) {
    return null
  }

  return (
    <Banner>
      <p className="text-sm font-semibold text-ds-gray-octonary">
        Trial expiring soon
      </p>
      <p>
        Your trial is set to run out in {data?.daysLeftInTrial} days. If
        you&apos;d like to continue utilizing Codecov at a discounted rate,
        please input your payment info{' '}
        <A
          isExternal
          href="https://billing.stripe.com/p/login/aEU00i9by3V4caQ6oo"
          hook="stripe-account-management-portal"
        >
          here
        </A>
        . If you&apos;re having trouble getting started, please see our docs or
        reach out to support{' '}
        <A to={{ pageName: 'support' }} variant="link">
          here
        </A>
        .
      </p>
    </Banner>
  )
}

export default TrialPeriodEnd
