import upsideDownUmbrella from 'layouts/shared/NetworkErrorBoundary/assets/error-upsidedown-umbrella.svg'
import A from 'ui/A'
import Button from 'ui/Button'

const FreePlanSeatsTakenAlert = () => {
  return (
    <div className="flex flex-col items-center justify-center gap-8 bg-ds-gray-primary pb-28 pt-12 text-center">
      <img src={upsideDownUmbrella} alt="Forbidden" className="w-36" />
      <div className="flex w-3/5 flex-col gap-1">
        <h1 className="text-2xl">Coverage Alert: All Seats Taken</h1>
        <p>
          Your organization is on the Developer free plan, limited to one seat,
          which is currently occupied. You can add any amount of seats by
          upgrading for more flexibility.{' '}
          <A
            to={{ pageName: 'membersTab' }}
            isExternal={false}
            hook="repo-page-to-members-tab"
            variant="semibold"
          >
            manage members
          </A>
        </p>
      </div>
      <Button
        to={{ pageName: 'planTab' }}
        disabled={undefined}
        hook={undefined}
        variant="primary"
      >
        View plan options
      </Button>
    </div>
  )
}

export default FreePlanSeatsTakenAlert
