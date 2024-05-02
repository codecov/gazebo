import A from 'ui/A'
import Banner from 'ui/Banner'
import BannerContent from 'ui/Banner/BannerContent'
import BannerHeading from 'ui/Banner/BannerHeading'
import Button from 'ui/Button'

function PaidPlanSeatsLimitBanner() {
  return (
    <Banner variant="plain">
      <BannerContent>
        <BannerHeading>
          <h2 className="font-semibold">&#8505; Seats Limit Reached</h2>
        </BannerHeading>
        <div className="flex justify-between">
          <p>
            Your organization has utilized all available seats on this plan. To
            add more members, please increase your seat count.{' '}
            <A
              to={{ pageName: 'membersTab' }}
              hook="manage-members-paid-plan"
              isExternal={false}
            >
              manage members
            </A>
          </p>
          <div className="flex items-start justify-end">
            <Button
              hook="trial-eligible-banner-start-trial"
              to={{
                pageName: 'upgradeOrgPlan',
              }}
              disabled={false}
              variant="primary"
            >
              Upgrade
            </Button>
          </div>
        </div>
      </BannerContent>
    </Banner>
  )
}

export default PaidPlanSeatsLimitBanner
