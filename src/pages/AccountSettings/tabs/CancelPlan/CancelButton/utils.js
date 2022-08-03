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
      return resolve()
    }
    window.barecancel = { created: true }
    const script = document.createElement('script')
    script.src =
      'https://baremetrics-barecancel.baremetrics.com/js/application.js'
    script.dataset.testid = 'baremetrics-script'
    document.body.appendChild(script)
    return resolve()
  })
}

export function cleanupBaremetrics() {
  const scriptElement = document.querySelector(
    '[data-testid="baremetrics-script"]'
  )

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
