import { useParams } from 'react-router-dom'

import { useAccountDetails } from 'services/account'
import A from 'ui/A'
import Banner from 'ui/Banner'
import BannerContent from 'ui/Banner/BannerContent'
import BannerHeading from 'ui/Banner/BannerHeading'

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

  if (!data?.shouldShowBanner || isFetching) {
    return null
  }

  return (
    <Banner>
      <BannerHeading>
        <h2 className="font-semibold">Trial expiring soon</h2>
      </BannerHeading>
      <BannerContent>
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
          .
        </p>
      </BannerContent>
      <BannerContent>
        <p>
          If you&apos;re having trouble getting started, please see our docs or
          reach out to support{' '}
          <A to={{ pageName: 'support' }} variant="link">
            here
          </A>
          .
        </p>
      </BannerContent>
    </Banner>
  )
}

export default TrialPeriodEnd
