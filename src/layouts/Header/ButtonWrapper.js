import Button from 'ui/Button'
import PropTypes from 'prop-types'
import { useAccountDetails } from 'services/account'
import { useOwner } from 'services/user'

function RequestButton({ owner, provider }) {
  const { data: accountDetails } = useAccountDetails({
    provider,
    owner,
    opts: {
      useErrorBoundary: true,
    },
  })
  return (
    accountDetails.plan.value === 'users-free' && (
      <div className="mr-5">
        <Button
          to={{ pageName: 'demo' }}
          variant="secondary"
          data-testid="request-demo"
        >
          Request demo
        </Button>
      </div>
    )
  )
}

RequestButton.propTypes = {
  owner: PropTypes.string.isRequired,
  provider: PropTypes.string.isRequired,
}

function ButtonWrapper({ owner, provider }) {
  const { data: ownerData } = useOwner({ username: owner })

  if (!ownerData) {
    return null
  }

  return (
    ownerData.isCurrentUserPartOfOrg && (
      <RequestButton owner={ownerData.username} provider={provider} />
    )
  )
}

ButtonWrapper.propTypes = {
  owner: PropTypes.string.isRequired,
  provider: PropTypes.string.isRequired,
}

export default ButtonWrapper
