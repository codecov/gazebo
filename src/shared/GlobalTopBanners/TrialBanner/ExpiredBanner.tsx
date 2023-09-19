import A from 'ui/A/A'
import Button from 'ui/Button/Button'
import Icon from 'ui/Icon/Icon'
import TopBanner from 'ui/TopBanner'

const ExpiredBanner: React.FC = () => {
  return (
    <TopBanner localStorageKey="global-top-expired-trial-banner">
      <TopBanner.Start>
        <p className="font-semibold">
          <span className="pr-2 text-xl">&#127881;</span>
          The organization&apos;s 14-day free Codecov Pro trial has ended.{' '}
          {/* @ts-expect-error */}
          <A to={{ pageName: 'upgradeOrgPlan' }}>
            Add payment method
            <Icon name="chevronRight" size="sm" variant="solid" />
          </A>
        </p>
      </TopBanner.Start>
      <TopBanner.End>
        <Button
          to={{ pageName: 'upgradeOrgPlan' }}
          hook="expired-trial-banner-to-upgrade-page"
          disabled={false}
          variant="primary"
        >
          Upgrade
        </Button>
        <TopBanner.DismissButton>
          <Icon size="sm" variant="solid" name="x" />
        </TopBanner.DismissButton>
      </TopBanner.End>
    </TopBanner>
  )
}

export default ExpiredBanner
