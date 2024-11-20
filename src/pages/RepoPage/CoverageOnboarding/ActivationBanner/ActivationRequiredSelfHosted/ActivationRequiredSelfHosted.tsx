import { useSelfHostedCurrentUser } from 'services/selfHosted'
import Banner from 'ui/Banner'
import BannerContent from 'ui/Banner/BannerContent'
import BannerHeading from 'ui/Banner/BannerHeading'
import Button from 'ui/Button'

function ActivationRequiredSelfHosted() {
  const { data } = useSelfHostedCurrentUser()

  return (
    <Banner variant="plain">
      <BannerContent>
        <BannerHeading>
          <h2 className="font-semibold">&#8505; Activation Required</h2>
          <div className="left-[100px] md:relative">
            {data?.isAdmin ? (
              <Button
                hook="trial-eligible-banner-access"
                to={{
                  pageName: 'access',
                }}
                disabled={false}
                variant="primary"
              >
                Manage members
              </Button>
            ) : (
              <p>Contact your admin for activation.</p>
            )}
          </div>
        </BannerHeading>
        <p>You have available seats, but activation is needed.</p>
      </BannerContent>
    </Banner>
  )
}

export default ActivationRequiredSelfHosted
