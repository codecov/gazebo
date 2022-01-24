import Button from 'ui/Button'
import PropTypes from 'prop-types'
import { useAccountDetails } from 'services/account'
import { trackSegmentEvent } from 'services/tracking/segment'
import { isFreePlan } from 'shared/utils/billing'

function RequestButton({ owner, provider }) {
  const { data: accountDetails } = useAccountDetails({
    provider,
    owner,
    opts: {
      suspense: false,
    },
  })

  return isFreePlan(accountDetails?.plan?.value) ? (
    <Button
      to={{ pageName: 'demo' }}
      variant="secondary"
      data-testid="request-demo"
      onClick={() =>
        trackSegmentEvent({
          event: 'clicked button',
          label: 'request demo',
          category: 'header cta',
        })
      }
      hideExternalIcon
    >
      Request demo
    </Button>
  ) : null
}

RequestButton.propTypes = {
  owner: PropTypes.string.isRequired,
  provider: PropTypes.string.isRequired,
}

export default RequestButton
