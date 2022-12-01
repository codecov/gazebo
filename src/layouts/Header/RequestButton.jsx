import PropTypes from 'prop-types'

import config from 'config'

import { useAccountDetails } from 'services/account'
import { trackSegmentEvent } from 'services/tracking/segment'
import { isFreePlan } from 'shared/utils/billing'
import Button from 'ui/Button'

function RequestButton({ owner, provider }) {
  const { data: accountDetails } = useAccountDetails({
    provider,
    owner,
    opts: {
      suspense: false,
      enabled: !config.IS_SELF_HOSTED,
    },
  })
  const isAnPaidAccount = !isFreePlan(accountDetails?.plan?.value)

  // Do not up sell if self hosted or org is all ready a paying customer.
  if (config.IS_SELF_HOSTED || isAnPaidAccount) {
    return null
  }

  return (
    <Button
      to={{ pageName: 'demo' }}
      showExternalIcon={false}
      variant="secondary"
      data-testid="request-demo"
      onClick={() =>
        trackSegmentEvent({
          event: 'clicked button',
          data: {
            label: 'request demo',
            category: 'header cta',
          },
        })
      }
    >
      Request demo
    </Button>
  )
}

RequestButton.propTypes = {
  owner: PropTypes.string.isRequired,
  provider: PropTypes.string.isRequired,
}

export default RequestButton
