import upsideDownUmbrella from 'layouts/shared/NetworkErrorBoundary/assets/error-upsidedown-umbrella.svg'
import {
  useSelfHostedCurrentUser,
  useSelfHostedSeatsConfig,
} from 'services/selfHosted'
import A from 'ui/A'
import Button from 'ui/Button'

const alertWrapperClassName =
  'flex flex-col items-center justify-center gap-8 bg-ds-gray-primary pb-28 pt-12 text-center'

function SeatsLimitReached() {
  return (
    <div className={alertWrapperClassName}>
      <img src={upsideDownUmbrella} alt="Forbidden" className="w-36" />
      <div className="flex w-2/5 flex-col gap-1">
        <h1 className="text-2xl">Activation Required</h1>
        <p>Your organization has utilized all available seats.</p>
        <div className="mt-5">
          <A
            to={{ pageName: 'sales' }}
            isExternal
            hook="contact-sales-self-hosted"
          >
            Contact Sales
          </A>{' '}
          to increase your seat count.
        </div>
      </div>
    </div>
  )
}

function SeatsAvailable({ isAdmin }: { isAdmin: boolean }) {
  return (
    <div className={alertWrapperClassName}>
      <img src={upsideDownUmbrella} alt="Forbidden" className="w-36" />
      <div className="flex w-2/5 flex-col gap-1">
        <h1 className="text-2xl">Activation Required</h1>
        <p>You have available seats, but activation is needed.</p>
      </div>
      {isAdmin ? (
        <Button
          to={{ pageName: 'users' }}
          disabled={undefined}
          hook={undefined}
          variant="primary"
        >
          Manage members
        </Button>
      ) : (
        <p>Contact your admin for activation.</p>
      )}
    </div>
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
