import { useState } from 'react'
import { useParams } from 'react-router-dom'

import { useAccountDetails, usePlans } from 'services/account'
import { useUser } from 'services/user'
import { canApplySentryUpgrade, Plans } from 'shared/utils/billing'
import A from 'ui/A'
import Banner from 'ui/Banner'
import BannerContent from 'ui/Banner/BannerContent'
import BannerHeading from 'ui/Banner/BannerHeading'
import Icon from 'ui/Icon'

interface SentryBundleBannerParams {
  provider: string
}

const SentryBundleBanner: React.FC = () => {
  const { provider } = useParams<SentryBundleBannerParams>()
  const { data: plansData } = usePlans(provider)
  const { data: userData } = useUser()
  const { data: accountData } = useAccountDetails({
    provider,
    owner: userData?.user?.username,
    opts: {
      enabled: !!userData?.user?.username,
    },
  })

  const plan = accountData?.plan?.value

  const [hideBanner, setHideBanner] = useState(
    () =>
      localStorage.getItem('show-sentry-bundle-banner') === 'false' ||
      plan === Plans.USERS_SENTRYM ||
      plan === Plans.USERS_SENTRYY ||
      !canApplySentryUpgrade({
        plan: plan,
        plans: plansData,
      })
  )

  if (hideBanner) {
    return null
  }

  return (
    <Banner>
      <BannerHeading>
        <div className="flex flex-1 justify-between">
          <h2 className="font-semibold">Sentry Bundle Benefit &#127881;</h2>
          <button
            aria-label="Dismiss banner"
            className="cursor-pointer hover:text-ds-blue"
            onClick={() => {
              localStorage.setItem('show-sentry-bundle-banner', 'false')
              setHideBanner(true)
            }}
          >
            <Icon name="x" size="sm" variant="solid" />
          </button>
        </div>
      </BannerHeading>
      <BannerContent>
        <p>
          Your Sentry Bundle benefit has been claimed. You can apply it to your
          organization at any time by selecting it from the{' '}
          <A
            to={{ pageName: 'planTab' }}
            hook="sentry-banner-to-plans-tab"
            isExternal={false}
          >
            plans tab
          </A>
          .
        </p>
      </BannerContent>
    </Banner>
  )
}

export default SentryBundleBanner
