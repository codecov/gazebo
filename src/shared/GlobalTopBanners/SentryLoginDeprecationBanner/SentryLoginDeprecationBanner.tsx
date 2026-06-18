import { useUser } from 'services/user/useUser'
import TopBanner from 'ui/TopBanner'

const SENTRY_LOGIN_DEPRECATION_BANNER_KEY = 'sentry-login-deprecation-banner'

const SentryLoginDeprecationBanner = () => {
  const { data: userData } = useUser()
  const hasLinkedSentryLogin = userData?.hasLinkedSentryLogin

  if (hasLinkedSentryLogin) {
    return (
      <TopBanner
        localStorageKey={SENTRY_LOGIN_DEPRECATION_BANNER_KEY}
        variant="importantAnnouncement"
      >
        <TopBanner.Start>
          <p className="font-semibold text-white">
            Logging in through Sentry will no longer be supported starting July
            8th, 2026. Please continue logging in through your Source Code
            Management platform instead.
          </p>
        </TopBanner.Start>
        <TopBanner.End>
          <TopBanner.DismissButton>
            <span className="text-white opacity-100"> Dismiss </span>
          </TopBanner.DismissButton>
        </TopBanner.End>
      </TopBanner>
    )
  }

  return null
}

export default SentryLoginDeprecationBanner
