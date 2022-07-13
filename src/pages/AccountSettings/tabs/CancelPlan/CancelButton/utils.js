import { format, fromUnixTime } from 'date-fns'

export function getEndPeriod(unixPeriodEnd) {
  return (
    unixPeriodEnd &&
    format(fromUnixTime(unixPeriodEnd), 'MMMM do yyyy, h:m aaaa')
  )
}

export function loadBaremetrics() {
  return new Promise((resolve) => {
    if (window.barecancel && window.barecancel.created) return resolve()

    const script = document.createElement('script')
    script.src =
      'https://baremetrics-barecancel.baremetrics.com/js/application.js'
    script.async = !0
    script.dataset.testid = 'baremetrics-script'
    document.body.appendChild(script)
    script.onload = () => {
      window.barecancel.created = true
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
