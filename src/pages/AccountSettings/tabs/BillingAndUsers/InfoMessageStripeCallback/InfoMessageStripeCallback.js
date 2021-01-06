import qs from 'qs'
import { useLocation } from 'react-router-dom'

import Message from 'ui/Message'

// Stripe redirects to this page with ?success or ?cancel in the URL
// this component takes care of rendering a message if those message are present
function InfoMessageStripeCallback() {
  const urlParams = qs.parse(useLocation().search, {
    ignoreQueryPrefix: true,
  })

  if ('success' in urlParams)
    return (
      <div className="col-start-1 col-end-13 mb-4">
        <Message variant="success">
          <h2 className="text-lg">Subscription Update Successful</h2>
          <p className="text-sm">
            Your subscription has been updated successfully. If your plan
            details appear incorrect, please refresh the page.
          </p>
        </Message>
      </div>
    )

  if ('cancel' in urlParams)
    return (
      <div className="col-start-1 col-end-13 mb-4">
        <Message variant="error">
          <h2 className="text-lg">Subscription Update Failed</h2>
          <p className="text-sm">
            Your subscription did not update. If you believe this to be an
            error, please contact support@codecov.io.
          </p>
        </Message>
      </div>
    )

  return null
}

export default InfoMessageStripeCallback
