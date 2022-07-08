import PropTypes from 'prop-types'

import githubLogo from 'assets/githublogo.png'
import { accountDetailsPropType } from 'services/account'
import Button from 'ui/Button'

function ActionsBilling({ accountDetails, isFreePlan }) {
  if (accountDetails.planProvider === 'github') {
    return (
      <div className="border-ds-gray-secondary flex flex-col gap-4">
        <hr />
        <div className="flex gap-4">
          <img className="w-8 h-8" alt="Github" src={githubLogo} />
          <p className="text-sm">
            Your account is configured via GitHub Marketplace
          </p>
        </div>
        <div className="flex self-start">
          <Button to={{ pageName: 'githubMarketplace' }} variant="primary">
            Manage billing in GitHub
          </Button>
        </div>
      </div>
    )
  }

  if (accountDetails.rootOrganization?.username) {
    return (
      <div className="flex flex-col gap-4">
        <hr />
        <p className="text-sm">
          This subgroup’s billing is managed by{' '}
          {accountDetails.rootOrganization.username}.
        </p>
        <div className="flex self-start">
          <Button
            to={{
              pageName: 'billingAndUsers',
              options: { owner: accountDetails.rootOrganization.username },
            }}
            variant="primary"
          >
            View Billing
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex self-start">
      <Button to={{ pageName: 'upgradePlan' }} variant="primary">
        {isFreePlan ? 'Upgrade plan' : 'Change plan'}
      </Button>
    </div>
  )
}

ActionsBilling.propTypes = {
  accountDetails: accountDetailsPropType.isRequired,
  isFreePlan: PropTypes.bool.isRequired,
}

export default ActionsBilling
