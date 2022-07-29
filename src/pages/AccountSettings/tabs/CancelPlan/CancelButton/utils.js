import { format, fromUnixTime } from 'date-fns'

export function getEndPeriod(unixPeriodEnd) {
  return (
    unixPeriodEnd &&
    format(fromUnixTime(unixPeriodEnd), 'MMMM do yyyy, h:m aaaa')
  )
}

/* eslint-disable max-statements */
export function loadBaremetrics() {
  return new Promise((resolve) => {
    if (window.barecancel && window.barecancel.created) {
      window.console &&
        console.error &&
        console.error('Barecancel snippet included twice.')
      resolve()
    } else {
      window.barecancel = { created: true }
      const script = document.createElement('script')
      script.src =
        'https://baremetrics-barecancel.baremetrics.com/js/application.js'
      script.async = true
      script.dataset.testid = 'baremetrics-script'
      const createdScript = document.getElementsByTagName('script')[0]
      createdScript.parentNode.insertBefore(script, createdScript)
      resolve()
    }
  })
}

export function cleanupBaremetrics() {
  const scriptElement = document.querySelector(
    '[data-testid="baremetrics-script"]'
  )
  // test this
  const stylesElement = document.querySelector(
    '[href="https://baremetrics-barecancel.baremetrics.com/css/barecancel.css"]' // Hacky but they auto add this style block with no identifier
  )

  if (!!scriptElement) {
    scriptElement.parentNode.removeChild(scriptElement)
    delete window.barecancel
  }

  if (!!stylesElement) {
    stylesElement.parentNode.removeChild(stylesElement)
  }
}
