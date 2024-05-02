import Banner from 'ui/Banner'
import BannerContent from 'ui/Banner/BannerContent'
import BannerHeading from 'ui/Banner/BannerHeading'
import Button from 'ui/Button'

function ActivationRequiredBanner() {
  return (
    <Banner variant="plain">
      <BannerContent>
        <BannerHeading>
          <h2 className="font-semibold">&#8505; Activation Required</h2>
        </BannerHeading>
        <div className="flex justify-between">
          <p>You have available seats, but activation is needed.</p>
          <div className="mt-[-9px]">
            <Button
              hook="trial-eligible-banner-start-trial"
              to={{
                pageName: 'membersTab',
              }}
              disabled={false}
              variant="primary"
            >
              Manage Members
            </Button>
          </div>
        </div>
      </BannerContent>
    </Banner>
  )
}

export default ActivationRequiredBanner
