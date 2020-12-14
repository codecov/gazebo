import Message from 'ui/Message'

// Todo create form to
/* If you want to update through an API request you would need to submit a plan-change (PATCH to the account endpoint, changing the plan field) */
function LegacyUpgrade() {
  return (
    <>
      <Message variant="warning">
        <h2 className="text-lg">
          You are using a Legacy Plan Your current plan is part of our legacy
          per repository billing subscription.
        </h2>
        <p className="text-sm">
          These plans have been removed in favor of per user billing. Your
          current plan will remain in effect unless changed by you.
        </p>
      </Message>
    </>
  )
}

export default LegacyUpgrade
