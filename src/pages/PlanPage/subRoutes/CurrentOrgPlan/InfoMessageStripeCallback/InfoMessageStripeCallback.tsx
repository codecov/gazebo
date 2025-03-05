import qs from 'qs'
import { useLocation } from 'react-router-dom'

import { Alert } from 'ui/Alert'

// Stripe redirects to this page with ?success or ?cancel in the URL
// this component takes care of rendering a message if it is successful
function InfoMessageStripeCallback({
  awaitingInitialPaymentMethodVerification,
}: {
  awaitingInitialPaymentMethodVerification: boolean
}) {
  const urlParams = qs.parse(useLocation().search, {
    ignoreQueryPrefix: true,
  })

  if ('success' in urlParams && !awaitingInitialPaymentMethodVerification)
    return (
      <div className="col-start-1 col-end-13 mb-4 sm:flex-initial md:w-2/3 lg:w-3/4">
        <Alert variant="success">
          <Alert.Description className="text-sm">
            Plan successfully updated.
          </Alert.Description>
        </Alert>
      </div>
    )

  return null
}

export default InfoMessageStripeCallback
