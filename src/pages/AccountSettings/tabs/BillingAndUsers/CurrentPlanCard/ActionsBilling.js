import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'

import Button from 'ui/Button'
import githubLogo from 'assets/githublogo.png'
import { useBaseUrl } from 'services/navigation'
import { accountDetailsPropType } from 'services/account'

function shouldRenderCancelLink(accountDetails, isFreePlan) {
  // cant cancel a free plan
  if (isFreePlan) return false

  // plan is already set for cancellation
  if (accountDetails.subscriptionDetail?.cancelAtPeriodEnd) return false

  return true
}

function ActionsBilling({ accountDetails, isFreePlan }) {
  const baseUrl = useBaseUrl()

  if (accountDetails.planProvider === 'github') {
    return (
      <div className="border-t border-gray-200 pb-4">
        <p className="mt-4 mb-6 flex items-center text-sm">
          <img
            className="block mr-4"
            alt="Github"
            src={githubLogo}
            height={32}
            width={32}
          />
          Your account is configured via GitHub Marketplace
        </p>
        <div className="text-center">
          <Button Component="a" href="https://github.com/marketplace/codecov">
            Manage billing in GitHub
          </Button>
        </div>
      </div>
    )
  }

  if (accountDetails.rootOrganization) {
    return (
      <div className="border-t border-gray-200 pb-4">
        <p className="mt-4 mb-6 text-sm">
          This subgroup’s billing is managed by{' '}
          {accountDetails.rootOrganization.username}.
        </p>
        <div className="text-center">
          <Button
            Component={Link}
            to={`/account/gl/${accountDetails.rootOrganization.username}/billing`}
          >
            View Billing
          </Button>
        </div>
      </div>
    )
  }

  return (
    <>
      <Button Component={Link} to={`${baseUrl}upgrade`}>
        {isFreePlan ? 'Upgrade plan to pro' : 'Change plan'}
      </Button>
      {shouldRenderCancelLink(accountDetails, isFreePlan) && (
        <Button
          to={`${baseUrl}cancel`}
          Component={Link}
          variant="text"
          color="gray"
          className="mt-4"
        >
          Cancel Plan
        </Button>
      )}
    </>
  )
}

ActionsBilling.propTypes = {
  accountDetails: accountDetailsPropType.isRequired,
  isFreePlan: PropTypes.bool.isRequired,
}

export default ActionsBilling
