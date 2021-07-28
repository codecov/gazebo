import Button from 'ui/Button'
import PropTypes from 'prop-types'
import { useAccountDetails } from 'services/account'
import { useOwner } from 'services/user'

function RequestButton({ owner, provider }) {
  const { data: ownerData } = useOwner({ username: owner })
  const { data: accountDetails, isError } = useAccountDetails({
    provider,
    owner,
    opts: {
      suspense: false,
      enabled: false,
    },
  })

  if (!ownerData || isError) {
    return null
  }

  return (
    ownerData?.isCurrentUserPartOfOrg &&
    accountDetails?.plan?.value === 'users-free' && (
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

export default RequestButton
