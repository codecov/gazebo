import Button from 'ui/Button/Button'
import Icon from 'ui/Icon/Icon'
import TopBanner from 'ui/TopBanner'

const StartTrialBanner: React.FC = () => {
  return (
    <TopBanner localStorageKey="global-top-sentry-banner">
      <TopBanner.Start>
        <p>
          <span className="pr-2 text-xl">&#127881;</span>
          <span className="font-semibold">
            Start your 14-day free Codecov Pro trial today.
          </span>{' '}
          No credit card required.
        </p>
      </TopBanner.Start>
      <TopBanner.End>
        <Button
          to={{ pageName: 'allOrgsPlanPage' }}
          hook="sentry-trial-banner-to-upgrade-page"
          disabled={false}
          variant="primary"
        >
          Start Trial
        </Button>
        <TopBanner.DismissButton>
          <Icon size="sm" variant="solid" name="x" />
        </TopBanner.DismissButton>
      </TopBanner.End>
    </TopBanner>
  )
}

export default StartTrialBanner
