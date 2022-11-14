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
      enabled: !config.IS_ENTERPRISE,
    },
  })

  if (config.IS_ENTERPRISE) {
    return null
  }

  if (isFreePlan(accountDetails?.plan?.value)) {
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

  return null
}

RequestButton.propTypes = {
  owner: PropTypes.string.isRequired,
  provider: PropTypes.string.isRequired,
}

export default RequestButton
