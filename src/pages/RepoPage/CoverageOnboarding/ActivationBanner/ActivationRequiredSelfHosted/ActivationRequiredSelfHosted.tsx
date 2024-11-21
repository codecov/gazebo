import {
  useSelfHostedCurrentUser,
  useSelfHostedSeatsConfig,
} from 'services/selfHosted'
import A from 'ui/A'
import Banner from 'ui/Banner'
import BannerContent from 'ui/Banner/BannerContent'
import BannerHeading from 'ui/Banner/BannerHeading'
import Button from 'ui/Button'

function SeatsLimitReached() {
  return (
    <Banner variant="plain">
      <BannerContent>
        <BannerHeading>
          <h2 className="font-semibold">&#8505; Seats Limit Reached</h2>
        </BannerHeading>
        <div>
          Your organization has utilized all available seats.{' '}
          <A
            to={{ pageName: 'sales' }}
            isExternal
            hook="contact-sales-self-hosted"
          >
            Contact Sales
          </A>{' '}
          to increase your seat count.
        </div>
      </BannerContent>
    </Banner>
  )
}

function SeatsAvailable({ isAdmin }: { isAdmin: boolean }) {
  return (
    <Banner variant="plain">
      <BannerContent>
        <BannerHeading>
          <h2 className="font-semibold">&#8505; Activation Required</h2>
          <div className="left-[100px] md:relative">
            {isAdmin ? (
              <Button
                hook="activation-required-self-hosted-banner-users"
                to={{
                  pageName: 'users',
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

function ActivationRequiredSelfHosted() {
  const { data } = useSelfHostedCurrentUser()
  const { data: selfHostedSeats } = useSelfHostedSeatsConfig()

  const hasSelfHostedSeats =
    selfHostedSeats?.seatsUsed &&
    selfHostedSeats?.seatsLimit &&
    selfHostedSeats?.seatsUsed < selfHostedSeats?.seatsLimit

  return hasSelfHostedSeats ? (
    <SeatsAvailable isAdmin={data?.isAdmin ?? false} />
  ) : (
    <SeatsLimitReached />
  )
}

export default ActivationRequiredSelfHosted
