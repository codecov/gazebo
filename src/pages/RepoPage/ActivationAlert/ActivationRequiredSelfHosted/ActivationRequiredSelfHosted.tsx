import upsideDownUmbrella from 'layouts/shared/NetworkErrorBoundary/assets/error-upsidedown-umbrella.svg'
import { useSelfHostedCurrentUser } from 'services/selfHosted'
import Button from 'ui/Button'

const ActivationRequiredSelfHosted = () => {
  const { data } = useSelfHostedCurrentUser()

  return (
    <div className="flex flex-col items-center justify-center gap-8 bg-ds-gray-primary pb-28 pt-12 text-center">
      <img src={upsideDownUmbrella} alt="Forbidden" className="w-36" />
      <div className="flex w-2/5 flex-col gap-1">
        <h1 className="text-2xl">Activation Required</h1>
        <p>You have available seats, but activation is needed.</p>
      </div>
      {data?.isAdmin ? (
        <Button
          to={{ pageName: 'access' }}
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

export default ActivationRequiredSelfHosted
