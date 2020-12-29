import { useEffect } from 'react'

import config from 'config'

function loadScript() {
  if (window.barecancel && window.barecancel.created) return // already installed
  window.barecancel = {
    created: true,
  }
  const script = document.createElement('script')
  script.src =
    'https://baremetrics-barecancel.baremetrics.com/js/application.js'
  script.async = !0
  document.body.appendChild(script)
}

function useBarecancel(accountDetails, cancelPlan) {
  const stripeCustomerId = accountDetails.subscriptionDetail?.customer
  useEffect(() => {
    loadScript()
    // update the object of barecancel to account for the change
    // of stripeCustomerId or the cancelPlan callback
    window.barecancel.params = {
      access_token_id: config.BAREMETRICS_TOKEN, // Cancellation API public key
      customer_oid: stripeCustomerId,
      comment_required: true,
      test_mode: config.NODE_ENV !== 'production',
      callback_send: cancelPlan,
    }
    console.log(config)
  }, [stripeCustomerId, cancelPlan])
}

export default useBarecancel
