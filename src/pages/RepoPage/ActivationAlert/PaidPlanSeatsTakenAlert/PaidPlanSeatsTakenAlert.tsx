import upsideDownUmbrella from 'layouts/shared/NetworkErrorBoundary/assets/error-upsidedown-umbrella.svg'
import A from 'ui/A'
import Button from 'ui/Button'

const PaidPlanSeatsTakenAlert = () => {
  return (
    <div className="flex flex-col items-center justify-center gap-8 bg-ds-gray-primary pb-28 pt-12 text-center">
      <img src={upsideDownUmbrella} alt="Forbidden" className="w-36" />
      <div className="flex w-2/5 flex-col gap-1">
        <h1 className="text-2xl">Seats Limit Reached</h1>
        <p>
          Your organization has utilized all available seats on this plan. To
          add more members, please increase your seat count.{' '}
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
        to={{ pageName: 'upgradeOrgPlan' }}
        disabled={undefined}
        hook={undefined}
        variant="primary"
      >
        Increase seat count
      </Button>
    </div>
  )
}

export default PaidPlanSeatsTakenAlert
