import Button from 'ui/Button'
import PropTypes from 'prop-types'
import { useAccountDetails } from 'services/account'

function RequestButton({ owner, provider }) {
  const { data: accountDetails } = useAccountDetails({
    provider,
    owner,
    opts: {
      suspense: false,
    },
  })

  return accountDetails?.plan?.value === 'users-free' ? (
    <div className="mr-5">
      <Button
        to={{ pageName: 'demo' }}
        variant="secondary"
        data-testid="request-demo"
      >
        Request demo
      </Button>
    </div>
  ) : null
}

RequestButton.propTypes = {
  owner: PropTypes.string.isRequired,
  provider: PropTypes.string.isRequired,
}

export default RequestButton
